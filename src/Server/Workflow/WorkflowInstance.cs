using System.Diagnostics;
using AppBoxCore;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

/// <summary>
/// 运行时的工作流实例
/// </summary>
public sealed class WorkflowInstance : ExpressionContext
{
    internal WorkflowInstance() { }

    public WorkflowInstance(string title, StartActivity startActivity,
        Guid creatorId, Dictionary<string, AnyValue> parameters)
    {
        Id = SequenceGuid.New();
        Title = title;
        Parameters = parameters;
        CreateTime = DateTime.Now;
        CreatorId = creatorId;
        Status = WorkflowStatus.Running;
        StartActivity = startActivity;
    }

    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public StartActivity StartActivity { get; private set; } = null!;
    public Guid CreatorId { get; private set; }
    public DateTime CreateTime { get; private set; }
    public Dictionary<string, AnyValue> Parameters { get; } = [];
    public WorkflowStatus Status { get; private set; }

    public event Action<SuspendedOrFinishedEventArgs>? SuspendedOrFinished;

    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly List<RunningPath> _running = [];
    private readonly List<ExecuteLog> _executeLogs = [];
    private readonly List<ResumeLog> _resumeLogs = [];
    private IWorkflowStore _store = null!;

#if DEBUG
    private readonly SemaphoreSlim _suspendedOrFinishedWait = new(0, 1);
#endif

    internal async Task Start(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
        _running.Add(new RunningPath(StartActivity.Next));
        await _store.InsertWorkflowInstance(this);
        Continue(StartActivity.Next);
    }

    public void Restart(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
        //恢复执行各分支
        foreach (var running in _running)
        {
            if (!running.IsWaiting)
                Continue(running.Link);
        }
    }

