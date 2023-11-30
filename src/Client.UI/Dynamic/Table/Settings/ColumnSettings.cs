using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic.Settings;

public abstract class ColumnSettings
{
    public string Label { get; set; }
    
    public string Field { get; set; }

    protected abstract DataGridColumn<DynamicEntity> BuildColumn();
}