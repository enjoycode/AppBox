using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class SqlStoreOptionsDesigner : View
{
    internal SqlStoreOptionsDesigner(EntityModel entityModel, string modelId)
    {
        _entityModel = entityModel;
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
                {
                    Columns =
                    {
                        new DataGridTextColumn<PrimaryKeyField>("Name",
                            t => _entityModel.Members.First(m => m.MemberId == t.MemberId).Name),
                        new DataGridCheckboxColumn<PrimaryKeyField>("OrderByDesc",
                            t => t.OrderByDesc),
                        new DataGridCheckboxColumn<PrimaryKeyField>("AllowChange",
                            t => t.AllowChange),
                    }
                }
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
                {
                    Columns =
                    {
                        new DataGridTextColumn<SqlIndexModel>("Name", t => t.Name),
                        new DataGridTextColumn<SqlIndexModel>("Fields", GetIndexesFieldsList),
                        new DataGridCheckboxColumn<SqlIndexModel>("Unique", t => true),
                    }
                },
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

        _pkController.Add(pkField.Value);
        ChangePrimaryKeys();
    }

    private void OnRemovePk(PointerEvent e)
    {
        if (_pkController.CurrentRowIndex < 0) return;

        _pkController.RemoveAt(_pkController.CurrentRowIndex);
        ChangePrimaryKeys();
    }

    private async void ChangePrimaryKeys()
    {
        throw new NotImplementedException(nameof(ChangePrimaryKeys));
        // var args = new object?[]
        // {
        //     _modelId,
        //     _entityModel.SqlStoreOptions.PrimaryKeys.Count == 0
        //         ? null
        //         : _entityModel.SqlStoreOptions.PrimaryKeys.ToArray()
        // };
        // try
        // {
        //     await Channel.Invoke("sys.DesignService.ChangePrimaryKeys", args);
        // }
        // catch (Exception ex)
        // {
        //     //TODO: rollback to pre state
        //     Notification.Error($"Change primary keys error: {ex.Message}");
        // }
    }
}