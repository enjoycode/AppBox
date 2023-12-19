using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class RxEntityField : RxObjectBase<EntityFieldVO>
{
    public RxEntityField(EntityFieldVO? target)
    {
        _target = target;

        Name = new RxProxy<string>(() => Target.Name);
        FieldType = new RxProxy<EntityFieldType>(() => Target.FieldType);
        Comment = new RxProxy<string>(() => Target.Comment ?? string.Empty, v => Target.Comment = v);
    }

    public readonly RxProxy<string> Name;
    public readonly RxProxy<EntityFieldType> FieldType;
    public readonly RxProxy<string> Comment;
}

/// <summary>
/// 实体模型的属性面板
/// </summary>
internal sealed class EntityPropertyPanel : View
{
    public EntityPropertyPanel(EntityModelVO entityModel, State<EntityMemberVO?> selectedMember)
    {
        Bind(ref _selectedMember!, selectedMember, OnSelectedMemberChanged);
        _rxEntityField = new RxEntityField((EntityFieldVO?)_selectedMember.Value);
        var isEntityField = _selectedMember
            .ToStateOfBool(v => v is { Type: EntityMemberType.EntityField });

        Child = new Column(HorizontalAlignment.Left)
        {
            Children =
            {
                new Text("Entity Properties:") { FontWeight = FontWeight.Bold },
                new Form()
                {
                    LabelWidth = _labelWidth,
                    Children =
                    {
                        new("DataStoreKind:", new TextInput("SqlStore") { Readonly = true }),
                        new("DataStoreName:", new TextInput("Default") { Readonly = true }),
                        new("Comment:", new TextInput("")),
                    }
                },
                new IfConditional(isEntityField,
                    () => new Text("EntityField Properties:") { FontWeight = FontWeight.Bold }),
                new IfConditional(isEntityField, () => new Form()
                {
                    LabelWidth = _labelWidth,
                    Children =
                    {
                        new("Name:", new TextInput(_rxEntityField.Name)),
                        new("FieldType:", new TextInput(_rxEntityField.FieldType.ToStateOfString())),
                        new("Comment:", new TextInput(_rxEntityField.Comment))
                    }
                })
            }
        };
    }

    private const float _labelWidth = 120f;
    private readonly State<EntityMemberVO?> _selectedMember;
    private readonly RxEntityField _rxEntityField;

    private void OnSelectedMemberChanged(State state)
    {
        if (_selectedMember.Value is EntityFieldVO entityFieldVO)
            _rxEntityField.Target = entityFieldVO;
    }
}