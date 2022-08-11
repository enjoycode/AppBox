using System;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityMemberDialog : Dialog<object>
{
    public NewEntityMemberDialog(Overlay overlay, EntityDesigner designer) : base(overlay)
    {
        _designer = designer;
        Width = 380;
        Height = 280;
        Title.Value = "New Entity Member";
        OnClose = _OnClose;
    }

    private static readonly string[] MemberTypes = { "EntityField", "EntityRef", "EntitySet" };
    private static readonly string[] FieldTypes = { "String", "Int", "Long", "Float", "Double" };

    private readonly EntityDesigner _designer;
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

    protected override object? GetResult(bool canceled) => null;

    private int GetMemberTypeValue()
    {
        switch (_memberType.Value)
        {
            case "EntityField": return (int)EntityMemberType.EntityField;
            case "EntityRef": return (int)EntityMemberType.EntityRef;
            case "EntitySet": return (int)EntityMemberType.EntitySet;
            default: throw new Exception();
        }
    }

    private int GetFieldTypeValue()
    {
        switch (_fieldType.Value)
        {
            case "String": return (int)EntityFieldType.String;
            case "Int": return (int)EntityFieldType.Int;
            case "Long": return (int)EntityFieldType.Long;
            case "Float": return (int)EntityFieldType.Float;
            case "Double": return (int)EntityFieldType.Double;
            default: throw new NotImplementedException();
        }
    }

    private async void _OnClose(bool canceled, object? result)
    {
        if (canceled) return;
        if (string.IsNullOrEmpty(_name.Value)) return;

        var memberType = GetMemberTypeValue();
        object?[] args;
        if (memberType == (int)EntityMemberType.EntityField)
            args = new object?[]
            {
                _designer.ModelNode.Id, _name.Value, memberType, GetFieldTypeValue(),
                _allowNull.Value
            };
        else
            throw new NotImplementedException();

        try
        {
            var res = await Channel.Invoke<EntityMemberVO>("sys.DesignService.NewEntityMember",
                args);
            _designer.OnMemberAdded(res!);
        }
        catch (Exception e)
        {
            Notification.Error($"新建实体成员错误: {e.Message}");
        }
    }
}