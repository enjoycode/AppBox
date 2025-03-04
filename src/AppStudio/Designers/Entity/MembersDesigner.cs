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
                .AddTextColumn("Name", v => v.Name, 150)
                .AddTextColumn("Type", MemberTypeToString, 200)
                .AddCheckboxColumn("AllowNull", v => v.AllowNull, width: 90)
                .AddTextColumn("Comment", v => v.Comment ?? string.Empty),
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