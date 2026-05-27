using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign.Diagram;

internal sealed class DiagramPropertyPanel : SingleChildWidget
{
    public DiagramPropertyPanel(DesignHub designContext)
    {
        _designContext = designContext;
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

    private readonly DesignHub _designContext;
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
            form.Children.Add(formItem);
            if (group.GroupName == "Layout" && formItem.Child is IValueStateEditor stateEditor)
                _layoutProperties.Add(stateEditor);
        }

        return new Collapse
        {
            Title = new Text(group.GroupName) { FontWeight = FontWeight.Bold },
            Body = form,
        };
    }

    private FormItem MakePropertyEditor(IDiagramProperty property)
    {
        var editor = property.EditorFactory(_designContext, property);
        return new FormItem(property.PropertyName, editor.Editor) { LabelVerticalAlignment = editor.VerticalAlignment };
    }

    internal void RefreshLayoutProperties()
    {
        //TODO: 暂刷新全部，考虑仅刷新指定属性
        foreach (var item in _layoutProperties)
            item.NotifyValueChanged();
    }
}