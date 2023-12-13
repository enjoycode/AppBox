using System.Linq;
using AppBoxClient.Dynamic.Events;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.EventEditors;

internal sealed class FetchDataSetEditor : SingleChildWidget
{
    public FetchDataSetEditor(DesignElement element, DynamicEventMeta eventMeta, IEventAction eventAction)
    {
        var action = (FetchDataSet)eventAction;

        var dsName = new RxProxy<string?>(() => action.DataSet, v => action.DataSet = v ?? string.Empty);
        var allDS = element.Controller.GetAllDataSet().Select(d => d.Name).ToArray();

        Child = new Form()
        {
            LabelWidth = 90,
            Children =
            {
                new("DataSet:", new Select<string>(dsName) { Options = allDS })
            }
        };
    }
}