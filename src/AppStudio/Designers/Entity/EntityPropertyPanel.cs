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

#if !__WEB__
    protected override void OnObjectChanged()
    {
        throw new System.NotImplementedException();
    }
#endif
}

internal sealed class EntityPropertyPanel : View
{
    public EntityPropertyPanel(EntityModelVO entityModel,
        State<EntityMemberVO?> selectedMember)
    {
        _entityModel = entityModel;
        _selectedMember = selectedMember;

        Child = new Column(HorizontalAlignment.Left)
        {
            Children = new Widget[]
            {
                new Text("Entity Properties:") { FontWeight = FontWeight.Bold },
                new Form()
                {
                    LabelWidth = 120,
                    Children = new[]
                    {
                        new FormItem("DataStoreKind:", new Input("SqlStore") { Readonly = true }),
                        new FormItem("DataStoreName:", new Input("Default") { Readonly = true }),
                        new FormItem("Comment", new Input(""))
                    }
                }
            }
        };
    }

    private readonly EntityModelVO _entityModel;
    private readonly State<EntityMemberVO?> _selectedMember;
}