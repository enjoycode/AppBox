using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class LineSeriesEditor : SeriesEditor<LineSeriesSettings>
{
    public LineSeriesEditor(State<LineSeriesSettings> state,
        DataGridController<CartesianSeriesSettings> dataGridController,
        DesignController designController) : base(state, dataGridController, designController) { }

    protected override IEnumerable<(string, State, Widget)> GetExtProps(State<LineSeriesSettings> state)
    {
        var smoothness = new RxProxy<double?>(() => state.Value.Smoothness, v => state.Value.Smoothness = v);
        var fill = new RxProxy<bool>(() => state.Value.Fill, v => state.Value.Fill = v);

        yield return ("Smoothness", smoothness, new NumberInput<double>(smoothness)); //TODO: use Slider
        yield return ("Fill", fill, new Checkbox(fill));
    }
}