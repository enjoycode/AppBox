using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityMemberDialog : Dialog<object>
{
    public NewEntityMemberDialog(Overlay overlay) : base(overlay)
    {
        Width = 380;
        Height = 280;
        Title.Value = "New Entity Member";
    }

    private readonly State<string> _name = string.Empty;
    private readonly State<string> _memberType = MemberTypes[0];
    private readonly State<string> _fieldType = FieldTypes[0];
    private readonly State<bool> _allowNull = false;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Column()
            {
                Children = new Widget[]
                {
                    new Form()
                    {
                        LabelWidth = 100,
                        Padding = EdgeInsets.Only(5, 5, 5, 0),
                        Children = new[]
                        {
                            new FormItem("Name:", new Input(_name)),
                            new FormItem("MemberType:", new Select<string>(_memberType!)
                            {
                                Options = MemberTypes
                            })
                        }
                    },
                    new Conditional<string>(_memberType)
                        .When(t => t == "EntityField", () => new Form()
                            {
                                LabelWidth = 100,
                                Padding = EdgeInsets.Only(5, 0, 5, 5),
                                Children = new[]
                                {
                                    new FormItem("FieldType:",
                                        new Select<string>(_fieldType!) { Options = FieldTypes }),
                                    new FormItem("AllowNull:", new Checkbox(_allowNull))
                                }
                            }
                        ),
                    new Row(VerticalAlignment.Middle, 20)
                    {
                        Children = new Widget[]
                        {
                            new Button("Cancel") { Width = 65, OnTap = _ => Close(true) },
                            new Button("OK") { Width = 65, OnTap = _ => Close(false) },
                        }
                    }
                }
            }
        };
    }

    private static readonly string[] MemberTypes = { "EntityField", "EntityRef", "EntitySet" };
    private static readonly string[] FieldTypes = { "String", "Int", "Long", "Float", "Double" };

    protected override object? GetResult(bool canceled) => null;
}