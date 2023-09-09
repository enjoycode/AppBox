using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxDesign;

//TODO: 暂简单实现: 1.服务选择；2.服务参数填充等;

internal sealed class DataSetEditDialog : Dialog
{
    public DataSetEditDialog(DynamicState state)
    {
        _state = state;
        Title.Value = "DataSet Settings";
        Width = 500;
        Height = 400;

        //初始化状态
        _state.Value ??= new DataSetSettings();
        _service = new RxProxy<string>(
            () => ((DataSetSettings)_state.Value).Service,
            v => ((DataSetSettings)_state.Value).Service = v);
    }

    private readonly DynamicState _state;
    private readonly State<string> _service;

    protected override Widget BuildBody()
    {
        return new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                LabelWidth = 100,
                Children =
                {
                    new FormItem("Service", new Row()
                    {
                        Children =
                        {
                            new Expanded(new TextInput(_service)),
                            new Button(icon: MaterialIcons.NextPlan)
                            {
                                FontSize = 20,
                                Style = ButtonStyle.Transparent,
                                Shape = ButtonShape.Pills,
                            }
                        }
                    }),
                    new FormItem("Parameters", new Column()
                    {
                        Children =
                        {
                            new ButtonGroup
                            {
                                Children =
                                {
                                    new Button(icon: MaterialIcons.Add),
                                    new Button(icon: MaterialIcons.Remove),
                                    new Button(icon: MaterialIcons.ArrowUpward),
                                    new Button(icon: MaterialIcons.ArrowDownward)
                                }
                            },
                        }
                    })
                }
            }
        };
    }
}