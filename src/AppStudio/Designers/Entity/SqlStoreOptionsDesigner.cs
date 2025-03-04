using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class SqlStoreOptionsDesigner : View
{
    internal SqlStoreOptionsDesigner(ModelNode modelNode, string modelId)
    {
        _modelNode = modelNode;
        _entityModel = (EntityModel)modelNode.Model;
        _modelId = modelId;
        _pkController.DataSource = _entityModel.SqlStoreOptions!.PrimaryKeys;
        _ixController.DataSource = _entityModel.SqlStoreOptions!.Indexes;

        Child = new Container
        {
            Padding = EdgeInsets.All(8),
            Child = new Row(VerticalAlignment.Top, 10)
            {
                Children =
                {
                    new Expanded(BuildPrimaryKeysPanel()),
                    new Expanded(BuildIndexesPanel()),
                }
            }
        };
    }

    private readonly ModelNode _modelNode;
    private readonly EntityModel _entityModel;
    private readonly string _modelId;
    private readonly DataGridController<PrimaryKeyField> _pkController = new();
    private readonly DataGridController<SqlIndexModel> _ixController = new();

    private Widget BuildPrimaryKeysPanel() => new Card
    {
        Padding = EdgeInsets.All(10),
        Child = new Column(HorizontalAlignment.Left, 10)
        {
            Children =
            {
                new Text("Primary Keys:") { FontSize = 20, FontWeight = FontWeight.Bold },
                new ButtonGroup()
                {
                    Children =
                    {
                        new Button("Add", MaterialIcons.Add) { OnTap = OnAddPk },
                        new Button("Remove", MaterialIcons.Remove) { OnTap = OnRemovePk }
                    }
                },
                new DataGrid<PrimaryKeyField>(_pkController)
                    .AddTextColumn("Name", t => _entityModel.Members.First(m => m.MemberId == t.MemberId).Name)
                    .AddCheckboxColumn("OrderByDesc", t => t.OrderByDesc)
                    .AddCheckboxColumn("AllowChange", t => t.AllowChange)
            }
        }
    };

    private Widget BuildIndexesPanel() => new Card
    {
        Padding = EdgeInsets.All(10),
        Child = new Column(HorizontalAlignment.Left, 10)
        {
            Children =
            {
                new Text("Indexes:") { FontSize = 20, FontWeight = FontWeight.Bold },
                new ButtonGroup
                {
                    Children =
                    {
                        new Button("Add", MaterialIcons.Add),
                        new Button("Remove", MaterialIcons.Remove)
                    }
                },
                new DataGrid<SqlIndexModel>(_ixController)
                    .AddTextColumn("Name", t => t.Name)
                    .AddTextColumn("Fields", GetIndexesFieldsList)
                    .AddCheckboxColumn("Unique", t => t.Unique)
            }
        }
    };

    private string GetIndexesFieldsList(SqlIndexModel indexMode)
    {
        var s = "";
        for (var i = 0; i < indexMode.Fields.Length; i++)
        {
            if (i != 0)
                s += ", ";
            s += _entityModel.Members.First(m => m.MemberId == indexMode.Fields[i].MemberId).Name;
            if (indexMode.Fields[i].OrderByDesc)
                s += " OrderByDesc";
        }

        return s;
    }

    private async void OnAddPk(PointerEvent e)
    {
        var dlg = new NewPKFieldDialog(_entityModel);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        var pkField = dlg.GetResult();
        if (pkField == null) return;

        var oldPks = _entityModel.SqlStoreOptions!.PrimaryKeys ?? [];
        var newPks = oldPks.ToList();
        newPks.Add(pkField.Value);

        ChangePrimaryKeys(newPks.ToArray());
        _pkController.DataSource = _entityModel.SqlStoreOptions!.PrimaryKeys; //_pkController.Refresh();
    }

    private void OnRemovePk(PointerEvent e)
    {
        if (_pkController.CurrentRowIndex < 0) return;

        var oldPks = _entityModel.SqlStoreOptions!.PrimaryKeys;
        var newPks = oldPks.ToList();
        newPks.RemoveAt(_pkController.CurrentRowIndex);

        ChangePrimaryKeys(newPks.ToArray());
        _pkController.ClearSelection();
        _pkController.DataSource = _entityModel.SqlStoreOptions!.PrimaryKeys; //_pkController.Refresh();
    }

    private void ChangePrimaryKeys(PrimaryKeyField[]? primaryKeys)
    {
        try
        {
            AppBoxDesign.ChangePrimaryKeys.Execute(_modelNode, primaryKeys);
        }
        catch (Exception ex)
        {
            //TODO: rollback to pre state
            Notification.Error($"Change primary keys error: {ex.Message}");
        }
    }
}