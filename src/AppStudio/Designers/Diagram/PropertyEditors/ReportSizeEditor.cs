using AppBox.Reporting.Drawing;
using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

//TODO: 暂简单实现

internal sealed class ReportSizeEditor : SingleChildWidget, IValueStateEditor
{
    public ReportSizeEditor(IDiagramProperty propertyItem)
    {
        var valueState = new RxProxy<string>(
            () => propertyItem.ValueGetter()?.ToString() ?? string.Empty,
            v =>
            {
                ReportSize size;
                try
                {
                    size = new ReportSize(v);
                }
                catch (Exception)
                {
                    size = ReportSize.Empty;
                }

                propertyItem.ValueSetter!(size);
                if (propertyItem.InvalidateAfterChanged)
                    propertyItem.Invalidate();
            }
        );
        ValueState = valueState;

        Child = new TextInput(valueState);
    }

    public State ValueState { get; }
}