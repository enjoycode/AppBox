using AppBoxClient.Dynamic.Events;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.EventEditors;

internal sealed class ShowDialogEditor : SingleChildWidget
{
    public ShowDialogEditor(DesignElement element, DynamicEventMeta eventMeta, IEventAction eventAction)
    {
        _showDialogAction = (ShowDialog)eventAction;
        _targetView = new RxProxy<string>(() => _showDialogAction.TargetView, v => _showDialogAction.TargetView = v);
        _width = new RxProxy<int>(() => _showDialogAction.DialogWidth, v => _showDialogAction.DialogWidth = v);
        _height = new RxProxy<int>(() => _showDialogAction.DialogHeight, v => _showDialogAction.DialogHeight = v);
        _dgController.DataSource = _showDialogAction.Parameters;

        Child = Build();
    }

    private readonly DataGridController<ViewParameter> _dgController = new();
    private readonly ShowDialog _showDialogAction;
    private readonly State<string> _targetView;
    private readonly State<int> _width;
    private readonly State<int> _height;

    private Widget Build() => new Column()
    {
        Alignment = HorizontalAlignment.Left,
        Children =
        [
            new Form()
            {
                LabelWidth = 90,
                Children =
                {
                    new("TargetView:", new TextInput(_targetView)),
                    new("Width:", new NumberInput<int>(_width)),
                    new("Height:", new NumberInput<int>(_height)),
                    new("Parameters:", new ButtonGroup
                    {
                        Children =
                        {
                            new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAddViewParameter() },
                            new Button(icon: MaterialIcons.Remove) { OnTap = _ => { } },
                        }
                    })
                }
            },
            new DataGrid<ViewParameter>(_dgController)
                .AddTextColumn("State", v => v.StateName)
                .AddTextColumn("Source", v => v.Source.Name)
                .AddButtonColumn("Edit", (v, _) => new Button(icon: MaterialIcons.Edit)
                {
                    Style = ButtonStyle.Transparent,
                    Shape = ButtonShape.Pills,
                    OnTap = _ => OnEditViewParameter(v),
                }, 50)
        ]
    };

    private async void OnAddViewParameter()
    {
        if (string.IsNullOrEmpty(_targetView.Value))
        {
            Notification.Error("Please set target view first.");
            return;
        }

        var dlg = new AddViewParameterDialog();
        var res = await dlg.ShowAsync();
        if (res != DialogResult.OK)
            return;

        var viewParameter = dlg.GetViewParameter();
        _dgController.Add(viewParameter);
    }

    private static void OnEditViewParameter(ViewParameter viewParameter)
    {
        if (viewParameter.Source is FetchRowParameter fetchRowParameter)
        {
            var dlg = new PkValuesDialog(fetchRowParameter);
            dlg.Show();
        }
    }
}