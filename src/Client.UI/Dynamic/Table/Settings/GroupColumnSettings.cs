using System.Text.Json.Serialization;
using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class GroupColumnSettings : TableColumnSettings
{
    [JsonIgnore] public override string Type => Group;

    public List<TableColumnSettings> Children { get; set; } = new();

    protected internal override DataGridColumn<DataRow> BuildColumn(DataGridController<DataRow> controller)
    {
        var col = new DataGridGroupColumn<DataRow>(Label);
        if (Children is { Count: > 0 })
        {
            for (var i = 0; i < Children.Count; i++)
            {
                var child = Children[i].BuildColumn(controller);
                col.Children.Add(child);
            }
        }

        return col;
    }

    public override TableColumnSettings Clone()
    {
        var cloned = new GroupColumnSettings { Label = Label };
        if (Children is { Count: > 0 })
        {
            for (var i = 0; i < Children.Count; i++)
            {
                cloned.Children.Add(Children[i].Clone());
            }
        }

        return cloned;
    }
}