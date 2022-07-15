using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxDesign;

public sealed class SqlStoreOptionsVO
{
    public long StoreModelId { get; private set; }

    public IList<FieldWithOrder> PrimaryKeys { get; private set; }

#if __APPBOXDESIGN__
    public static SqlStoreOptionsVO From(SqlStoreOptions options)
    {
        var vo = new SqlStoreOptionsVO();
        vo.StoreModelId = options.StoreModelId;
        vo.PrimaryKeys = options.HasPrimaryKeys
            ? new List<FieldWithOrder>(options.PrimaryKeys)
            : new List<FieldWithOrder>();

        //TODO: indexes

        return vo;
    }

    internal void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(StoreModelId);
        ws.WriteVariant(PrimaryKeys.Count);
        for (var i = 0; i < PrimaryKeys.Count; i++)
        {
            PrimaryKeys[i].WriteTo(ws);
        }
    }

#else
    internal void ReadFrom(IInputStream rs)
    {
        StoreModelId = rs.ReadLong();
        var pkCount = rs.ReadVariant();
        PrimaryKeys = new List<FieldWithOrder>();
        if (pkCount > 0)
        {
            for (var i = 0; i < pkCount; i++)
            {
                var pk = new FieldWithOrder();
                pk.ReadFrom(rs);
                PrimaryKeys.Add(pk);
            }
        }
    }

#endif
}