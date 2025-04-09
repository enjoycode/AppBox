using AppBoxClient.Dynamic.Events;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.EventEditors;

internal sealed class FetchDataEditor : SingleChildWidget
{
    public FetchDataEditor(DesignElement element, DynamicEventMeta eventMeta, IEventAction eventAction)
    {
        var action = (FetchData)eventAction;

        var dsName = new RxProxy<string?>(() => action.DataSource, v => action.DataSource = v ?? string.Empty);
        var allDs = element.Controller.FindDataTableAndDataRowStates().Select(d => d.Name).ToArray();

        Child = new Form()
        {
            LabelWidth = 90,
            Children =
            {
                new("DataSource:", new Select<string>(dsName) { Options = allDs })
            }
        };
    }
}