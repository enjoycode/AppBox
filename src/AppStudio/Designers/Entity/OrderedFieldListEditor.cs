using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 排序的字段列表编辑器
/// </summary>
internal sealed class OrderedFieldListEditor : SingleChildWidget
{
    public OrderedFieldListEditor(SqlStoreOptions sqlStoreOptions, IList<OrderedField> list)
    {
        _sqlStoreOptions = sqlStoreOptions;
        _listController = new DataGridController<OrderedField>();
        _listController.DataSource = list;
        if (list.Count > 0) //默认选择第一项
            _listController.SelectAt(0);

        //Height = 100;

        Child = new Column()
        {
            Spacing = 5,
            Alignment = HorizontalAlignment.Left,
            Children =
            [
                new ButtonGroup()
                {
                    Height = CmdBarHeight,
                    Children =
                    [
                        new Button(icon: MaterialIcons.Add)
                            { Width = _buttonWidth, OnTap = _ => OnAdd() },
                        // new Button(icon: MaterialIcons.Edit) { Width = _buttonWidth, OnTap = _ => OnEdit() },
                        new Button(icon: MaterialIcons.Remove) { Width = _buttonWidth, OnTap = _ => OnRemove() }
                    ]
                },

                new DataGrid<OrderedField>(_listController)
                    .AddTextColumn("Field", GetFieldName)
                    .AddCheckboxColumn("OrderByDesc", t => t.OrderByDesc, width: 108)
            ]
        };
    }

    private const float CmdBarHeight = 20;
    private readonly SqlStoreOptions _sqlStoreOptions;
    private readonly State<float> _buttonWidth = 20;
    private readonly DataGridController<OrderedField> _listController;

    private string GetFieldName(OrderedField field)
    {
        return _sqlStoreOptions.Owner.Members.First(m => m.MemberId == field.MemberId).Name;
    }

    private async void OnAdd()
    {
        var dlg = new NewOrderedFieldDialog(_sqlStoreOptions.Owner);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        _listController.Add(dlg.GetResult()!.Value);
    }

    private void OnRemove()
    {
        if (_listController.CurrentRowIndex < 0) return;
        _listController.RemoveAt(_listController.CurrentRowIndex);
    }
}