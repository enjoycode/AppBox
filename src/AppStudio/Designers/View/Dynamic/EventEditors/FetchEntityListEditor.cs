using AppBoxClient.Dynamic.Events;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.EventEditors;

internal sealed class FetchEntityListEditor : SingleChildWidget
{
    public FetchEntityListEditor(DesignElement element, DynamicEventMeta eventMeta, IEventAction eventAction)
    {
        var action = (FetchDataSource)eventAction;

        var dsName = new RxProxy<string?>(() => action.DataSource, v => action.DataSource = v ?? string.Empty);
        var allDS = element.Controller.FindDataTableStates().Select(d => d.Name).ToArray();

        Child = new Form()
        {
            LabelWidth = 90,
            Children =
            {
                new("DataSource:", new Select<string>(dsName) { Options = allDS })
            }
        };
    }
}