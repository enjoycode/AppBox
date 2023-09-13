using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class ColumnSeriesEditor : SeriesEditor<ColumnSeriesSettings>
{
    public ColumnSeriesEditor(State<ColumnSeriesSettings> state,
        DataGridController<CartesianSeriesSettings> dataGridController, DesignController designController)
        : base(state, dataGridController, designController) { }
}