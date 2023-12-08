using System.Data.Common;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxDesign;

/// <summary>
/// 设计时预览获取实体记录(目前只支持SqlStore)
/// </summary>
internal sealed class GetEntityRows : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var pageSize = args.GetInt()!.Value;

        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find entity model: {modelId}");
        var model = (EntityModel)modelNode.Model;
        if (model.SqlStoreOptions == null)
            throw new NotSupportedException("Only support SqlStore now.");

        var fields = model.Members
            .Where(m => m.Type == EntityMemberType.EntityField)
            .Cast<EntityFieldModel>()
            .ToArray();

        var db = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
        await using var cmd = db.MakeCommand();
        cmd.CommandText = BuildCommand(model, fields, pageSize, db);
        var ds = BuildDataSet(model, fields);

        await using var conn = await db.OpenConnectionAsync();
        cmd.Connection = conn;
        await using var dr = await cmd.ExecuteReaderAsync();
        while (await dr.ReadAsync())
        {
            FetchRow(fields, ds, dr);
        }

        return AnyValue.From(ds);
    }

    private static void FetchRow(EntityFieldModel[] fields, DynamicDataSet ds, DbDataReader dr)
    {
        var obj = new DynamicEntity();
        ds.Add(obj);
        for (var i = 0; i < fields.Length; i++)
        {
            obj[fields[i].Name] = fields[i].FieldType switch
            {
                EntityFieldType.String => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetString(i),
                EntityFieldType.DateTime => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetDateTime(i).ToLocalTime(),
                EntityFieldType.Short => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt16(i),
                EntityFieldType.Int => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt32(i),
                EntityFieldType.Long => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt64(i),
                EntityFieldType.Decimal => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetDecimal(i),
                EntityFieldType.Bool => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetBoolean(i),
                EntityFieldType.Guid => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetGuid(i),
                EntityFieldType.Byte => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetByte(i),
                EntityFieldType.Binary => dr.IsDBNull(i) ? DynamicField.Empty : (byte[])dr.GetValue(i),
                EntityFieldType.Enum => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetInt32(i),
                EntityFieldType.Float => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetFloat(i),
                EntityFieldType.Double => dr.IsDBNull(i) ? DynamicField.Empty : dr.GetDouble(i),
                _ => throw new NotImplementedException()
            };
        }
    }

    private static DynamicDataSet BuildDataSet(EntityModel model, EntityFieldModel[] fields)
    {
        var colums = new DynamicFieldInfo[fields.Length];
        for (var i = 0; i < fields.Length; i++)
        {
            colums[i] = new DynamicFieldInfo(fields[i].Name, GetFieldType(fields[i]));
        }

        return new DynamicDataSet(colums);
    }

    private static DynamicFieldFlag GetFieldType(EntityFieldModel field) => field.FieldType switch
    {
        EntityFieldType.String => DynamicFieldFlag.String,
        EntityFieldType.DateTime => DynamicFieldFlag.DateTime,
        EntityFieldType.Short => DynamicFieldFlag.Short,
        EntityFieldType.Int => DynamicFieldFlag.Int,
        EntityFieldType.Long => DynamicFieldFlag.Long,
        EntityFieldType.Decimal => DynamicFieldFlag.Decimal,
        EntityFieldType.Bool => DynamicFieldFlag.Bool,
        EntityFieldType.Guid => DynamicFieldFlag.Guid,
        EntityFieldType.Byte => DynamicFieldFlag.Byte,
        EntityFieldType.Binary => DynamicFieldFlag.Binary,
        EntityFieldType.Enum => DynamicFieldFlag.Int,
        EntityFieldType.Float => DynamicFieldFlag.Float,
        EntityFieldType.Double => DynamicFieldFlag.Double,
        _ => throw new NotImplementedException()
    };

    private static string BuildCommand(EntityModel model, EntityFieldModel[] fields, int pageSize, SqlStore db)
    {
        var sb = StringBuilderCache.Acquire();

        //TODO: 特殊处理不同数据库的sql,暂仅Postgres

        sb.Append("Select ");
        sb.Append(' ');
        for (var i = 0; i < fields.Length; i++)
        {
            if (i != 0) sb.Append(',');
            sb.AppendWithNameEscaper(fields[i].SqlColOriginalName, db.NameEscaper);
        }

        sb.Append(" From ");
        sb.AppendWithNameEscaper(model.SqlStoreOptions!.GetSqlTableName(true, null), db.NameEscaper);

        sb.Append(" Limit ");
        sb.Append(pageSize);

        return StringBuilderCache.GetStringAndRelease(sb);
    }
}