    private void Continue(RuntimeFlowLink link)
    {
        Task.Run(async () =>
        {
            var result = await link.Target!.Execute(this);
            await _lock.WaitAsync();

            //先添加执行日志
            _executeLogs.Add(new ExecuteLog(link));

            //再处理执行结果
            try
            {
                var pathIndex = _running.FindIndex(r => ReferenceEquals(r.Link, link));
                Debug.Assert(pathIndex >= 0);

                switch (result)
                {
                    case NextResult next: await OnNextResult(pathIndex, next.Next); break;
                    case Bookmark bookmark: await OnBookmarkResult(pathIndex, link, bookmark); break;
                    case ForkResult forkResult: await OnForkResult(pathIndex, forkResult); break;
                    case JoinResult joinResult: await OnJoinResult(pathIndex, link, joinResult); break;
                    case ErrorResult error: OnErrorResult(pathIndex, error); break;
                    default: throw new NotImplementedException();
                }
            }
            catch (Exception ex)
            {
                Logger.Error($"[{Id}]{link.Target.GetType().Name}.Execute() Error: {ex.Message}");
                //TODO:
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

    private void OnErrorResult(int pathIndex, ErrorResult error)
    {
        throw new NotImplementedException();
    }

    private async Task OnNextResult(int pathIndex, RuntimeFlowLink? next)
    {
        if (next?.Target == null)
        {
            _running.RemoveAt(pathIndex);
            CheckStatus();
            await _store.UpdateWorkflowInstance(this, null);
            TryNotifySuspendedOrFinished();
            return;
        }

        _running[pathIndex] = new RunningPath(next);
        CheckStatus();
        await _store.UpdateWorkflowInstance(this, null);
        Continue(next);
    }

    private async Task OnBookmarkResult(int pathIndex, RuntimeFlowLink link, Bookmark bookmark)
    {
        _running[pathIndex] = new RunningPath(link, bookmark);
        CheckStatus();
        await _store.UpdateWorkflowInstance(this, bookmark);
        TryNotifySuspendedOrFinished();
    }

    private async Task OnForkResult(int pathIndex, ForkResult forkResult)
    {
        //先移除旧分支
        _running.RemoveAt(pathIndex);
        //再添加新分支
        foreach (var branch in forkResult.Branches)
            _running.Add(new RunningPath(branch));

        CheckStatus();
        await _store.UpdateWorkflowInstance(this, null);

        foreach (var branch in forkResult.Branches)
            Continue(branch);
    }

    private async Task OnJoinResult(int pathIndex, RuntimeFlowLink link, JoinResult joinResult)
    {
        Debug.Assert(link.Target is JoinActivity);
        //先判断是否所有分支到达
        if (!joinResult.IsAllJoined)
        {
            _running[pathIndex] = new RunningPath(link);
            CheckStatus();
            await _store.UpdateWorkflowInstance(this, null);
            return;
        }

        //先移除所有相同的Join分支
        var removed = _running.RemoveAll(r => ReferenceEquals(r.Link.Target, link.Target));
        Debug.Assert(removed == ((JoinActivity)link.Target).ForkBranchesCount);

        if (joinResult.Next?.Target == null)
        {
            CheckStatus();
            await _store.UpdateWorkflowInstance(this, null);
            TryNotifySuspendedOrFinished();
            return;
        }

        _running.Add(new RunningPath(joinResult.Next));
        CheckStatus();
        await _store.UpdateWorkflowInstance(this, null);
        Continue(joinResult.Next);
    }

    private void TryNotifySuspendedOrFinished()
    {
        if (Status == WorkflowStatus.Running) return;

        if (Status is WorkflowStatus.Suspended or WorkflowStatus.Finished)
        {
            SuspendedOrFinished?.Invoke(new SuspendedOrFinishedEventArgs() { InstanceId = Id, Status = Status });
#if DEBUG
            _suspendedOrFinishedWait.Release();
#endif
        }
    }

#if DEBUG
    /// <summary>
    /// 等待实例挂起或完成
    /// </summary>
    public Task WaitForSuspendedOrFinished() => _suspendedOrFinishedWait.WaitAsync();

    /// <summary>
    /// Only for test
    /// </summary>
    public IReadOnlyList<Bookmark> GetAllBookmarks() => _running
        .Where(r => r.Bookmark != null)
        .Select(r => r.Bookmark!)
        .ToList();
#endif

    internal async Task Resume(Guid bookmarkId, Guid actorId, IActorResult result)
    {
        await _lock.WaitAsync();
        try
        {
            //find bookmark
            var pathIndex = _running.FindIndex(r => r.Bookmark != null && r.Bookmark.Id == bookmarkId);
            if (pathIndex < 0)
                throw new Exception($"Can't find bookmark: [{Id}]-[{bookmarkId}]");

            var found = _running[pathIndex];
            //检查当前用户是否允许恢复操作
            found.Bookmark!.CheckCanResume(actorId);
            //开始恢复操作
            var resumeResult = await found.Link.Target!.Resume(this, result);
            //根据结果处理执行路径
            if (!resumeResult.Suspended)
            {
                if (resumeResult.Next?.Target == null)
                    _running.RemoveAt(pathIndex);
                else
                    _running[pathIndex] = new RunningPath(resumeResult.Next);
            }

            //添加恢复日志
            _resumeLogs.Add(new ResumeLog(found.Link.Target!, result));

            //保存实例
            CheckStatus();
            await _store.UpdateWorkflowInstance(this, bookmarkId, actorId, resumeResult);
            //如果有下一活动继续执行
            if (resumeResult is { Suspended: false, Next.Target: not null })
                Continue(resumeResult.Next);

            TryNotifySuspendedOrFinished();
        }
        catch (Exception ex)
        {
            Logger.Error($"[{Id}]Resume: {ex.Message}");
            //TODO:
        }
        finally
        {
            _lock.Release();
        }
    }

    #region ====Serialization for Context====

    public void SerializeContext<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        // //Parameters
        // ws.WriteVariant(Parameters.Count);
        // foreach (var kv in Parameters)
        // {
        //     ws.WriteString(kv.Key);
        //     kv.Value.SerializeTo(ref ws);
        // }

        //StartActivity
        ws.SerializeActivity(StartActivity);

        //Running
        ws.WriteVariant(_running.Count);
        foreach (var running in _running)
        {
            ws.SerializeLink(running.Link);
            ws.WriteBool(running.Bookmark != null);
            running.Bookmark?.WriteTo(ref ws);
        }

        //Execute Logs
        ws.WriteVariant(_executeLogs.Count);
        foreach (var log in _executeLogs) log.WriteTo(ref ws);
        //Resume Logs
        ws.WriteVariant(_resumeLogs.Count);
        foreach (var log in _resumeLogs) log.WriteTo(ref ws);

        ws.WriteFieldEnd(); //保留
    }

    public void DeserializeContext<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        // //Parameters
        // var count = rs.ReadVariant();
        // for (var i = 0; i < count; i++)
        // {
        //     var key = rs.ReadString()!;
        //     var value = AnyValue.ReadFrom(ref rs);
        //     Parameters.Add(key, value);
        // }

        //StartActivity
        StartActivity = (StartActivity)rs.DeserializeActivity()!;

        //Running
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var link = rs.DeserializeLink()!;
            Bookmark? bookmark = null;
            if (rs.ReadBool())
            {
                bookmark = new Bookmark();
                bookmark.ReadFrom(ref rs);
            }

            _running.Add(new RunningPath(link, bookmark));
        }

        //Execute Logs
        count = rs.ReadVariant();
        for (var i = 0; i < count; i++) _executeLogs.Add(ExecuteLog.ReadFrom(ref rs));
        //Resume Logs
        count = rs.ReadVariant();
        for (var i = 0; i < count; i++) _resumeLogs.Add(ResumeLog.ReadFrom(ref rs));

        rs.ReadFieldId(); //保留
    }

    public byte[] GetContextData()
    {
        using var ms = new MemoryStream();
        var ws = new SystemWriteStream(ms);
        SerializeContext(ref ws);
        return ms.ToArray();
    }

    #endregion

    /// <summary>
    /// 正在执行的路径
    /// </summary>
    private readonly struct RunningPath
    {
        public RunningPath(RuntimeFlowLink link, Bookmark? bookmark = null)
        {
            Debug.Assert(link.Target != null);
            Link = link;
            Bookmark = bookmark;
        }

        public RuntimeFlowLink Link { get; }

        public Bookmark? Bookmark { get; }

        public bool IsWaiting => Bookmark != null || Link.Target is JoinActivity;
    }

    public readonly struct SuspendedOrFinishedEventArgs
    {
        public required Guid InstanceId { get; init; }
        public required WorkflowStatus Status { get; init; }
    }

    /// <summary>
    /// 执行日志(记录流转过程)
    /// </summary>
    public readonly struct ExecuteLog
    {
        public ExecuteLog(RuntimeFlowLink link, DateTime? createTime = null)
        {
            CreateTime = createTime ?? DateTime.Now;
            Link = link;
        }

        public DateTime CreateTime { get; }
        public RuntimeFlowLink Link { get; }

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.WriteDateTime(CreateTime);
            ws.SerializeLink(Link);
            ws.WriteFieldEnd(); //保留
        }

        public static ExecuteLog ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            var createTime = rs.ReadDateTime();
            var link = rs.DeserializeLink()!;
            rs.ReadFieldId(); //保留
            return new ExecuteLog(link, createTime);
        }
    }

    /// <summary>
    /// 恢复日志(记录流转过程)
    /// </summary>
    public readonly struct ResumeLog
    {
        public ResumeLog(Activity activity, IActorResult result, DateTime? createTime = null)
        {
            Activity = activity;
            Result = result;
            CreateTime = createTime ?? DateTime.Now;
        }

        public DateTime CreateTime { get; }
        public Activity Activity { get; }
        public IActorResult Result { get; }

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.WriteDateTime(CreateTime);
            ws.SerializeActivity(Activity);
            ws.WriteByte(Result.TypeId);
            Result.WriteTo(ref ws);
        }

        public static ResumeLog ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            var createTime = rs.ReadDateTime();
            var activity = rs.DeserializeActivity()!;
            var typeId = rs.ReadByte();
            var result = IActorResult.Make(typeId);
            result.ReadFrom(ref rs);
            return new ResumeLog(activity, result, createTime);
        }
    }
}