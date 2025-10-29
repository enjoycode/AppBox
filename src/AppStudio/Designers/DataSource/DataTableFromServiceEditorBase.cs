using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxDesign;

internal abstract class DataTableFromServiceEditorBase : View
{
    protected DataTableFromServiceEditorBase(DataTableFromServiceBase tableFromService)
    {
        _tableFromService = tableFromService;
        _service = new RxProxy<string>(() => _tableFromService.Service, v => _tableFromService.Service = v);

        Child = BuildBody();
    }

    //TODO: 服务选择

    private readonly DataGridController<ServiceMethodParameterInfo> _dgController = new();
    private readonly State<string> _service;
    private readonly DataTableFromServiceBase _tableFromService;

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
            () => index < 0 || index >= _tableFromService.Arguments.Length
                ? null
                : _tableFromService.Arguments[index],
            v =>
            {
                if (index >= 0 && index < _tableFromService.Arguments.Length)
                    _tableFromService.Arguments[index] = v;
            });

        string[] options;
        try
        {
            var noneNullableValueType = para.ConvertToRuntimeType(out var allowNull);
            var stateType = DynamicState.GetStateTypeByValueType(noneNullableValueType);
            options = FindStates(stateType, allowNull);
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
            _tableFromService.Arguments = [];

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
            _tableFromService.Arguments = new string?[methodInfo.Args.Length];
        //再绑定数据
        _dgController.DataSource = methodInfo.Args;
    }

    protected abstract string[] FindStates(DynamicStateType type, bool allowNull);
}