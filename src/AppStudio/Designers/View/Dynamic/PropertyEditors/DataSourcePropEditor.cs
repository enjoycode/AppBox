using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

/// <summary>
/// 用于下拉选择所有DataSource
/// </summary>
// ReSharper disable once ClassNeverInstantiated.Global
internal sealed class DataSourcePropEditor : ValueEditorBase
{
    public DataSourcePropEditor(State<string?> state, DesignElement element) : base(element)
    {
        //TODO:监听DesignController.StatesChanged事件(eg: 状态设计器添加了新的DataSource)更新选项列表

        Child = new Select<string>(state)
        {
            Options = element.Controller.FindDataTableStates().Select(d => d.Name).ToArray()
        };
    }
}