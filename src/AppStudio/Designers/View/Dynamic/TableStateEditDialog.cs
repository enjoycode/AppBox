using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

//TODO: 服务选择

internal sealed class TableStateEditDialog : Dialog
{
    public TableStateEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataSource Settings";
        Width = 500;
        Height = 400;

        _designController = designController;
        //初始化状态
        state.Value ??= new DynamicTableState();
        _tableState = (DynamicTableState)state.Value;
        _service = new RxProxy<string>(
            () => ((DynamicTableState)state.Value).Service,
            v => ((DynamicTableState)state.Value).Service = v);
    }

    private readonly DesignController _designController;
    private readonly DynamicTableState _tableState;
    private readonly State<string> _service;
    private readonly DataGridController<ServiceMethodParameterInfo> _dgController = new();

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Form()
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
        }
    };

    private Widget BuildDataGrid() => new DataGrid<ServiceMethodParameterInfo>(_dgController)
        .AddTextColumn("Name", a => a.Name)
        .AddTextColumn("Type", a => a.Type)
        .AddHostColumn("State", (para, index) =>
        {
            var rs = new RxProxy<string?>(
                () => index < 0 || index >= _tableState.Arguments.Length ? null : _tableState.Arguments[index],
                v =>
                {
                    if (index >= 0 && index < _tableState.Arguments.Length)
                        _tableState.Arguments[index] = v;
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
                options = [];
            }

            return new Select<string>(rs) { Options = options };
        });

    protected override void OnMounted()
    {
        base.OnMounted();
        //如果service path 有值自动填充参数列表
        if (!string.IsNullOrEmpty(_service.Value))
            FetchMethodInfo(false);
    }

    private async void FetchMethodInfo(bool byTap)
    {
        if (byTap)
            _tableState.Arguments = [];

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
            _tableState.Arguments = new string?[methodInfo.Args.Length];
        //再绑定数据
        _dgController.DataSource = methodInfo.Args;
    }

    // protected override bool OnClosing(string result)
    // {
    //     if (result != DialogResult.OK) return false;
    //     
    //     //检查是否全部绑定参数
    // }
}