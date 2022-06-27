using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class MembersDesigner : View
    {
        public MembersDesigner(DataGridController<EntityMemberVO> membersController)
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
                                    ColumnWidth.Fixed(110)),
                                new DataGridTextColumn<EntityMemberVO>("Type",
                                    v => v.Type.ToString(),
                                    ColumnWidth.Fixed(120)),
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
                    }
                }
            };
        }
    }
}