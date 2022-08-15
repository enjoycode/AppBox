using System;
using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityMemberDialog : Dialog
{
    public NewEntityMemberDialog()
    {
        Width = 380;
        Height = 280;
        Title.Value = "New Entity Member";
    }

    private static readonly string[] MemberTypes = { "EntityField", "EntityRef", "EntitySet" };
    private static readonly string[] FieldTypes = { "String", "Int", "Long", "Float", "Double" };

    internal readonly State<string> Name = string.Empty;
    internal readonly State<bool> AllowNull = false;
    private readonly State<string> _memberType = MemberTypes[0];
    private readonly State<string> _fieldType = FieldTypes[0];
    private readonly State<ModelNode?> _refTarget = new Rx<ModelNode?>(null);

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
                            new FormItem("Name:", new Input(Name)),
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
                                new FormItem("AllowNull:", new Checkbox(AllowNull))
                            }
                        })
                        .When(t => t == "EntityRef", () => new Form()
                        {
                            LabelWidth = 100,
                            Padding = EdgeInsets.Only(5, 0, 5, 5),
                            Children = new[]
                            {
                                new FormItem("Target:",
                                    new Select<ModelNode>(_refTarget)
                                    {
                                        Options = DesignStore.GetAllEntityNodes().ToArray()
                                    }),
                                new FormItem("AllowNull:", new Checkbox(AllowNull))
                            }
                        })
                }
            }
        };
    }

    internal int GetMemberTypeValue()
    {
        switch (_memberType.Value)
        {
            case "EntityField": return (int)EntityMemberType.EntityField;
            case "EntityRef": return (int)EntityMemberType.EntityRef;
            case "EntitySet": return (int)EntityMemberType.EntitySet;
            default: throw new Exception();
        }
    }

    internal int GetFieldTypeValue()
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

    internal string[] GetRefModelIds()
    {
        if (_refTarget.Value == null) return Array.Empty<string>();
        return new string[] { _refTarget.Value!.Id };
    }
}