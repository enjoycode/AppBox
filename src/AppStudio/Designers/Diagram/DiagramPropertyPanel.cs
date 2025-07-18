using AppBox.Reporting;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class DiagramPropertyPanel : SingleChildWidget
{
    public DiagramPropertyPanel()
    {
        _typeName = new RxProxy<string>(() => _selectedItem?.TypeName ?? string.Empty);

        Child = new Container
        {
            FillColor = new Color(0xFFF3F3F3),
            Child = new Column
            {
                Children =
                [
                    new Text(_typeName) { FontWeight = FontWeight.Bold }
                ]
            }
        };
    }

    private IDiagramItem? _selectedItem;
    private readonly State<string> _typeName;

    internal void OnSelectedItem(IDiagramItem? item)
    {
        _selectedItem = item;
        _typeName.NotifyValueChanged();
    }
}