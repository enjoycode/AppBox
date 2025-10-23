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

        Child = new Button("...") { Width = float.MaxValue, OnTap = OnTap };
    }

    private readonly IDiagramProperty _propertyItem;

    private void OnTap(PointerEvent _)
    {
        var dataSources = (IList<IDataSource>)_propertyItem.ValueGetter()!;
        var dlg = new ReportDataSourceDialog(dataSources);
        dlg.ShowAsync();
    }

    private class ReportDataSourceDialog : Dialog
    {
        public ReportDataSourceDialog(IList<IDataSource> dataSources)
        {
            Title.Value = "Report DataSources";
            Width = 580;
            Height = 400;

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