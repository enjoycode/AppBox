using System.Diagnostics;

namespace AppBoxCore;

public sealed class EnumModel : ModelBase
{
    internal EnumModel() { }

    public EnumModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.Enum);
    }

    public bool IsFlag { get; set; }

    public string? Comment { get; set; }
    
    public List<EnumItem> Items { get; } = [];

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        
        ws.WriteBool(IsFlag);
        ws.WriteString(Comment);
        
        ws.WriteVariant(Items.Count);
        foreach (var item in Items)
        {
            ws.WriteString(item.Name);
            ws.WriteInt(item.Value);
            ws.WriteString(item.Comment);
        }
        
        ws.WriteFieldEnd(); //保留
    }
    
    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        IsFlag = rs.ReadBool();
        Comment = rs.ReadString();

        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var item = new EnumItem();
            item.Name = rs.ReadString()!;
            item.Value = rs.ReadInt();
            item.Comment = rs.ReadString();
            Items.Add(item);
        }

        rs.ReadFieldId(); //保留
    }

    #endregion
}

public sealed class EnumItem
{
    public string Name { get; internal set; } = null!;

    public int Value { get; internal set; }

    public string? Comment { get; internal set; }
}