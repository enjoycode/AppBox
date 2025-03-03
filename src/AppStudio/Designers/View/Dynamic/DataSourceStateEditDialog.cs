using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign;

//TODO: 服务选择

internal sealed class DataSourceStateEditDialog : Dialog
{
    public DataSourceStateEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataSource Settings";
        Width = 500;
        Height = 400;

        _designController = designController;
        //初始化状态
        state.Value ??= new DynamicDataSourceState();
        _dataSourceState = (DynamicDataSourceState)state.Value;
        _service = new RxProxy<string>(
            () => ((DynamicDataSourceState)state.Value).Service,
            v => ((DynamicDataSourceState)state.Value).Service = v);
    }

    private readonly DesignController _designController;
    private readonly DynamicDataSourceState _dataSourceState;
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
    {
        Columns =
        {
            new DataGridTextColumn<ServiceMethodParameterInfo>("Name", a => a.Name),
            new DataGridTextColumn<ServiceMethodParameterInfo>("Type", a => a.Type),
            new DataGridHostColumn<ServiceMethodParameterInfo>("State", (para, index) =>
            {
                var rs = new RxProxy<string?>(
                    () => index < 0 || index >= _dataSourceState.Arguments.Length ? null : _dataSourceState.Arguments[index],
                    v =>
                    {
                        if (index >= 0 && index < _dataSourceState.Arguments.Length)
                            _dataSourceState.Arguments[index] = v;
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
                    options = Array.Empty<string>();
                }

                return new Select<string>(rs) { Options = options };
            }),
        }
    };

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
            _dataSourceState.Arguments = [];

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
            _dataSourceState.Arguments = new string?[methodInfo.Args.Length];
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