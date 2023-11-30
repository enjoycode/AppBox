using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class PieSeriesPropEditor : ValueEditorBase
{
    public PieSeriesPropEditor(State<PieSeriesSettings?> state, DesignController controller) : base(controller)
    {
        _state = state;
        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly State<PieSeriesSettings?> _state;

    private async void OnTap(PointerEvent e)
    {
        //编辑副本
        var newOrCloned = _state.Value ?? new PieSeriesSettings();
        if (string.IsNullOrEmpty(newOrCloned.DataSet))
        {
            var firstDataSet = Controller.GetAllDataSet().FirstOrDefault();
            if (firstDataSet != null)
                newOrCloned.DataSet = firstDataSet.Name;
        }

        var dlg = new PieSeriesDialog(newOrCloned, Controller);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _state.Value = newOrCloned;
    }
}