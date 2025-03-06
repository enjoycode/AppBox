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
        Width = 500;
        Height = 400;

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

        _isFromQuery = new RxProxy<bool>(
            () => _tableState.Source.SourceType == "Query",
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
    }

    private readonly DesignController _designController;
    private readonly DynamicTableState _tableState;
    private readonly State<bool> _isFromQuery;

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

        Child = BuildBody();
    }

    private readonly DesignController _designController;
    private readonly DynamicTableState _tableState;
    private DynamicTableFromQuery TableFromQuery => (DynamicTableFromQuery)_tableState.Source;
    private readonly State<ModelNode?> _entityTarget = State<ModelNode?>.Default();

    private Widget BuildBody() => new Form()
    {
        LabelWidth = 100,
        Children =
        {
            new FormItem("Entity:", new Select<ModelNode>(_entityTarget)
            {
                Options = DesignHub.Current.DesignTree.FindNodesByType(ModelType.Entity),
                LabelGetter = node => $"{node.AppNode.Label}.{node.Label}"
            })
        }
    };
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