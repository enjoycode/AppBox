using System.Collections.Generic;

namespace PixUI.Test.Mac
{
    public sealed class DemoDataGrid : View
    {
        private readonly DataGridController<Person> _controller;

        public DemoDataGrid()
        {
            _controller = new DataGridController<Person>();
            _controller.DataSource = Person.GeneratePersons(1000);

            Child = new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new DataGrid<Person>(_controller)
                {
                    Columns = new List<DataGridColumn<Person>>()
                    {
                        new DataGridTextColumn<Person>("Name", cellValueGetter: p => p.Name),
                        new DataGridGroupColumn<Person>("Gender", new List<DataGridColumn<Person>>
                            {
                                new DataGridIconColumn<Person>("Icon",
                                    cellValueGetter: p =>
                                        p.Female ? Icons.Outlined.Woman : Icons.Outlined.Man,
                                    width: ColumnWidth.Fixed(60)),
                                new DataGridCheckboxColumn<Person>("IsMan", p => !p.Female),
                            }),
                        new DataGridTextColumn<Person>("Score",
                            cellValueGetter: p => p.Score.ToString()),
                    }
                }
            };
        }
    }
}