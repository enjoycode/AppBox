using AppBoxClient.Dynamic.Events;
using PixUI;

namespace AppBoxDesign.EventEditors;

internal sealed class AddViewParameterDialog : Dialog
{
    public AddViewParameterDialog()
    {
        //TODO:入参传入目标视图，然后加载目标视图的状态参数列表
        Width = 300;
        Height = 210;
        Title.Value = "Add View Parameter";
    }

    private readonly State<string> _name = "";
    private readonly State<string?> _type = "FetchRow";

    protected override Widget BuildBody() => new Container()
    {
        Padding = EdgeInsets.All(20),
        Child = new Form()
        {
            LabelWidth = 80,
            Children =
            {
                new FormItem("State:", new TextInput(_name)), //TODO: 改变下拉选择
                new FormItem("Type:", new Select<string>(_type) { Options = ["FetchRow"] })
            }
        }
    };

    public ViewParameter GetViewParameter()
    {
        if (string.IsNullOrEmpty(_name.Value))
            throw new Exception("Target state name is required.");

        switch (_type.Value)
        {
            case "FetchRow":
                return new ViewParameter() { StateName = _name.Value, Source = new FetchRowParameter() };
            default:
                throw new Exception("Unknown type.");
        }
    }
}