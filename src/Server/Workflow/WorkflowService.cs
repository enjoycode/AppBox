using AppBoxCore;
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
    /// 重启后重新启动执行中的工作流实例
    /// </summary>
    public void Restart()
    {
        //TODO: 从存储加载Status==Running的工作流实例
    }

    public async ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args) where T : struct, IAnyArgs
    {
        switch (method.Span)
        {
            case nameof(Start):
                await Start(args.GetLong()!.Value, args.GetString()!, (WorkflowParameters)args.GetObject()!);
                return AnyValue.Empty;
            default:
                throw new Exception($"Can't find method: {method}");
        }
    }
}