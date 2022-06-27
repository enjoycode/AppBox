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
                        Child = new DataGrid<EntityMemberVO>(membersController),
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