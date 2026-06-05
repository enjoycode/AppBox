using AppBoxCore;

namespace AppBox.Workflow;

internal sealed class WorkflowService
{
    /// <summary>
    /// 启动工作流实例
    /// </summary>
    public async Task StartAsync(ModelId modelId, string title, Dictionary<string, AnyValue> parameters)
    {
        //TODO:检查启动权限
        
        //1.加载工作流模型
        var model = await RuntimeContext.Current.GetModelAsync<WorkflowModel>(modelId);
        //2.生成运行时Activity
        

        throw new NotImplementedException();
    }
}