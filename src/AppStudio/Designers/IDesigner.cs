using AppBoxDesign.Debugging;
using PixUI;

namespace AppBoxDesign;

internal interface IDesigner
{
    Task SaveAsync();

    Task RefreshAsync();

    /// <summary>
    /// 跳转至指定位置
    /// </summary>
    void GotoLocation(ILocation location);
}

[TSInterfaceOf]
internal interface IModelDesigner : IDesigner
{
    ModelNode ModelNode { get; }

    /// <summary>
    /// 获取大纲视图
    /// </summary>
    Widget? GetOutlinePad();

    /// <summary>
    /// 获取工具箱视图
    /// </summary>
    Widget? GetToolboxPad();
}

internal interface ICodeDesigner : IModelDesigner
{
    void GotoProblem(CodeProblem problem);
}

internal interface IDebuggableCodeDesigner : ICodeDesigner
{
    void OnDebugEvent(IDebugEventArgs eventArgs);
}