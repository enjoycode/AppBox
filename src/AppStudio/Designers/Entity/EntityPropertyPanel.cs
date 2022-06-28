using PixUI;

namespace AppBoxDesign;

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
                        new FormItem("DataStoreName:", new Input("Default") { Readonly = true })
                    }
                }
            }
        };
    }

    private readonly EntityModelVO _entityModel;
    private readonly State<EntityMemberVO?> _selectedMember;
}