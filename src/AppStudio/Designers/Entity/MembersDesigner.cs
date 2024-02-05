using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class MembersDesigner : View
{
    public MembersDesigner(EntityModelVO entityModel,
        DataGridController<EntityMemberVO> membersController,
        State<EntityMemberVO?> selectedMember)
    {
        var color = new Color(0xFFF3F3F3);

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 280,
            SplitterColor = color,
            Panel1 = new DataGrid<EntityMemberVO>(membersController)
            {
                Columns =
                {
                    new DataGridTextColumn<EntityMemberVO>("Name", v => v.Name)
                        { Width = ColumnWidth.Fixed(150) },
                    new DataGridTextColumn<EntityMemberVO>("Type", MemberTypeToString)
                        { Width = ColumnWidth.Fixed(200) },
                    new DataGridCheckboxColumn<EntityMemberVO>("AllowNull", v => v.AllowNull)
                        { Width = ColumnWidth.Fixed(90) },
                    new DataGridTextColumn<EntityMemberVO>("Comment", v => v.Comment ?? string.Empty),
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

    private static string MemberTypeToString(EntityMemberVO member)
    {
        if (member.Type == EntityMemberType.EntityField)
            return $"{member.Type.ToString()} - {((EntityFieldVO)member).FieldType.ToString()}";
        //TODO: EntityRef and EntitySet attach target entity name
        return member.Type.ToString();
    }
}