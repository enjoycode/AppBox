using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class RxEntityField : RxObject<EntityFieldVO>
{
    public RxEntityField()
    {
        Name = new RxProperty<string>(() => Object.Name);
        DataType = new RxProperty<DataFieldType>(() => Object.DataType);
        Comment = new RxProperty<string>(() => Object.Comment ?? string.Empty,
            v => Object.Comment = v);
    }

    public readonly RxProperty<string> Name;
    public readonly RxProperty<DataFieldType> DataType;
    public readonly RxProperty<string> Comment;
}

/// <summary>
/// 实体模型的属性面板
/// </summary>
internal sealed class EntityPropertyPanel : View
{
    public EntityPropertyPanel(EntityModelVO entityModel,
        State<EntityMemberVO?> selectedMember)
    {
        _entityModel = entityModel;
        _selectedMember = Bind(selectedMember, BindingOptions.None);
        var isEntityField = _selectedMember
            .AsStateOfBool(v => v != null && v.Type == EntityMemberType.DataField);

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
                        new FormItem("DataStoreKind:", new Input("SqlStore") { Readonly = true }),
                        new FormItem("DataStoreName:", new Input("Default") { Readonly = true }),
                        new FormItem("Comment:", new Input("")),
                    }
                },
                new IfConditional(isEntityField,
                    () => new Text("EntityField Properties:") { FontWeight = FontWeight.Bold }),
                new IfConditional(isEntityField, () => new Form()
                {
                    LabelWidth = _labelWidth,
                    Children = new[]
                    {
                        new FormItem("Name:", new Input(_rxEntityField.Name) { Readonly = true }),
                        new FormItem("DataType:",
                            new Input(_rxEntityField.DataType.AsStateOfString(v => v.ToString()))
                                { Readonly = true }),
                        new FormItem("Comment:", new Input(_rxEntityField.Comment))
                    }
                })
            }
        };
    }

    private readonly float _labelWidth = 120f;
    private readonly EntityModelVO _entityModel;
    private readonly State<EntityMemberVO?> _selectedMember;
    private readonly RxEntityField _rxEntityField = new RxEntityField();

    public override void OnStateChanged(StateBase state, BindingOptions options)
    {
        if (ReferenceEquals(state, _selectedMember))
        {
            if (_selectedMember.Value != null)
            {
                if (_selectedMember.Value.Type == EntityMemberType.DataField)
                    _rxEntityField.Object = (EntityFieldVO)_selectedMember.Value;
            }

            return;
        }

        base.OnStateChanged(state, options);
    }
}