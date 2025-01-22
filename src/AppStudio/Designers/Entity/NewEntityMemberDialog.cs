using System;
using System.Linq;
using AppBoxCore;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 新建实体成员对话框
/// </summary>
internal sealed class NewEntityMemberDialog : Dialog
{
    public NewEntityMemberDialog(DesignStore designStore, ModelNode modelNode)
    {
        _designStore = designStore;
        _modelNode = modelNode;
        Width = 380;
        Height = 280;
        Title.Value = "New Entity Member";
    }

    private static readonly string[] MemberTypes = { "EntityField", "EntityRef", "EntitySet" };

    private static readonly string[] FieldTypes =
        { "String", "Int", "Long", "Float", "Double", "Decimal", "Bool", "DateTime", "Guid", "Binary" };

    private readonly DesignStore _designStore;
    private readonly ModelNode _modelNode;
    private readonly State<string> _name = string.Empty;
    private readonly State<bool> _allowNull = false;
    private readonly State<string> _memberType = MemberTypes[0];
    private readonly State<string> _fieldType = FieldTypes[0];
    private readonly State<ModelNode?> _entityRefTarget = new RxValue<ModelNode?>(null);
    private readonly State<EntityMemberInfo?> _entitySetTarget = new RxValue<EntityMemberInfo?>(null);

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Column()
            {
                Children =
                {
                    new Form()
                    {
                        LabelWidth = 100,
                        Padding = EdgeInsets.Only(5, 5, 5, 0),
                        Children =
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
                            Children =
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
                            Children =
                            {
                                new FormItem("Target:",
                                    new Select<ModelNode>(_entityRefTarget)
                                    {
                                        Options = _designStore.GetAllEntityNodes().ToArray()
                                    }),
                                new FormItem("AllowNull:", new Checkbox(_allowNull))
                            }
                        })
                        .When(t => t == "EntitySet", () => new Form()
                        {
                            LabelWidth = 100,
                            Padding = EdgeInsets.Only(5, 0, 5, 5),
                            Children =
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

    private int GetFieldTypeValue() => _fieldType.Value switch
    {
        "String" => (int)EntityFieldType.String,
        "Int" => (int)EntityFieldType.Int,
        "Long" => (int)EntityFieldType.Long,
        "Float" => (int)EntityFieldType.Float,
        "Double" => (int)EntityFieldType.Double,
        "Decimal" => (int)EntityFieldType.Decimal,
        "Bool" => (int)EntityFieldType.Bool,
        "DateTime" => (int)EntityFieldType.DateTime,
        "Guid" => (int)EntityFieldType.Guid,
        "Binary" => (int)EntityFieldType.Binary,
        _ => throw new NotImplementedException()
    };

    private string[] GetRefModelIds()
    {
        if (_entityRefTarget.Value == null) return Array.Empty<string>();
        return new string[] { _entityRefTarget.Value!.Id };
    }

    internal EntityMemberModel[] GetNewMembers()
    {
        var memberType = (EntityMemberType)GetMemberTypeValue();
        return memberType switch
        {
            EntityMemberType.EntityField =>
            [
                NewEntityMember.NewEntityField(_modelNode, _name.Value,
                    (EntityFieldType)GetFieldTypeValue(), _allowNull.Value)
            ],
            EntityMemberType.EntityRef => NewEntityMember.NewEntityRef(_modelNode, _name.Value,
                GetRefModelIds(), _allowNull.Value),
            EntityMemberType.EntitySet =>
            [
                NewEntityMember.NewEntitySet(_modelNode, _name.Value,
                    _entitySetTarget.Value!.ModelId, _entitySetTarget.Value!.MemberId)
            ],
            _ => throw new NotImplementedException($"暂未实现的实体成员类型: {memberType}")
        };
    }
}