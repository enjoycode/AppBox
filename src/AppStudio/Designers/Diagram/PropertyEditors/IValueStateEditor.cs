namespace AppBoxDesign.Diagram.PropertyEditors;

internal interface IValueStateEditor
{
    /// <summary>
    /// 非属性编辑器改变值时通知属性编辑器刷新
    /// </summary>
    void NotifyValueChanged();
}