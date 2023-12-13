using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal sealed class ColumnSeriesEditor : CartesianSeriesEditor<ColumnSeriesSettings>
{
    public ColumnSeriesEditor(State<ColumnSeriesSettings> state,
        DataGridController<CartesianSeriesSettings> dataGridController,
        DesignElement element)
        : base(state, dataGridController, element) { }
}