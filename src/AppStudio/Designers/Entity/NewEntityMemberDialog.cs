using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 新建实体成员对话框
/// </summary>
internal sealed class NewEntityMemberDialog : Dialog
{
    public NewEntityMemberDialog(ModelNode modelNode)
    {
        _modelNode = modelNode;
        Width = 380;
        Height = 280;
        Title.Value = "New Entity Member";
    }

    private static readonly string[] MemberTypes = ["EntityField", "EntityRef", "EntitySet", "EntityRefField"];

    private static readonly string[] FieldTypes =
        ["String", "Int", "Long", "Float", "Double", "Decimal", "Bool", "DateTime", "Guid", "Binary"];

    private readonly ModelNode _modelNode;
    private readonly State<string> _name = string.Empty;
    private readonly State<bool> _allowNull = false;
    private readonly State<string> _memberType = MemberTypes[0];
    private readonly State<string> _fieldType = FieldTypes[0];
    private readonly State<ModelNode?> _entityRefTarget = new RxValue<ModelNode?>(null);
    private readonly State<EntityMemberInfo?> _entitySetTarget = new RxValue<EntityMemberInfo?>(null);
    private readonly State<string> _refFieldPath = "";

    protected override Widget BuildBody() => new Container()
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
                                    Options = DesignHub.Current.DesignTree.FindNodesByType(ModelType.Entity),
                                    LabelGetter = node => $"{node.AppNode.Label}.{node.Label}"
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
                            new FormItem("Target:", //TODO: 暂简单实现
                                new Select<EntityMemberInfo>(_entitySetTarget)
                                {
                                    Options = DesignStore.GetAllEntityRefs(_modelNode.Id)
                                })
                        }
                    })
                    .When(t => t == "EntityRefField", () => new Form()
                    {
                        LabelWidth = 100,
                        Padding = EdgeInsets.Only(5, 0, 5, 5),
                        Children =
                        {
                            new FormItem("Target:", //TODO: 暂简单实现
                                new TextInput(_refFieldPath) { HintText = "eg: Customer.Name" }
                            )
                        }
                    })
            }
        }
    };

    private int GetMemberTypeValue() => _memberType.Value switch
    {
        "EntityField" => (int)EntityMemberType.EntityField,
        "EntityRef" => (int)EntityMemberType.EntityRef,
        "EntitySet" => (int)EntityMemberType.EntitySet,
        "EntityRefField" => (int)EntityMemberType.EntityRefField,
        _ => throw new NotSupportedException(_memberType.Value)
    };

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
        if (_entityRefTarget.Value == null) return [];
        return [_entityRefTarget.Value!.Id];
    }

    internal EntityMember[] GetNewMembers()
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
            EntityMemberType.EntityRefField =>
            [
                NewEntityMember.NewEntityRefField(_modelNode, _name.Value, _refFieldPath.Value)
            ],
            _ => throw new NotImplementedException($"暂未实现的实体成员类型: {memberType}")
        };
    }
}