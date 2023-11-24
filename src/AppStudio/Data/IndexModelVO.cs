using System;
using AppBoxCore;

namespace AppBoxDesign;

public abstract class IndexModelVO : IBinSerializable
{
    public byte IndexId { get; protected set; }
    public string Name { get; protected set; } = null!;
    public bool Unique { get; protected set; }
    public OrderedField[] Fields { get; protected set; } = null!;

#if __APPBOXDESIGN__
    public void WriteTo(IOutputStream ws)
    {
        ws.WriteByte(IndexId);
        ws.WriteString(Name);
        ws.WriteBool(Unique);
        ws.WriteVariant(Fields.Length);
        for (var i = 0; i < Fields.Length; i++)
        {
            Fields[i].WriteTo(ws);
        }
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

#else
    public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

    public void ReadFrom(IInputStream rs)
    {
        IndexId = rs.ReadByte();
        Name = rs.ReadString()!;
        Unique = rs.ReadBool();
        Fields = new OrderedField[rs.ReadVariant()];
        for (var i = 0; i < Fields.Length; i++)
        {
            Fields[i].ReadFrom(rs);
        }
    }
#endif
}

public sealed class SqlIndexModelVO : IndexModelVO
{
#if __APPBOXDESIGN__
    public static SqlIndexModelVO From(SqlIndexModel indexModel)
    {
        var vo = new SqlIndexModelVO();
        vo.IndexId = indexModel.IndexId;
        vo.Name = indexModel.Name;
        vo.Unique = indexModel.Unique;
        vo.Fields = indexModel.Fields;
        return vo;
    }
#endif
}