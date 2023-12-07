using System;
using System.Linq;
using AppBoxClient;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;
using Log = AppBoxCore.Log;

namespace AppBoxDesign;

//TODO: 暂简单实现: 1.服务选择；2.服务参数填充等;

internal sealed class DataSetStateEditDialog : Dialog
{
    public DataSetStateEditDialog(DesignController designController, DynamicState state)
    {
        Title.Value = "DataSet Settings";
        Width = 500;
        Height = 400;

        _designController = designController;
        //初始化状态
        state.Value ??= new DynamicDataSetState();
        _dataSetState = (DynamicDataSetState)state.Value;
        _service = new RxProxy<string>(
            () => ((DynamicDataSetState)state.Value).Service,
            v => ((DynamicDataSetState)state.Value).Service = v);
    }

    private readonly DesignController _designController;
    private readonly DynamicDataSetState _dataSetState;
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
                    () => _dataSetState.Arguments?[index],
                    v =>
                    {
                        if (_dataSetState.Arguments != null)
                            _dataSetState.Arguments[index] = v ?? string.Empty;
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
            _dataSetState.Arguments = null;

        ServiceMethodInfo methodInfo;
        try
        {
            var jsonResult = (await Channel.Invoke<JsonResult>("sys.DesignService.GetServiceMethod",
                new object?[] { false, _service.Value }))!;
            methodInfo = jsonResult.ParseTo<ServiceMethodInfo>()!;
        }
        catch (Exception)
        {
            Notification.Error("无法获取服务方法信息");
            return;
        }

        //先重置参数列表
        if (byTap)
            _dataSetState.Arguments = new string[methodInfo.Args.Length];
        //再绑定数据
        _dgController.DataSource = methodInfo.Args;
    }
}