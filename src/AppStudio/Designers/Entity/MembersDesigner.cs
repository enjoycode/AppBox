using System.Collections.Generic;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class MembersDesigner : View
    {
        public MembersDesigner(EntityModelVO entityModel,
            DataGridController<EntityMemberVO> membersController)
        {
            Child = new Row()
            {
                Children = new Widget[]
                {
                    new Expanded()
                    {
                        Child = new DataGrid<EntityMemberVO>(membersController)
                        {
                            Columns = new List<DataGridColumn<EntityMemberVO>>()
                            {
                                new DataGridTextColumn<EntityMemberVO>("Name", v => v.Name,
                                    ColumnWidth.Fixed(150)),
                                new DataGridTextColumn<EntityMemberVO>("Type",
                                    MemberTypeToString,
                                    ColumnWidth.Fixed(200)),
                                new DataGridTextColumn<EntityMemberVO>("AllowNull",
                                    v => v.AllowNull.ToString(),
                                    ColumnWidth.Fixed(90)),
                                new DataGridTextColumn<EntityMemberVO>("Comment",
                                    v => v.Comment ?? string.Empty),
                            }
                        },
                    },
                    new Container()
                    {
                        BgColor = new Color(0xFFF3F3F3),
                        Width = 280,
                        Child = new EntityPropertyPanel(entityModel, _selectedMember)
                    }
                }
            };
        }

        private readonly State<EntityMemberVO?> _selectedMember = new Rx<EntityMemberVO?>(null);

        private static string MemberTypeToString(EntityMemberVO member)
        {
            if (member.Type == EntityMemberType.DataField)
                return $"{member.Type.ToString()} - {((EntityFieldVO)member).DataType.ToString()}";
            //TODO: EntityRef and EntitySet attach target entity name
            return member.Type.ToString();
        }
    }
}