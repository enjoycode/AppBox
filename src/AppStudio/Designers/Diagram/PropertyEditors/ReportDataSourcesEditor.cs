using AppBox.Reporting;
using PixUI;

namespace AppBoxDesign.Diagram.PropertyEditors;

/// <summary>
/// 报表的数据源属性编辑器
/// </summary>
internal sealed class ReportDataSourcesEditor : SingleChildWidget
{
    public ReportDataSourcesEditor(IDiagramProperty propertyItem)
    {
        _propertyItem = propertyItem;
        _listController = new ListViewController<IDataSource>();
        _dataSources = (IList<IDataSource>)_propertyItem.ValueGetter()!;

        Height = 100;

        Child = new Column()
        {
            Spacing = 5,
            Alignment = HorizontalAlignment.Left,
            Children =
            [
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button(icon: MaterialIcons.Add),
                        new Button(icon: MaterialIcons.Edit),
                        new Button(icon: MaterialIcons.Delete)
                    ]
                },

                new ListView<IDataSource>(
                    (item, index) => new DataSourceItemWidget(item, index, _selectedIndex),
                    _dataSources, _listController)
            ]
        };
    }

    private readonly IDiagramProperty _propertyItem;
    private readonly IList<IDataSource> _dataSources;
    private readonly ListViewController<IDataSource> _listController;
    private readonly State<int> _selectedIndex = -1;

    public override void Paint(Canvas canvas, IDirtyArea? area = null)
    {
        // draw border
        var cmdBarHeight = 35;
        var paint = PixUI.Paint.Shared(Colors.Silver, PaintStyle.Stroke);
        canvas.DrawRect(Rect.FromLTWH(0, cmdBarHeight, W, H - cmdBarHeight), paint);

        base.Paint(canvas, area);
    }

    private class DataSourceItemWidget : Widget, IMouseRegion
    {
        internal DataSourceItemWidget(IDataSource item, int index, State<int> selectedState)
        {
            _item = item;
            _itemIndex = index;
            _selectedState = selectedState;
            _selectedState.AddListener(_ => Repaint());

            MouseRegion = new MouseRegion(() => Cursors.Hand);
            MouseRegion.HoverChanged += OnHoverChanged;
            MouseRegion.PointerTap += _ => _selectedState.Value = _itemIndex;
        }

        private bool _isHover;
        private readonly IDataSource _item;
        private readonly int _itemIndex;
        private readonly State<int> _selectedState;
        private Paragraph? _paragraph;

        public MouseRegion MouseRegion { get; }

        private void OnHoverChanged(bool isHover)
        {
            _isHover = isHover;
            Repaint();
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            SetSize(availableWidth, 20);
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            if (_selectedState.Value == _itemIndex)
                canvas.DrawRect(Rect.FromLTWH(0, 0, W, H), PixUI.Paint.Shared(Theme.FocusedColor));
            else if (_isHover)
                canvas.DrawRect(Rect.FromLTWH(0, 0, W, H), PixUI.Paint.Shared(Theme.AccentColor));

            _paragraph ??= TextPainter.BuildParagraph(_item.Name, float.PositiveInfinity,
                12, Colors.Black, null, 1, true);

            canvas.DrawParagraph(_paragraph, 2, (H - _paragraph.Height) / 2);
        }
    }

    private class ReportDataSourceDialog : Dialog
    {
        public ReportDataSourceDialog(IList<IDataSource> dataSources)
        {
            Title.Value = "Report DataSource";
            Width = 630;
            Height = 450;

            _dataSources = dataSources;

            //_dataSources.Add(new ObjectDataSource() { Name = "Orders" });

            MakeTreeDataSource();
        }

        private readonly IList<IDataSource> _dataSources;
        private readonly State<ModelNode?> _selectedEntity = State<ModelNode>.Default();
        private readonly TreeController<ITreeNode> _treeController = new();

        private void MakeTreeDataSource()
        {
            var nodes = new List<ITreeNode>();
            foreach (var dataSource in _dataSources)
            {
                var node = new DataSourceNode(dataSource.Name);
                nodes.Add(node);
            }

            _treeController.DataSource = nodes;
        }

        protected override Widget BuildFooter() => new Container
        {
            Height = Button.DefaultHeight + 20 + 20,
            Padding = EdgeInsets.All(20),
            Child = new Row(VerticalAlignment.Middle, 20)
            {
                Children =
                {
                    new Expanded(),
                    new Button("Close") { Width = 80, OnTap = _ => Close(DialogResult.OK) }
                }
            }
        };

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new Column()
                {
                    Spacing = 10,
                    Children =
                    [
                        BuildCommandBar(),
                        BuildContent(),
                    ]
                }
            };
        }

        private Widget BuildCommandBar() => new Row()
        {
            Spacing = 5,
            Children =
            [
                new Select<ModelNode>(_selectedEntity)
                {
                    Options = DesignUtils.GetAllSqlEntityModels(),
                    LabelGetter = node => $"{node.AppNode.Label}.{node.Label}",
                    Width = 200,
                },
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button("Add"),
                        new Button("Remove")
                    ]
                },
                new ButtonGroup()
                {
                    Children =
                    [
                        new Button("Add Field"),
                        new Button("Remove Field")
                    ]
                }
            ]
        };

        private Row BuildContent() => new(VerticalAlignment.Top)
        {
            Children =
            [
                new Card
                {
                    Width = 250,
                    Child = new TreeView<ITreeNode>(_treeController, BuildTreeNode,
                        s => ((DataSourceNode)s).Fields)
                    {
                        // AllowDrag = true,
                        // AllowDrop = true,
                        // OnAllowDrag = OnAllowDrag,
                        // OnAllowDrop = OnAllowDrop,
                        // OnDrop = OnDrop
                    }
                },

                new Expanded(new Card
                    {
                        Child = new Container
                        {
                            // Child = new Conditional<TreeNodeType?>(_currentNode)
                            //     .When(r => r?.Data.Type == TableColumnSettings.Text,
                            //         () => new TextColumnEditor(_currentText, _element))
                            //     .When(r => r?.Data.Type == TableColumnSettings.Group,
                            //         () => new TableColumnEditor<GroupColumnSettings>(_currentGroup, _element))
                            //     .When(r => r?.Data.Type == TableColumnSettings.RowNum,
                            //         () => new TableColumnEditor<RowNumColumnSettings>(_currentRowNum, _element))
                        }
                    }
                ),
            ]
        };

        private static void BuildTreeNode(TreeNode<ITreeNode> node)
        {
            var nameState = new RxProxy<string>(() => node.Data.Name, v => node.Data.Name = v);
            node.IsExpanded = true;
            node.IsLeaf = node.Data is FieldNode;
            node.Label = new Text(nameState);
            node.Icon = node.Data switch
            {
                DataSourceNode => new(MaterialIcons.TableRows),
                _ => new(MaterialIcons.TextFields)
            };
        }

        private interface ITreeNode
        {
            string Name { get; set; }
        }

        private class DataSourceNode : ITreeNode
        {
            public DataSourceNode(string datasourceName)
            {
                Name = datasourceName;
            }

            public string Name { get; set; }
            public List<ITreeNode> Fields { get; } = [];
        }

        private class FieldNode : ITreeNode
        {
            public string Name { get; set; } = string.Empty;
        }
    }
}