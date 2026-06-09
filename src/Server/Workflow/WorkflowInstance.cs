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

    public Guid Id { get; set; }
    public string Title { get; set; }
    public StartActivity StartActivity { get; private set; }
    public Guid CreatorId { get; set; }
    public string CreatorName { get; set; }
    public DateTime CreateTime { get; set; }
    public Dictionary<string, AnyValue> Parameters { get; } = [];
    public WorkflowStatus Status { get; set; }

    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly List<RunningActivity> _running = [];
    private IWorkflowStore _store = null!;

#if DEBUG
    private SemaphoreSlim _suspendedOrFinished = new(0, 1);
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
            Status = WorkflowStatus.Suspended;
    }

    private async ValueTask OnNullResult(int branchIndex)
    {
        _running.RemoveAt(branchIndex);
        //检查所有分支执行情况
        CheckStatus();
        if (Status == WorkflowStatus.Finished)
        {
            await _store.FinishWorkflowInstance(this);
#if DEBUG
            _suspendedOrFinished.Release();
#endif
        }
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
        //检查所有分支是否全部挂起
        CheckStatus();
#if DEBUG
        if (Status == WorkflowStatus.Suspended)
            _suspendedOrFinished.Release();
#endif

        await _store.UpdateWorkflowInstance(this, bookmark);
    }

#if DEBUG
    /// <summary>
    /// 等待实例挂起或完成
    /// </summary>
    public Task WaitForSuspendedOrFinished() => _suspendedOrFinished.WaitAsync();
#endif

    internal void Resume(Guid bookmarkId, Guid ouid, IHumanActionResult result) { }

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

    public readonly struct RunningActivity
    {
        public required Activity Activity { get; init; }
        public Bookmark? Bookmark { get; init; }
        public bool IsWaiting => Bookmark != null || Activity is JoinActivity;
    }
}