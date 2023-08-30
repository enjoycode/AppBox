using System;
using System.Linq;
using AppBoxCore;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityMemberDialog : Dialog
{
    public NewEntityMemberDialog(ModelNodeVO modelNode)
    {
        _modelNode = modelNode;
        Width = 380;
        Height = 280;
        Title.Value = "New Entity Member";
    }

    private static readonly string[] MemberTypes = { "EntityField", "EntityRef", "EntitySet" };
    private static readonly string[] FieldTypes = { "String", "Int", "Long", "Float", "Double" };

    private readonly ModelNodeVO _modelNode;
    private readonly State<string> _name = string.Empty;
    private readonly State<bool> _allowNull = false;
    private readonly State<string> _memberType = MemberTypes[0];
    private readonly State<string> _fieldType = FieldTypes[0];
    private readonly State<ModelNodeVO?> _entityRefTarget = new RxValue<ModelNodeVO?>(null);
    private readonly State<EntityMemberInfo?> _entitySetTarget = new RxValue<EntityMemberInfo?>(null);

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
                            new FormItem("Name:", new TextInput(_name)),
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
                        })
                        .When(t => t == "EntityRef", () => new Form()
                        {
                            LabelWidth = 100,
                            Padding = EdgeInsets.Only(5, 0, 5, 5),
                            Children = new[]
                            {
                                new FormItem("Target:",
                                    new Select<ModelNodeVO>(_entityRefTarget)
                                    {
                                        Options = DesignStore.GetAllEntityNodes().ToArray()
                                    }),
                                new FormItem("AllowNull:", new Checkbox(_allowNull))
                            }
                        })
                        .When(t => t == "EntitySet", () => new Form()
                        {
                            LabelWidth = 100,
                            Padding = EdgeInsets.Only(5, 0, 5, 5),
                            Children = new[]
                            {
                                new FormItem("Target:",
                                    new Select<EntityMemberInfo>(_entitySetTarget)
                                    {
                                        OptionsAsyncGetter = Channel.Invoke<EntityMemberInfo[]>(
                                            "sys.DesignService.GetAllEntityRefs",
                                            new object?[] { _modelNode.Id })!
                                    })
                            }
                        })
                }
            }
        };
    }

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

    private string[] GetRefModelIds()
    {
        if (_entityRefTarget.Value == null) return Array.Empty<string>();
        return new string[] { _entityRefTarget.Value!.Id };
    }

    internal object?[] GetArgs()
    {
        var memberType = GetMemberTypeValue();
        if (memberType == (int)EntityMemberType.EntityField)
            return new object?[]
            {
                _modelNode.Id, _name.Value, memberType, GetFieldTypeValue(), _allowNull.Value
            };
        if (memberType == (int)EntityMemberType.EntityRef)
            return new object?[]
            {
                //TODO:暂不支持聚合引用
                _modelNode.Id, _name.Value, memberType, GetRefModelIds(), _allowNull.Value
            };
        if (memberType == (int)EntityMemberType.EntitySet)
            return new object?[]
            {
                _modelNode.Id, _name.Value, memberType, _entitySetTarget.Value!.ModelId,
                _entitySetTarget.Value!.MemberId
            };

        throw new NotImplementedException();
    }
}