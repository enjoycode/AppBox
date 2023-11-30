using System.Linq;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

/// <summary>
/// 用于下拉选择所有DataSet
/// </summary>
internal sealed class DataSetPropEditor : ValueEditorBase
{
    public DataSetPropEditor(State<string?> state, DesignController controller) : base(controller)
    {
        //TODO:监听DesignController.StatesChanged事件更新选项列表

        Child = new Select<string>(state)
        {
            Options = controller.GetAllDataSet().Select(d => d.Name).ToArray()
        };
    }
}