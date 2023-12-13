using System.Linq;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

/// <summary>
/// 用于下拉选择所有DataSet
/// </summary>
internal sealed class DataSetPropEditor : ValueEditorBase
{
    public DataSetPropEditor(State<string?> state, DesignElement element) : base(element)
    {
        //TODO:监听DesignController.StatesChanged事件(eg: 状态设计器添加了新的DataSet)更新选项列表

        Child = new Select<string>(state)
        {
            Options = element.Controller.GetAllDataSet().Select(d => d.Name).ToArray()
        };
    }
}