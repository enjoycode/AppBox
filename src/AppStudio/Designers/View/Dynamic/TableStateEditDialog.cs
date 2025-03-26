using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class TableStateEditDialog : Dialog
{
    public TableStateEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataTable Settings";
        Width = 580;
        Height = 430;

        _designController = designController;
        //初始化状态
        if (state.Value == null)
        {
            _tableState = new DynamicTableState();
            _tableState.Source = new DynamicTableFromQuery(); //默认来源动态查询
            state.Value = _tableState;
        }
        else
        {
            _tableState = (DynamicTableState)state.Value;
        }

        _isFromQuery = MakeStateOfIsFromQuery();
    }

    private readonly DesignController _designController;
    private readonly DynamicTableState _tableState;
    private readonly State<bool> _isFromQuery;

    private RxProxy<bool> MakeStateOfIsFromQuery() => new(
        () => _tableState.Source.SourceType == DynamicTableState.FromQuery,
        v =>
        {
            if (v)
            {
                if (_tableState.Source is DynamicTableFromQuery)
                    return;
                _tableState.Source = new DynamicTableFromQuery();
            }
            else
            {
                if (_tableState.Source is DynamicTableFromService)
                    return;
                _tableState.Source = new DynamicTableFromService();
            }
        });

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Column()
        {
            Children =
            [
                new Row()
                {
                    Children =
                    [
                        new Radio(_isFromQuery),
                        new Text("From Query"),
                        new Radio(_isFromQuery.ToReversed()),
                        new Text("From Service"),
                    ]
                },
                new IfConditional(_isFromQuery,
                    () => new TableStateFromQueryEditor(_designController, _tableState),
                    () => new TableStateFromServiceEditor(_designController, _tableState)
                )
            ]
        }
    };

    // protected override bool OnClosing(string result)
    // {
    //     if (result != DialogResult.OK) return false;
    //     
    //     //检查是否全部绑定参数
    // }
}

internal sealed class TableStateFromQueryEditor : View
{
    public TableStateFromQueryEditor(DesignController designController, DynamicTableState tableState)
    {
        _designController = designController;
        _tableState = tableState;
        _entityTarget = MakeStateOfRoot();

        Child = BuildBody();

        if (_entityTarget.Value != null)
        {
            _treeController.DataSource = GetEntityModelMembers((EntityModel)_entityTarget.Value.Model);
            _selectsController.DataSource = TableFromQuery.Selects;
        }
    }

    private readonly DesignController _designController;
    private readonly DynamicTableState _tableState;
    private readonly TreeController<EntityMemberModel> _treeController = new();
    private readonly TabController<string> _tabController = new(["Selects", "Filters", "Orders"]);
    private readonly DataGridController<DynamicQuery.SelectItem> _selectsController = new();
    private DynamicTableFromQuery TableFromQuery => (DynamicTableFromQuery)_tableState.Source;

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
            TableFromQuery.Filters = null;
            TableFromQuery.Orders = null;
            // reset members tree
            if (node != null)
                _treeController.DataSource = GetEntityModelMembers((EntityModel)node.Model);
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
                            Options = DesignHub.Current.DesignTree.FindNodesByType(ModelType.Entity),
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
                                return GetEntityModelMembers(refModel);
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

    private static List<EntityMemberModel> GetEntityModelMembers(EntityModel model)
    {
        var list = new List<EntityMemberModel>();
        foreach (var member in model.Members)
        {
            switch (member)
            {
                case EntityFieldModel:
                    list.Add(member);
                    break;
                case EntityRefModel entityRef:
                {
                    //暂排除聚合引用及循环引用
                    if (!entityRef.IsAggregationRef && !entityRef.RefModelIds.Contains(model.Id))
                        list.Add(member);
                    break;
                }
            }
        }

        return list;
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
            _ => new Text(title)
        };
    }

    private Widget BuildDataGridForSelects()
    {
        return new DataGrid<DynamicQuery.SelectItem>(_selectsController)
            {
                AllowDrop = true,
                OnAllowDrop = OnAllowDropToSelects,
                OnDrop = OnDropToSelects
            }
            .AddTextColumn("Item", t => t.Item.ToString())
            .AddButtonColumn("Action", (_, index) => new Button(icon: MaterialIcons.Clear)
            {
                Style = ButtonStyle.Transparent,
                Shape = ButtonShape.Pills,
                FontSize = 20,
                OnTap = _ => { _selectsController.RemoveAt(index); }
            }, 80);
    }

    private static bool OnAllowDropToSelects(DragEvent dragEvent)
    {
        if (dragEvent.TransferItem is TreeNode<EntityMemberModel> { Data: EntityFieldModel })
            return true;
        return false;
    }

    private void OnDropToSelects(DragEvent dragEvent)
    {
        var treeNode = (TreeNode<EntityMemberModel>)dragEvent.TransferItem;

        //构建路径表达式
        var temp = treeNode;
        var list = new List<EntityMemberModel>();
        while (temp != null)
        {
            list.Insert(0, temp.Data);
            temp = treeNode.ParentNode;
        }

        EntityPathExpression exp = TableFromQuery.Root!;
        foreach (var item in list)
        {
            exp = exp[item.Name];
        }

        var selectItem = new DynamicQuery.SelectItem(exp.GetFieldAlias(), exp,
            DynamicField.FlagFromEntityFieldType(((EntityFieldModel)treeNode.Data).FieldType));
        _selectsController.Add(selectItem);
    }
}

