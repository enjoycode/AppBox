using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class MembersDesigner : View
    {
        public MembersDesigner()
        {
            Child = new Row()
            {
                Children = new Widget[]
                {
                    new Expanded()
                    {
                        Child = new DataGrid<EntityModelVO>(_membersController),
                    },
                    new Container()
                    {
                        BgColor = new Color(0xFFF3F3F3),
                        Width = 280,
                    }
                }
            };
        }

        private readonly DataGridController<EntityModelVO> _membersController =
            new DataGridController<EntityModelVO>(new List<DataGridColumn<EntityModelVO>>()
            {
                new DataGridTextColumn<EntityModelVO>("Name", v => v.Name, ColumnWidth.Fixed(90)),
                new DataGridTextColumn<EntityModelVO>("Type", v => v.Name, ColumnWidth.Fixed(90)),
                new DataGridTextColumn<EntityModelVO>("AllowNull", v => v.Name,
                    ColumnWidth.Fixed(90)),
                new DataGridTextColumn<EntityModelVO>("Comment", v => v.Name),
            });
    }
}