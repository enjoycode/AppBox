using AppBoxClient.Dynamic.Events;
using PixUI;

namespace AppBoxDesign.EventEditors;

/// <summary>
/// 用于FetchRow时设置主键的值
/// </summary>
internal sealed class PkValuesDialog : Dialog
{
    public PkValuesDialog(FetchRowParameter fetchRowParameter)
    {
        Width = 580;
        Height = 430;
        Title.Value = "PrimaryKeys for FetchRow";

        _dgController.DataSource = fetchRowParameter.PkValues;
    }

    private readonly DataGridController<FetchRowParameter.PrimaryKeyValue> _dgController = new();

    protected override Widget BuildBody() => new Container()
    {
        Padding = EdgeInsets.All(20),
        Child = new DataGrid<FetchRowParameter.PrimaryKeyValue>(_dgController)
            .AddHostColumn("TargetField", (pk, _) =>
            {
                var s = new RxProxy<string>(() => pk.TargetFieldName, v => pk.TargetFieldName = v);
                return new TextInput(s) { Border = null };
            })
            .AddHostColumn("FromState", (pk, _) =>
            {
                var s = new RxProxy<string>(() => pk.FromStateName, v => pk.FromStateName = v);
                return new TextInput(s) { Border = null };
            })
    };

    protected override Widget BuildFooter() => new Container
    {
        Height = Button.DefaultHeight + 20 + 20,
        Padding = EdgeInsets.All(20),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children =
            [
                new Expanded(),
                new Button("Add") { Width = 80, OnTap = _ => OnAddPrimaryKeyValue() },
                new Button("Remove") { Width = 80 },
                new Button("Close") { Width = 80, OnTap = _ => Close(DialogResult.OK) }
            ]
        }
    };

    private void OnAddPrimaryKeyValue()
    {
        _dgController.Add(new FetchRowParameter.PrimaryKeyValue());
    }
}