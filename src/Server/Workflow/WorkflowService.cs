using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;
using static AppBox.Workflow.WorkflowLogger;

namespace AppBox.Workflow;

internal sealed class WorkflowService : IService
{
    public WorkflowService(IWorkflowStore workflowStore)
    {
        _store = workflowStore;
    }

    private readonly IWorkflowStore _store;
    private readonly List<WorkflowInstance> _running = [];
    private readonly SemaphoreSlim _lock = new(1, 1);

    /// <summary>
    /// 启动工作流实例
    /// </summary>
    public async Task Start(ModelId modelId, string title, WorkflowParameters parameters)
    {
        //TODO:检查启动权限
        var session = RuntimeContext.CurrentSession;
        if (session == null)
            throw new Exception("Can't find current session");

        //1.加载工作流模型
        var model = await RuntimeContext.Current.GetModelAsync<WorkflowModel>(modelId);
        //2.生成运行时Activity
        var visitor = new WorkflowRuntimeVisitor();
        var startActivity = (StartActivity)visitor.Visit(model.StartNode);
        //3.新建工作流实例保存并异步运行
        var instance = new WorkflowInstance(title, startActivity, session.LeafOrgUnitId, parameters);
        instance.ModelVersion = model.Version;
        instance.SuspendedOrFinished += OnInstanceSuspendedOrFinished;
        await instance.Start(_store);
        await AddToRunning(instance);
    }

    private async Task AddToRunning(WorkflowInstance instance)
    {
        await _lock.WaitAsync();
        try
        {
            _running.Add(instance);
            Logger.Debug($"Add running instance: {instance.Id}, remain: {_running.Count}");
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task RemoveFromRunning(Guid instanceId)
    {
        await _lock.WaitAsync();
        try
        {
            var index = _running.FindIndex(instance => instance.Id == instanceId);
            if (index >= 0)
            {
                _running.RemoveAt(index);
                Logger.Debug($"Remove running instance: {instanceId}, remain: {_running.Count}");
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    private async void OnInstanceSuspendedOrFinished(WorkflowInstance.SuspendedOrFinishedEventArgs args)
    {
        await RemoveFromRunning(args.InstanceId);
    }

    /// <summary>
    /// 人员操作恢复挂起的工作流实例
    /// </summary>
    public async Task Resume(Guid instanceId, Guid bookmarkId, string result, string? memo)
    {
        var session = RuntimeContext.CurrentSession;
        if (session == null) throw new Exception("Can't find current session");

        var instance = await GetInstance(instanceId);
        await instance.Resume(bookmarkId, new HumanActionResult(session.LeafOrgUnitId, session.Name, result, memo));
    }

    private async Task<WorkflowInstance> GetInstance(Guid instanceId)
    {
        await _lock.WaitAsync();
        try
        {
            var index = _running.FindIndex(instance => instance.Id == instanceId);
            if (index >= 0)
                return _running[index];

            var instance = await _store.FetchInstance(instanceId);
            instance.SuspendedOrFinished += OnInstanceSuspendedOrFinished;
            _running.Add(instance);
            return instance;
        }
        finally
        {
            _lock.Release();
        }
    }

    /// <summary>
    /// 重启后重新启动执行中的工作流实例
    /// </summary>
    public void Restart()
    {
        //TODO: 从存储加载Status==Running的工作流实例
    }

    public static Task<byte[]?> FetchParameters(Guid instanceId)
    {
        var q = new SqlQuery<WFInstance>(WFInstance.MODELID);
        q.Where(t => t.F(nameof(WFInstance.Id)) == instanceId);
        return q.ToScalarAsync<byte[]>(t => t.F(nameof(WFInstance.Parameters)));
    }

    public static Task<byte[]?> FetchTaskActions(Guid actorId, Guid instanceId, Guid bookmarkId)
    {
        var q = new SqlQuery<WFTask>(WFTask.MODELID);
        q.Where(t => t.F(nameof(WFTask.ActorId)) == actorId &
                     t.F(nameof(WFTask.InstanceId)) == instanceId &
                     t.F(nameof(WFTask.BookmarkId)) == bookmarkId);
        return q.ToScalarAsync<byte[]>(t => t.F(nameof(WFTask.Actions)));
    }

    public async ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args) where T : struct, IAnyArgs
    {
        switch (method.Span)
        {
            case nameof(Start):
                await Start(args.GetLong()!.Value, args.GetString()!, (WorkflowParameters)args.GetObject()!);
                return AnyValue.Empty;
            case nameof(Resume):
                await Resume(args.GetGuid()!.Value, args.GetGuid()!.Value, args.GetString()!, args.GetString());
                return AnyValue.Empty;
            case nameof(FetchParameters):
                return AnyValue.From(await FetchParameters(args.GetGuid()!.Value));
            case nameof(FetchTaskActions):
                return AnyValue.From(await FetchTaskActions(args.GetGuid()!.Value, args.GetGuid()!.Value,
                    args.GetGuid()!.Value));
            default:
                throw new Exception($"Can't find method: {method}");
        }
    }
}