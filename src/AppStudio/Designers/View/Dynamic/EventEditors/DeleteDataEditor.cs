using AppBoxClient.Dynamic.Events;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.EventEditors;

internal sealed class DeleteDataEditor : SingleChildWidget
{
    public DeleteDataEditor(DesignElement element, DynamicEventMeta eventMeta, IEventAction eventAction)
    {
        var action = (DeleteData)eventAction;

        var dsName = new RxProxy<string?>(() => action.DataSource, v => action.DataSource = v ?? string.Empty);
        var msg = new RxProxy<string>(() => action.ConfirmMessage, v => action.ConfirmMessage = v);
        var allDs = element.Controller.FindDataTableAndDataRowStates().Select(d => d.Name).ToArray();

        Child = new Form()
        {
            LabelWidth = 90,
            Children =
            {
                new("DataSource:", new Select<string>(dsName) { Options = allDs }),
                new("ConfirmMessage:", new TextInput(msg)),
            }
        };
    }
}