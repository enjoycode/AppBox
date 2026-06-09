using System.Diagnostics;
using AppBoxCore;

namespace AppBox.Workflow;

public sealed class WorkflowInstance : ExpressionContext
{
    internal WorkflowInstance() { }

    public WorkflowInstance(string title, StartActivity startActivity,
        Guid creatorId, string creatorName, Dictionary<string, AnyValue> parameters)
    {
        Id = SequenceGuid.New();
        Title = title;
        Parameters = parameters;
        CreateTime = DateTime.Now;
        CreatorId = creatorId;
        CreatorName = creatorName;
        Status = WorkflowStatus.Running;
        StartActivity = startActivity;
    }

    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public StartActivity StartActivity { get; private set; }
    public Guid CreatorId { get; private set; }
    public string CreatorName { get; private set; }
    public DateTime CreateTime { get; private set; }
    public Dictionary<string, AnyValue> Parameters { get; } = [];
    public WorkflowStatus Status { get; private set; }

    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly List<RunningActivity> _running = [];
    private IWorkflowStore _store = null!;

#if DEBUG
    private readonly SemaphoreSlim _suspendedOrFinished = new(0, 1);
#endif

    internal async Task Start(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
        _running.Add(new RunningActivity() { Activity = StartActivity.Next });
        await _store.InsertWorkflowInstance(this);
        Continue(StartActivity.Next);
    }

    public void Restart(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
    }

    private void Continue(Activity activity)
    {
        Task.Run(async () =>
        {
            var result = activity.Execute(this);
            await _lock.WaitAsync();
            try
            {
                var branchIndex = -1;
                for (var i = 0; i < _running.Count; i++)
                {
                    if (_running[i].Activity == activity)
                    {
                        branchIndex = i;
                        break;
                    }
                }

                Debug.Assert(branchIndex >= 0);

                switch (result)
                {
                    case null: await OnNullResult(branchIndex); break;
                    case ErrorResult error: OnErrorResult(branchIndex, error); break;
                    case Activity next: await OnNextResult(branchIndex, next); break;
                    case Bookmark bookmark: await OnBookmarkResult(branchIndex, activity, bookmark); break;
                    default: throw new NotImplementedException();
                }
            }
            finally
            {
                _lock.Release();
            }
        });
    }

    private void CheckStatus()
    {
        //是否已完成
        if (_running.Count == 0)
        {
            Status = WorkflowStatus.Finished;
            return;
        }

        //是否全部挂起
        var allSuspended = true;
        foreach (var running in _running)
        {
            if (!running.IsWaiting)
            {
                allSuspended = false;
                break;
            }
        }

        if (allSuspended)
        {
            Status = WorkflowStatus.Suspended;
            return;
        }

        Status = WorkflowStatus.Running;
    }

    private async ValueTask OnNullResult(int branchIndex)
    {
        _running.RemoveAt(branchIndex);
        CheckStatus();
        await _store.UpdateWorkflowInstance(this, null);
        TryNotifySuspendedOrFinished();
    }

    private void OnErrorResult(int branchIndex, ErrorResult error)
    {
        throw new NotImplementedException();
    }

    private async Task OnNextResult(int branchIndex, Activity next)
    {
        _running[branchIndex] = new RunningActivity() { Activity = next };
        await _store.UpdateWorkflowInstance(this, null);
        Continue(next);
    }

    private async Task OnBookmarkResult(int branchIndex, Activity activity, Bookmark bookmark)
    {
        _running[branchIndex] = new RunningActivity() { Activity = activity, Bookmark = bookmark };
        CheckStatus();
        await _store.UpdateWorkflowInstance(this, bookmark);
        TryNotifySuspendedOrFinished();
    }

    [Conditional("DEBUG")]
    private void TryNotifySuspendedOrFinished()
    {
#if DEBUG
        if (Status is WorkflowStatus.Suspended or WorkflowStatus.Finished)
            _suspendedOrFinished.Release();
#endif
    }

#if DEBUG
    /// <summary>
    /// 等待实例挂起或完成
    /// </summary>
    public Task WaitForSuspendedOrFinished() => _suspendedOrFinished.WaitAsync();

    /// <summary>
    /// Only for test
    /// </summary>
    public IReadOnlyList<Bookmark> GetAllBookmarks() => _running
        .Where(r => r.Bookmark != null)
        .Select(r => r.Bookmark!)
        .ToList();
#endif

    internal async Task Resume(Guid bookmarkId, Guid ouid, IHumanActionResult result)
    {
        await _lock.WaitAsync();
        try
        {
            //find bookmark
            var branchIndex = -1;
            for (var i = 0; i < _running.Count; i++)
            {
                var running = _running[i];
                if (running.Bookmark != null && running.Bookmark.Id == bookmarkId)
                {
                    branchIndex = i;
                    break;
                }
            }

            if (branchIndex < 0)
                throw new Exception($"Can't find bookmark: [{Id}]-[{bookmarkId}]");

            var found = _running[branchIndex];
            //检查当前用户是否允许恢复操作
            found.Bookmark!.CheckCanResume(ouid);
            //开始恢复操作
            var resumeResult = found.Activity.Resume(this, result);
            //根据结果处理
            if (!resumeResult.Suspended)
            {
                if (resumeResult.Next == null)
                    _running.RemoveAt(branchIndex);
                else
                    _running[branchIndex] = new RunningActivity() { Activity = resumeResult.Next };
            }

            //保存实例
            CheckStatus();
            await _store.UpdateWorkflowInstance(this, resumeResult);
            //如果有下一活动继续执行
            if (resumeResult is { Suspended: false, Next: not null })
            {
                Continue(resumeResult.Next);
            }

            TryNotifySuspendedOrFinished();
        }
        finally
        {
            _lock.Release();
        }
    }

    #region ====Serialization for Context====

    public void SerializeContext<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        //Parameters
        ws.WriteVariant(Parameters.Count);
        foreach (var kv in Parameters)
        {
            ws.WriteString(kv.Key);
            kv.Value.SerializeTo(ref ws);
        }

        //StartActivity
        ws.SerializeActivity(StartActivity);

        //Running
        ws.WriteVariant(_running.Count);
        foreach (var running in _running)
        {
            ws.SerializeActivity(running.Activity);
            ws.WriteBool(running.Bookmark != null);
            running.Bookmark?.WriteTo(ref ws);
        }
    }

    public void DeserializeContext<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        //Parameters
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var key = rs.ReadString()!;
            var value = AnyValue.ReadFrom(ref rs);
            Parameters.Add(key, value);
        }

        //StartActivity
        StartActivity = (StartActivity)rs.DeserializeActivity()!;

        //Running
        count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var activity = rs.DeserializeActivity()!;
            Bookmark? bookmark = null;
            if (rs.ReadBool())
            {
                bookmark = new Bookmark();
                bookmark.ReadFrom(ref rs);
            }

            _running.Add(new RunningActivity() { Activity = activity, Bookmark = bookmark });
        }
    }

    #endregion

    internal readonly struct RunningActivity
    {
        public required Activity Activity { get; init; }
        public Bookmark? Bookmark { get; init; }
        public bool IsWaiting => Bookmark != null || Activity is JoinActivity;
    }
}