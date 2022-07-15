using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class SqlStoreOptionsDesigner : View
{
    internal SqlStoreOptionsDesigner(EntityModelVO entityModel)
    {
        _entityModel = entityModel;
        _pkController.DataSource = _entityModel.SqlStoreOptions.PrimaryKeys;

        Child = new Container()
        {
            Padding = EdgeInsets.All(8),
            Child = new Column(HorizontalAlignment.Left, 10)
            {
                Children = new Widget[]
                {
                    // Primary keys
                    new Text("Primary Keys:") { FontSize = 20, FontWeight = FontWeight.Bold },
                    new ButtonGroup()
                    {
                        Children = new[]
                        {
                            new Button("Add", Icons.Filled.Add),
                            new Button("Remove", Icons.Filled.Remove)
                        }
                    },
                    new DataGrid<FieldWithOrder>(_pkController)
                    {
                        Height = 112,
                        Columns = new DataGridColumn<FieldWithOrder>[]
                        {
                            new DataGridTextColumn<FieldWithOrder>("Name",
                                t => _entityModel.Members.First(m => m.Id == t.MemberId).Name),
                            new DataGridCheckboxColumn<FieldWithOrder>("OrderByDesc",
                                t => t.OrderByDesc),
                        }
                    },

                    //Indexes
                    new Text("Indexes:") { FontSize = 20, FontWeight = FontWeight.Bold },
                    new ButtonGroup()
                    {
                        Children = new[]
                        {
                            new Button("Add", Icons.Filled.Add),
                            new Button("Remove", Icons.Filled.Remove)
                        }
                    },
                    new DataGrid<object>(_idxController)
                    {
                        Height = 112,
                        Columns = new DataGridColumn<object>[]
                        {
                            new DataGridTextColumn<object>("Name",
                                t => "TODO"),
                            new DataGridTextColumn<object>("Fields",
                                t => "TODO"),
                            new DataGridCheckboxColumn<object>("Unique",
                                t => true),
                        }
                    },
                }
            }
        };
    }

    private readonly EntityModelVO _entityModel;

    private readonly DataGridController<FieldWithOrder> _pkController =
        new DataGridController<FieldWithOrder>();

    private readonly DataGridController<object> _idxController = new DataGridController<object>();
}