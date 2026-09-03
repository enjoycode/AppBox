using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class GroupColumnSettings : TableColumnSettings
{
    public List<TableColumnSettings> Children { get; } = [];

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

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        ws.WriteVariant(Children.Count);
        foreach (var child in Children)
        {
            ws.Serialize(child);
        }
    }
    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var child = (TableColumnSettings) rs.Deserialize()!;
            Children.Add(child);
        }
    }

    #endregion
}