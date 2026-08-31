using System.Collections.Generic;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal sealed class LineSeriesEditor : CartesianSeriesEditor<LineSeriesSettings>
{
    public LineSeriesEditor(State<LineSeriesSettings> state,
        DataGridController<IDynamicCartesianSeries> dataGridController,
        DesignElement element) : base(state, dataGridController, element) { }

    protected override IEnumerable<(string, State, Widget)> GetExtProps(State<LineSeriesSettings> state)
    {
        var smoothness = new RxProxy<double?>(() => state.Value.LineSmoothness, v => state.Value.LineSmoothness = v ?? 0.65);
        var fill = new RxProxy<bool>(() => state.Value.Fill, v => state.Value.Fill = v);

        yield return ("Smoothness", smoothness, new NumberInput<double>(smoothness)); //TODO: use Slider
        yield return ("Fill", fill, new Checkbox(fill));
    }
}