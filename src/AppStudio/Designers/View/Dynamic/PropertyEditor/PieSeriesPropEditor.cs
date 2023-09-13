using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class PieSeriesPropEditor : SingleChildWidget
{
    public PieSeriesPropEditor(State<PieSeriesSettings?> state)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<PieSeriesSettings?> _state;

    private DesignController? DesignController =>
        Parent is PixUI.Dynamic.Design.PropertyEditor propertyEditor ? propertyEditor.DesignController : null;

    private async void OnTap(PointerEvent e)
    {
        var designController = DesignController;
        if (designController == null) return;

        //编辑副本
        var newOrCloned = _state.Value ?? new PieSeriesSettings();
        if (string.IsNullOrEmpty(newOrCloned.DataSet))
        {
            var firstDataSet = designController.GetAllDataSet().FirstOrDefault();
            if (firstDataSet != null)
                newOrCloned.DataSet = firstDataSet.Name;
        }

        var dlg = new PieSeriesDialog(newOrCloned, designController);
        var canceled = await dlg.ShowAndWaitClose();
        if (canceled) return;

        _state.Value = newOrCloned;
    }
}