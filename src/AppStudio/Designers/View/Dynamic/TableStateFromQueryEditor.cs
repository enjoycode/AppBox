using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class TableStateFromQueryEditor : View
{
    public TableStateFromQueryEditor(DesignController designController, DynamicDataTable tableState)
    {
        _designController = designController;
        _tableState = tableState;
        _entityTarget = MakeStateOfRoot();
        _entityTarget.AddListener(_ => _tableState.Reset()); //监听变更后调用DataChanged事件通知绑定对象重置(eg: 表格移除所有列)

        Child = BuildBody();

        if (_entityTarget.Value != null)
            _treeController.DataSource = DesignUtils.GetEntityModelMembers((EntityModel)_entityTarget.Value.Model);
        _selectsController.DataSource = TableFromQuery.Selects;
        _filtersController.DataSource = TableFromQuery.Filters;
        _ordersController.DataSource = TableFromQuery.Orders;
    }

    private readonly DesignController _designController;
    private readonly DynamicDataTable _tableState;
    private readonly TreeController<EntityMemberModel> _treeController = new();
    private readonly TabController<string> _tabController = new(["Selects", "Filters", "Orders"]);
    private readonly DataGridController<DynamicQuery.SelectItem> _selectsController = new();
    private readonly DataGridController<DataTableFromQuery.FilterItem> _filtersController = new();
    private readonly DataGridController<DynamicQuery.OrderByItem> _ordersController = new();
    private DataTableFromQuery TableFromQuery => (DataTableFromQuery)_tableState.Source;

    private readonly State<ModelNode?> _entityTarget;

    private RxProxy<ModelNode?> MakeStateOfRoot() => new(
        () =>
        {
            if (Expression.IsNull(TableFromQuery.Root))
                return null;
            var rootModelId = TableFromQuery.Root!.ModelId;
            return DesignHub.Current.DesignTree.FindModelNode(rootModelId);
        },
        node =>
        {
            TableFromQuery.Root = node == null ? null : new EntityExpression((EntityModel)node.Model, null);
            // clear query
            TableFromQuery.Selects.Clear();
            TableFromQuery.Filters.Clear();
            TableFromQuery.Orders.Clear();
            // reset members tree
            if (node != null)
                _treeController.DataSource = DesignUtils.GetEntityModelMembers((EntityModel)node.Model);
        }
    );

    private Row BuildBody() => new Row(VerticalAlignment.Top)
    {
        Children =
        [
            new Card()
            {
                Width = 200,
                Child = new Column()
                {
                    Children =
                    [
                        new Select<ModelNode>(_entityTarget)
                        {
                            Options = DesignUtils.GetAllSqlEntityModels(),
                            LabelGetter = node => $"{node.AppNode.Label}.{node.Label}"
                        },
                        new Expanded(new TreeView<EntityMemberModel>(_treeController, BuildTreeNode, m =>
                            {
                                var entityRef = (EntityRefModel)m;
                                if (entityRef.IsAggregationRef)
                                    throw new NotImplementedException();
                                var refModel =
                                    (EntityModel)DesignHub.Current.DesignTree.FindModelNode(entityRef.RefModelIds[0])!
                                        .Model;
                                return DesignUtils.GetEntityModelMembers(refModel);
                            })
                            {
                                AllowDrag = true,
                                OnAllowDrag = node => node.Data is not EntityRefModel
                            }
                        )
                    ]
                }
            },
            new Expanded(new Card()
            {
                Child = new TabView<string>(_tabController, BuildTab, BuildTabBody)
            })
        ]
    };

    private static void BuildTreeNode(TreeNode<EntityMemberModel> node)
    {
        var member = node.Data;
        node.Label = new Text(member.Name);
        node.Icon = member is EntityRefModel ? new(MaterialIcons.Folder) : new(MaterialIcons.TextFields);
        node.IsLeaf = member is not EntityRefModel;
        node.IsExpanded = true;
    }

    private static Widget BuildTab(string title, State<bool> isSelected)
    {
        var textColor = RxComputed<Color>.Make(isSelected,
            selected => selected ? Theme.FocusedColor : Colors.Black
        );

        return new Text(title) { TextColor = textColor };
    }

    private Widget BuildTabBody(string title)
    {
        return title switch
        {
            "Selects" => BuildDataGridForSelects(),
            "Filters" => BuildDataGridForFilters(),
            "Orders" => BuildDataGridForOrders(),
            _ => throw new NotSupportedException()
        };
    }

    private Widget BuildDataGridForSelects()
    {
        return new DataGrid<DynamicQuery.SelectItem>(_selectsController)
            {
                AllowDrop = true,
                OnAllowDrop = OnAllowDropTo,
                OnDrop = OnDropToSelects
            }
            .AddTextColumn("Item", t => t.Item.ToString())
            .AddButtonColumn("Action", (_, index) => new Button(icon: MaterialIcons.Clear)
            {
                Style = ButtonStyle.Transparent,
                Shape = ButtonShape.Pills,
                FontSize = 20,
                OnTap = _ => _selectsController.RemoveAt(index)
            }, 80);
    }

    private Widget BuildDataGridForFilters()
    {
        var options = new[] { ">", ">=", "<", "<=", "==", "!=", "Contains" };
        return new DataGrid<DataTableFromQuery.FilterItem>(_filtersController)
            {
                AllowDrop = true,
                OnAllowDrop = OnAllowDropTo,
                OnDrop = OnDropToFilters
            }
            .AddTextColumn("Item", t => t.Field.ToString())
            .AddHostColumn("Comparer", (s, _) => new Select<string>(MakeComparerState(s))
            {
                Options = options, Border = null
            }, 88)
            .AddHostColumn("State", (s, _) => new Select<string>(MakeTargetState(s))
            {
                Options = GetStates(s, _designController), Border = null
            })
            .AddButtonColumn("Action", (_, index) => new Button(icon: MaterialIcons.Clear)
            {
                Style = ButtonStyle.Transparent,
                Shape = ButtonShape.Pills,
                FontSize = 20,
                OnTap = _ => _filtersController.RemoveAt(index)
            }, 80);
    }

    private Widget BuildDataGridForOrders()
    {
        return new DataGrid<DynamicQuery.OrderByItem>(_ordersController)
            {
                AllowDrop = true,
                OnAllowDrop = OnAllowDropTo,
                OnDrop = OnDropToOrders
            }
            .AddTextColumn("Item", t => t.Field.ToString())
            .AddHostColumn("Descending", (s, _) => new Checkbox(MakeOrderByState(s)))
            .AddButtonColumn("Action", (_, index) => new Button(icon: MaterialIcons.Clear)
            {
                Style = ButtonStyle.Transparent,
                Shape = ButtonShape.Pills,
                FontSize = 20,
                OnTap = _ => _ordersController.RemoveAt(index)
            }, 80);
    }

    private static bool OnAllowDropTo(DragEvent dragEvent)
    {
        if (dragEvent.TransferItem is TreeNode<EntityMemberModel> { Data: EntityFieldModel })
            return true;
        return false;
    }

    private void OnDropToSelects(DragEvent dragEvent)
    {
        var treeNode = (TreeNode<EntityMemberModel>)dragEvent.TransferItem;
        //构建路径表达式
        var exp = DesignUtils.BuildExpressionFrom(treeNode, TableFromQuery.Root!);

        var selectItem = new DynamicQuery.SelectItem(exp.GetFieldAlias(), exp,
            DataCell.DataTypeFromEntityFieldType(((EntityFieldModel)treeNode.Data).FieldType));
        _selectsController.Add(selectItem);
    }

    private void OnDropToFilters(DragEvent dragEvent)
    {
        var treeNode = (TreeNode<EntityMemberModel>)dragEvent.TransferItem;
        var exp = DesignUtils.BuildExpressionFrom(treeNode, TableFromQuery.Root!);

        var filterItem = new DataTableFromQuery.FilterItem() { Field = exp };
        _filtersController.Add(filterItem);
    }

    private void OnDropToOrders(DragEvent dragEvent)
    {
        var treeNode = (TreeNode<EntityMemberModel>)dragEvent.TransferItem;
        var exp = DesignUtils.BuildExpressionFrom(treeNode, TableFromQuery.Root!);

        var orderItem = new DynamicQuery.OrderByItem(exp);
        _ordersController.Add(orderItem);
    }

    private static RxProxy<string?> MakeComparerState(DataTableFromQuery.FilterItem s) => new(
        () => s.Operator switch
        {
            BinaryOperatorType.Greater => ">",
            BinaryOperatorType.GreaterOrEqual => ">=",
            BinaryOperatorType.Less => "<",
            BinaryOperatorType.LessOrEqual => "<=",
            BinaryOperatorType.Equal => "==",
            BinaryOperatorType.NotEqual => "!=",
            BinaryOperatorType.Like => "Contains",
            _ => throw new NotSupportedException()
        },
        v => s.Operator = v switch
        {
            ">" => BinaryOperatorType.Greater,
            ">=" => BinaryOperatorType.GreaterOrEqual,
            "<" => BinaryOperatorType.Less,
            "<=" => BinaryOperatorType.LessOrEqual,
            "==" => BinaryOperatorType.Equal,
            "!=" => BinaryOperatorType.NotEqual,
            "Contains" => BinaryOperatorType.Like,
            _ => throw new NotSupportedException()
        });

    private static RxProxy<string?> MakeTargetState(DataTableFromQuery.FilterItem s) => new(
        () => s.State,
        v => s.State = v ?? string.Empty
    );

    private static RxProxy<bool> MakeOrderByState(DynamicQuery.OrderByItem s) =>
        new(() => s.Descending, v => s.Descending = v);

    private static string[] GetStates(DataTableFromQuery.FilterItem s, DesignController designController)
    {
        //TODO:暂只支持EntityField
        if (s.Field is EntityFieldExpression field)
        {
            var model = RuntimeContext.GetModel<EntityModel>(field.Owner!.ModelId);
            var member = (EntityFieldModel)model.GetMember(field.Name)!;
            var dynamicStateType = member.FieldType switch
            {
                EntityFieldType.String => DynamicStateType.String,
                EntityFieldType.DateTime => DynamicStateType.DateTime,
                EntityFieldType.Int => DynamicStateType.Int,
                EntityFieldType.Float => DynamicStateType.Float,
                EntityFieldType.Double => DynamicStateType.Double,
                _ => throw new NotImplementedException()
            };
            return designController.FindPrimitiveStates(dynamicStateType, member.AllowNull)
                .Select(state => state.Name)
                .ToArray();
        }

        return [];
    }
}