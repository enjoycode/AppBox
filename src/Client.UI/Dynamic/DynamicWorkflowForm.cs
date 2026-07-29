using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

/// <summary>
/// 动态工作流表单
/// </summary>
public sealed class DynamicWorkflowForm : IWorkflowForm
{
    //TODO: 尚未实现
    
    public Size ViewSize { get; }
    
    public ValueTask BeforeSubmit(HumanAction action)
    {
        throw new NotImplementedException();
    }
}