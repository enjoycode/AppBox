using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class RxEntityField : RxObject<EntityFieldVO>
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
        _entityModel = entityModel;
        _selectedMember = Bind(selectedMember, OnSelectedMemberChanged);
        _rxEntityField = new RxEntityField((EntityFieldVO?)_selectedMember.Value);
        var isEntityField = _selectedMember
            .ToStateOfBool(v => v != null && v.Type == EntityMemberType.EntityField);

        Child = new Column(HorizontalAlignment.Left)
        {
            Children = new Widget[]
            {
                new Text("Entity Properties:") { FontWeight = FontWeight.Bold },
                new Form()
                {
                    LabelWidth = _labelWidth,
                    Children = new[]
                    {
                        new FormItem("DataStoreKind:", new TextInput("SqlStore") { Readonly = true }),
                        new FormItem("DataStoreName:", new TextInput("Default") { Readonly = true }),
                        new FormItem("Comment:", new TextInput("")),
                    }
                },
                new IfConditional(isEntityField,
                    () => new Text("EntityField Properties:") { FontWeight = FontWeight.Bold }),
                new IfConditional(isEntityField, () => new Form()
                {
                    LabelWidth = _labelWidth,
                    Children = new[]
                    {
                        new FormItem("Name:", new TextInput(_rxEntityField.Name)),
                        new FormItem("FieldType:",
                            new TextInput(_rxEntityField.FieldType.ToStateOfString(v => v.ToString()))),
                        new FormItem("Comment:", new TextInput(_rxEntityField.Comment))
                    }
                })
            }
        };
    }

    private const float _labelWidth = 120f;
    private readonly EntityModelVO _entityModel;
    private readonly State<EntityMemberVO?> _selectedMember;
    private readonly RxEntityField _rxEntityField;

    private void OnSelectedMemberChanged(State state)
    {
        if (_selectedMember.Value is EntityFieldVO entityFieldVO)
            _rxEntityField.Target = entityFieldVO;
    }
}