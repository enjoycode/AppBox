using AppBoxDesign.Diagram.PropertyEditors;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class DiagramPropertyPanel : SingleChildWidget
{
    public DiagramPropertyPanel()
    {
        IsLayoutTight = false;
        _typeName = new RxProxy<string>(() => _selectedItem?.TypeName ?? string.Empty);

        Child = new Container
        {
            FillColor = new Color(0xFFF3F3F3),
            Child = new Column
            {
                Alignment = HorizontalAlignment.Left,
                Children =
                [
                    //类型标题
                    new Container
                    {
                        Padding = EdgeInsets.All(5),
                        Height = 30,
                        Child = new Center
                        {
                            Child = new Text(_typeName) { FontWeight = FontWeight.Bold },
                        }
                    },
                    //属性分组列表
                    new ListView<DiagramPropertyGroup>(BuildPropertyGroupPanel, null, _listViewController)
                ]
            }
        };
    }

    private IDiagramItem? _selectedItem;
    private readonly State<string> _typeName;
    private readonly ListViewController<DiagramPropertyGroup> _listViewController = new();
    private readonly List<IValueStateEditor> _layoutProperties = [];

    internal void OnSelectedItem(IDiagramItem? item)
    {
        _selectedItem = item;
        _layoutProperties.Clear();

        if (item is IDiagramItemWithProperties ownsProperties)
            _listViewController.DataSource = ownsProperties.GetProperties().ToList();
        else
            _listViewController.DataSource = null;

        _typeName.NotifyValueChanged();
    }

    private Collapse BuildPropertyGroupPanel(DiagramPropertyGroup group, int index)
    {
        var form = new Form { LabelWidth = 118 };
        foreach (var property in group.Properties)
        {
            var formItem = MakePropertyEditor(property);
            form.Children.Add(MakePropertyEditor(property));
            if (group.GroupName == "Layout" && formItem.Child is IValueStateEditor stateEditor)
                _layoutProperties.Add(stateEditor);
        }

        return new Collapse
        {
            Title = new Text(group.GroupName) { FontWeight = FontWeight.Bold },
            Body = form,
        };
    }

    private static FormItem MakePropertyEditor(IDiagramProperty property) => property.EditorName switch
    {
        nameof(EnumEditor) => new FormItem(property.PropertyName, new EnumEditor(property)),
        nameof(CheckBoxEditor) => new FormItem(property.PropertyName, new CheckBoxEditor(property)),
        nameof(ColorEditor) => new FormItem(property.PropertyName, new ColorEditor(property)),
        nameof(ReportScalarEditor) => new FormItem(property.PropertyName, new ReportScalarEditor(property)),
        nameof(ReportTextEditor) => new FormItem(property.PropertyName, new ReportTextEditor(property)),
        nameof(ReportDataSourceEditor) => new FormItem(property.PropertyName, new ReportDataSourceEditor(property)),
        nameof(ReportDataSourcesEditor) => new FormItem(property.PropertyName, new ReportDataSourcesEditor(property))
            { LabelVerticalAlignment = VerticalAlignment.Top },
        _ => throw new Exception($"Unknown property editor: {property.EditorName}")
    };

    internal void RefreshLayoutProperties()
    {
        //TODO: 暂刷新全部，考虑仅刷新指定属性
        foreach (var item in _layoutProperties)
            item.NotifyValueChanged();
    }
}