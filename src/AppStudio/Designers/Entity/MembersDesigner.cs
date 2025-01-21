using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class MembersDesigner : View
{
    public MembersDesigner(EntityModel entityModel,
        DataGridController<EntityMemberModel> membersController,
        State<EntityMemberModel?> selectedMember)
    {
        var color = new Color(0xFFF3F3F3);

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 280,
            SplitterColor = color,
            Panel1 = new DataGrid<EntityMemberModel>(membersController)
            {
                Columns =
                {
                    new DataGridTextColumn<EntityMemberModel>("Name", v => v.Name)
                        { Width = ColumnWidth.Fixed(150) },
                    new DataGridTextColumn<EntityMemberModel>("Type", MemberTypeToString)
                        { Width = ColumnWidth.Fixed(200) },
                    new DataGridCheckboxColumn<EntityMemberModel>("AllowNull", v => v.AllowNull)
                        { Width = ColumnWidth.Fixed(90) },
                    new DataGridTextColumn<EntityMemberModel>("Comment", v => v.Comment ?? string.Empty),
                }
            },
            Panel2 = new Container()
            {
                Padding = EdgeInsets.All(10),
                FillColor = color,
                Child = new EntityPropertyPanel(entityModel, selectedMember)
            }
        };
    }

    private static string MemberTypeToString(EntityMemberModel member)
    {
        if (member.Type == EntityMemberType.EntityField)
            return $"{member.Type.ToString()} - {((EntityFieldModel)member).FieldType.ToString()}";
        //TODO: EntityRef and EntitySet attach target entity name
        return member.Type.ToString();
    }
}