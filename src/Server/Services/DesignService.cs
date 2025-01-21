using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxServer.Design;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 设计时服务
/// </summary>
internal sealed class DesignService : IService
{
    private static readonly ModelId DeveloperPermissionId =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Permission, 2, ModelLayer.SYS);

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        //验证Developer权限
        if (!HostRuntimeContext.HasPermission(DeveloperPermissionId))
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
                return await MetaStore.Provider.LoadModelCodeAsync(args.GetLong()!.Value);
            case "CheckoutLoadAll":
                return AnyValue.From(await CheckoutService.LoadAllAsync());
            case "StageLoadAll":
                return AnyValue.From(await StagedService.LoadStagedAsync(args.GetBool()!.Value));
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
            default:
                throw new Exception($"Unknown design method: {method}");
        }
    }
}