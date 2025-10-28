using AppBox.Reporting.Drawing;
using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

internal sealed class ReportScalarEditor : SingleChildWidget, IValueStateEditor
{
    public ReportScalarEditor(IDiagramProperty propertyItem)
    {
        _propertyItem = propertyItem;
        NotifyValueChanged();

        //暂用TextInput简单实现
        Child = new TextInput(_inputState)
        {
            OnCommitChanges = v =>
            {
                try
                {
                    var res = new Scalar(v);
                    propertyItem.ValueSetter!(res);
                    if (propertyItem.InvalidateAfterChanged)
                        propertyItem.Invalidate();
                }
                catch (Exception)
                {
                    NotifyValueChanged(); //can't parse to ReportSize, reset to old value
                }
            }
        };
    }

    private readonly State<string> _inputState = string.Empty;
    private readonly IDiagramProperty _propertyItem;

    public void NotifyValueChanged()
    {
        _inputState.Value = _propertyItem.ValueGetter()?.ToString() ?? string.Empty;
    }
}