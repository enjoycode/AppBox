using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEnumItemDialog : Dialog
{
    public NewEnumItemDialog(EnumModel model)
    {
        Width = 380;
        Height = 280;
        Title.Value = "New Enum Item";

        _value.Value = model.Items.Max(t => t.Value) + 1;
    }

    private readonly State<string> _name = string.Empty;
    private readonly State<int> _value = 0;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                LabelWidth = 100,
                Padding = EdgeInsets.Only(5, 5, 5, 0),
                Children =
                {
                    new FormItem("Name:", new TextInput(_name)),
                    new FormItem("Value:", new NumberInput<int>(_value))
                }
            }
        };
    }

    public EnumItem GetEnumItem() => new() { Name = _name.Value, Value = _value.Value };
}