using System;
using System.Linq;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class SqlStoreOptionsDesigner : View
{
    internal SqlStoreOptionsDesigner(EntityModelVO entityModel, string modelId)
    {
        _entityModel = entityModel;
        _modelId = modelId;
        _pkController.DataSource = _entityModel.SqlStoreOptions.PrimaryKeys;
        _idxController.DataSource = _entityModel.SqlStoreOptions.Indexes;

        Child = new Container()
        {
            Padding = EdgeInsets.All(8),
            Child = new Row(VerticalAlignment.Top, 10)
            {
                Children = new Widget[]
                {
                    new Expanded(BuildPrimaryKeysPannel()),
                    new Expanded(BuildIndexesPannel()),
                }
            }
        };
    }

    private readonly EntityModelVO _entityModel;
    private readonly string _modelId;
    private readonly DataGridController<FieldWithOrder> _pkController = new();
    private readonly DataGridController<SqlIndexModelVO> _idxController = new();

    private Widget BuildPrimaryKeysPannel()
    {
        return new Card()
        {
            Padding = EdgeInsets.All(10),
            Child = new Column(HorizontalAlignment.Left, 10)
            {
                Children = new Widget[]
                {
                    new Text("Primary Keys:") { FontSize = 20, FontWeight = FontWeight.Bold },
                    new ButtonGroup()
                    {
                        Children = new[]
                        {
                            new Button("Add", Icons.Filled.Add) { OnTap = OnAddPk },
                            new Button("Remove", Icons.Filled.Remove) { OnTap = OnRemovePk }
                        }
                    },
                    new DataGrid<FieldWithOrder>(_pkController)
                    {
                        Columns = new DataGridColumn<FieldWithOrder>[]
                        {
                            new DataGridTextColumn<FieldWithOrder>("Name",
                                t => _entityModel.Members.First(m => m.Id == t.MemberId).Name),
                            new DataGridCheckboxColumn<FieldWithOrder>("OrderByDesc",
                                t => t.OrderByDesc),
                        }
                    }
                }
            }
        };
    }

    private Widget BuildIndexesPannel()
    {
        return new Card()
        {
            Padding = EdgeInsets.All(10),
            Child = new Column(HorizontalAlignment.Left, 10)
            {
                Children = new Widget[]
                {
                    new Text("Indexes:") { FontSize = 20, FontWeight = FontWeight.Bold },
                    new ButtonGroup()
                    {
                        Children = new[]
                        {
                            new Button("Add", Icons.Filled.Add),
                            new Button("Remove", Icons.Filled.Remove)
                        }
                    },
                    new DataGrid<SqlIndexModelVO>(_idxController)
                    {
                        Columns = new DataGridColumn<SqlIndexModelVO>[]
                        {
                            new DataGridTextColumn<SqlIndexModelVO>("Name",
                                t => t.Name),
                            new DataGridTextColumn<SqlIndexModelVO>("Fields",
                                t => GetIndexesFieldsList(t)),
                            new DataGridCheckboxColumn<SqlIndexModelVO>("Unique",
                                t => true),
                        }
                    },
                }
            }
        };
    }

    private string GetIndexesFieldsList(SqlIndexModelVO indexMode)
    {
        var s = "";
        for (var i = 0; i < indexMode.Fields.Length; i++)
        {
            if (i != 0)
                s += ", ";
            s += _entityModel.Members.First(m => m.Id == indexMode.Fields[i].MemberId).Name;
            if (indexMode.Fields[i].OrderByDesc)
                s += " OrderByDesc";
        }

        return s;
    }

    private void OnAddPk(PointerEvent e)
    {
        var dlg = new FieldWithOrderDialog(Overlay!, _entityModel, (cancel, fieldWithOrder) =>
        {
            if (cancel) return;
            _pkController.Add(fieldWithOrder);
            ChangePrimaryKeys();
        });
        dlg.Show();
    }

    private void OnRemovePk(PointerEvent e)
    {
        var selection = _pkController.SelectedRows;
        if (selection.Length == 0) return;

        _pkController.Remove(selection[0]);
        ChangePrimaryKeys();
    }

    private async void ChangePrimaryKeys()
    {
        var args = new object?[]
        {
            _modelId,
            _entityModel.SqlStoreOptions.PrimaryKeys.Count == 0
                ? null
                : _entityModel.SqlStoreOptions.PrimaryKeys.ToArray()
        };
        try
        {
            await Channel.Invoke("sys.DesignService.ChangePrimaryKeys", args);
        }
        catch (Exception ex)
        {
            //TODO: rollback to pre state
            Notification.Error($"Change primary keys error: {ex.Message}");
        }
    }
}