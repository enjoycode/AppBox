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

    public async ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args)
        where T : struct, IAnyArgs
    {
        //验证Developer权限
        if (!RuntimeContext.HasPermission(DeveloperPermissionId))
            throw new Exception("Must login as a developer");

        switch (method.Span)
        {
            case "LoadMetadataReference":
                return MetadataReferenceService.LoadMetadataReference(args.GetInt()!.Value, args.GetString()!);
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
            case "BeginUploadApp":
                PublishService.BeginUploadApp();
                return AnyValue.Empty;
            case "UploadAppAssembly":
                await PublishService.UploadAppAssembly((MessageReadStream)args.InputStream!);
                return AnyValue.Empty;
            case "UploadViewAssemblyMap":
                await PublishService.UploadViewAssemblyMap((MessageReadStream)args.InputStream!);
                return AnyValue.Empty;
            default:
                throw new Exception($"Unknown design method: {method}");
        }
    }

    #region ====Entity====

    private static async ValueTask<AnyValue> GetEntityRows<T>(T args) where T : struct, IAnyArgs
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

        var q = new DynamicQuery() { ModelId = modelId };
        var t = new EntityExpression(modelId, null);
        q.Selects = new DynamicQuery.SelectItem[fields.Length];
        for (var i = 0; i < fields.Length; i++)
        {
            q.Selects[i] = new DynamicQuery.SelectItem(fields[i].Name, t[fields[i].Name],
                DataCell.DataTypeFromEntityFieldType(fields[i].FieldType));
        }

        q.PageSize = pageSize;
        q.PageIndex = 0;

        var query = new SqlDynamicQuery(q);
        var res = await query.ToDataTableAsync();
        return AnyValue.From(res);
    }

    #endregion
}