internal sealed class TableStateFromServiceEditor : View
{
    public TableStateFromServiceEditor(DesignController designController, DynamicTableState tableState)
    {
        _designController = designController;
        _tableState = tableState;
        _service = new RxProxy<string>(() => TableFromService.Service, v => TableFromService.Service = v);

        Child = BuildBody();
    }

    //TODO: 服务选择

    private readonly DesignController _designController;
    private readonly DynamicTableState _tableState;
    private readonly DataGridController<ServiceMethodParameterInfo> _dgController = new();
    private readonly State<string> _service;
    private DynamicTableFromService TableFromService => (DynamicTableFromService)_tableState.Source;

    protected override void OnMounted()
    {
        base.OnMounted();
        //如果service path 有值自动填充参数列表
        if (!string.IsNullOrEmpty(_service.Value))
            FetchMethodInfo(false);
    }

    private Widget BuildBody() => new Form()
    {
        LabelWidth = 100,
        Children =
        {
            new FormItem("Service:", new Row
            {
                Children =
                {
                    new Expanded(new TextInput(_service)),
                    new Button(icon: MaterialIcons.Info)
                    {
                        Width = 22,
                        FontSize = 20,
                        Style = ButtonStyle.Transparent,
                        Shape = ButtonShape.Pills,
                        OnTap = _ => FetchMethodInfo(true)
                    },
                    new Button(icon: MaterialIcons.NextPlan)
                    {
                        Width = 22,
                        FontSize = 20,
                        Style = ButtonStyle.Transparent,
                        Shape = ButtonShape.Pills,
                    }
                }
            }),
            new FormItem("Parameters:", BuildDataGrid())
            {
                LabelVerticalAlignment = VerticalAlignment.Top,
            }
        }
    };

    private Widget BuildDataGrid() => new DataGrid<ServiceMethodParameterInfo>(_dgController)
        .AddTextColumn("Name", a => a.Name)
        .AddTextColumn("Type", a => a.Type)
        .AddHostColumn("State", BuildStateCell);

    private Widget BuildStateCell(ServiceMethodParameterInfo para, int index)
    {
        var rs = new RxProxy<string?>(
            () => index < 0 || index >= TableFromService.Arguments.Length
                ? null
                : TableFromService.Arguments[index],
            v =>
            {
                if (index >= 0 && index < TableFromService.Arguments.Length)
                    TableFromService.Arguments[index] = v;
            });

        string[] options;
        try
        {
            var noneNullableValueType = para.ConvertToRuntimeType(out var allowNull);
            var stateType = DynamicState.GetStateTypeByValueType(noneNullableValueType);
            options = _designController.FindStatesByValueType(stateType, allowNull)
                .Select(s => s.Name)
                .ToArray();
        }
        catch (Exception e)
        {
            Log.Debug(e.Message);
            options = [];
        }

        return new Select<string>(rs) { Options = options };
    }

    private async void FetchMethodInfo(bool byTap)
    {
        if (byTap)
            TableFromService.Arguments = [];

        ServiceMethodInfo methodInfo;
        try
        {
            methodInfo = await GetServiceMethod.GetByName(DesignHub.Current, _service.Value);
        }
        catch (Exception)
        {
            Notification.Error("无法获取服务方法信息");
            return;
        }

        //先重置参数列表
        if (byTap)
            TableFromService.Arguments = new string?[methodInfo.Args.Length];
        //再绑定数据
        _dgController.DataSource = methodInfo.Args;
    }
}