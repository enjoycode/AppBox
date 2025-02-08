using System.Data.Common;
using AppBoxCore;
using AppBoxDesign;
using AppBoxServer.Design;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 设计时服务
/// </summary>
internal sealed class DesignService : IService
{
    static DesignService()
    {
        //注册设计时序列化器
        DesignTypeSerializer.Register();
    }

    private static readonly ModelId DeveloperPermissionId =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 2, ModelLayer.SYS);

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        //验证Developer权限
        if (!RuntimeContext.HasPermission(DeveloperPermissionId))
            throw new Exception("Must login as a developer");

        switch (method.Span)
        {
            case "LoadAllApplication":
                return AnyValue.From(await MetaStore.Provider.LoadAllApplicationAsync());
            case "LoadAllFolder":
                return AnyValue.From(await MetaStore.Provider.LoadAllFolderAsync());
            case "LoadAllModel":
                return AnyValue.From(await MetaStore.Provider.LoadAllModelAsync());
            case "LoadModelCode":
                return await MetaStore.Provider.LoadModelCodeAsync(args.GetLong()!.Value) ?? AnyValue.Empty;
            case "GenModelId":
                return (long)(await MetaStore.Provider.GenModelIdAsync(
                    args.GetInt()!.Value, (ModelType)args.GetInt()!.Value, (ModelLayer)args.GetInt()!.Value));
            case "CheckoutLoadAll":
                return AnyValue.From(await CheckoutService.LoadAllAsync());
            case "Checkout":
                return AnyValue.From(await CheckoutService.CheckoutAsync(args.GetList<CheckoutInfo>()));
            case "StageLoadAll":
                return AnyValue.From(await StagedService.LoadStagedAsync());
            case "StageLoadChanges":
                return AnyValue.From(await StagedService.LoadChangesAsync());
            case "StageLoadCode":
                var code = await StagedService.LoadCodeAsync(args.GetLong()!.Value);
                return code ?? AnyValue.Empty;
            case "StageSaveModel":
                await StagedService.SaveModelAsync((ModelBase)args.GetObject()!);
                return AnyValue.Empty;
            case "StageSaveFolder":
                await StagedService.SaveFolderAsync((ModelFolder)args.GetObject()!);
                return AnyValue.Empty;
            case "StageSaveCode":
                await StagedService.SaveCodeAsync(args.GetLong()!.Value, args.GetString()!);
                return AnyValue.Empty;
            case "StageDeleteModel":
                await StagedService.DeleteModelAsync(args.GetLong()!.Value);
                return AnyValue.Empty;
            case "GetEntityRows":
                return await GetEntityRows(args);
            case "Publish":
                await PublishService.PublishAsync((PublishPackage)args.GetObject()!, args.GetString());
                return AnyValue.Empty;
            default:
                throw new Exception($"Unknown design method: {method}");
        }
    }

    #region ====Entity====

    private static async ValueTask<AnyValue> GetEntityRows(InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var pageSize = args.GetInt()!.Value;


        var model = await RuntimeContext.GetModelAsync<EntityModel>(modelId);
        if (model.SqlStoreOptions == null)
            throw new NotSupportedException("Only support SqlStore now.");

        var fields = model.Members
            .Where(m => m.Type == EntityMemberType.EntityField)
            .Cast<EntityFieldModel>()
            .ToArray();

        var db = SqlStore.Get(model.SqlStoreOptions.StoreModelId);
        await using var cmd = db.MakeCommand();
        cmd.CommandText = BuildCommand(model, fields, pageSize, db);
        var ds = BuildDataSet(fields);

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

    private static DynamicDataSet BuildDataSet(EntityFieldModel[] fields)
    {
        var columns = new DynamicFieldInfo[fields.Length];
        for (var i = 0; i < fields.Length; i++)
        {
            columns[i] = new DynamicFieldInfo(fields[i].Name, GetFieldType(fields[i]));
        }

        return new DynamicDataSet(columns);
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

    #endregion
}