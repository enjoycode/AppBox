using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

internal sealed class TableStateFromServiceEditor : View
{
    public TableStateFromServiceEditor(DesignController designController, DynamicDataTable tableState)
    {
        _designController = designController;
        _tableState = tableState;
        _service = new RxProxy<string>(() => TableFromService.Service, v => TableFromService.Service = v);

        Child = BuildBody();
    }

    //TODO: 服务选择

    private readonly DesignController _designController;
    private readonly DynamicDataTable _tableState;
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