using AppBoxClient.Dynamic.Events;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.EventEditors;

internal sealed class SaveDataEditor : SingleChildWidget
{
    public SaveDataEditor(DesignElement element, DynamicEventMeta eventMeta, IEventAction eventAction)
    {
        var saveDataAction = (SaveData)eventAction; //考虑清除已不存在的项
        var dgController = new DataGridController<DynamicState>();
        dgController.DataSource = element.Controller.FindDataTableAndDataRowStates().ToList();

        Child = new DataGrid<DynamicState>(dgController)
            .AddCheckboxColumn("",
                s => saveDataAction.DataSources.Contains(s.Name),
                (s, v) =>
                {
                    if (v)
                        saveDataAction.DataSources.Add(s.Name);
                    else
                        saveDataAction.DataSources.Remove(s.Name);
                }, 56)
            .AddTextColumn("Name", static s => s.Name)
            .AddTextColumn("Type", static s => s.Type.ToString());
    }
}