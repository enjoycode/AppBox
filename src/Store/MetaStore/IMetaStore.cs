using System;
using System.Data.Common;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxStore;

public interface IMetaStore
{
    Task CreateApplicationAsync(ApplicationModel app, DbTransaction txn);

    Task<ModelId> GenModelIdAsync(int appId, ModelType type, ModelLayer layer);

    Task UpsertFolderAsync(ModelFolder folder, DbTransaction txn);

    Task DeleteFolderAsync(ModelFolder folder, DbTransaction txn);

    Task InsertModelAsync(ModelBase model, DbTransaction txn);

    Task UpdateModelAsync(ModelBase model, DbTransaction txn, Func<int, ApplicationModel> getApp);

    Task DeleteModelAsync(ModelBase model, DbTransaction txn, Func<int, ApplicationModel> getApp);

    Task UpsertModelCodeAsync(ModelId modelId, byte[] codeData, DbTransaction txn);

    Task DeleteModelCodeAsync(ModelId modelId, DbTransaction txn);

    Task UpsertAssemblyAsync(MetaAssemblyType type, string asmName, byte[] asmData,
        DbTransaction txn, AssemblyFlag flag = AssemblyFlag.PlatformAll);

    Task DeleteAssemblyAsync(MetaAssemblyType type, string asmName, DbTransaction txn);

    /// <summary>
    /// 删除前端应用所有的程序集，用于重新Build web application
    /// </summary>
    Task DeleteAllAppAssembliesAsync(DbTransaction txn);

    Task<byte[]?> LoadMetaDataAsync(byte metaType, string id);

    Task<T[]> LoadMetasAsync<T>(byte metaType) where T : IBinSerializable;

    /// <summary>
    /// 加载所有标为动态组件的视图模型的名称，用于设计时注册动态组件至工具箱
    /// </summary>
    Task<string[]> LoadDynamicWidgetsAsync();
}

public static class MetaStoreExtensions
{
    /// <summary>
    /// 用于运行时加载单个ApplicationModel
    /// </summary>
    public static async ValueTask<ApplicationModel> LoadApplicationAsync(this IMetaStore metaStore, int appId)
    {
        var data = await metaStore.LoadMetaDataAsync(MetaType.Meta_Application, appId.ToString());
        return MetaSerializer.DeserializeMeta(data!, () => new ApplicationModel());
    }

    /// <summary>
    /// 加载单个Model，用于运行时或设计时重新加载
    /// </summary>
    public static async Task<ModelBase> LoadModelAsync(this IMetaStore metaStore, ModelId modelId)
    {
        var data = await metaStore.LoadMetaDataAsync(MetaType.Meta_Model, modelId.ToString());
        var model = MetaSerializer.DeserializeMeta(data!, () => ModelFactory.Make(modelId.Type));
        model.AcceptChanges();
        return model;
    }

    /// <summary>
    /// 加载模型(视图、服务等)的代码
    /// </summary>
    public static async Task<string> LoadModelCodeAsync(this IMetaStore metaStore, ModelId modelId)
    {
        var data = await metaStore.LoadMetaDataAsync(MetaType.Meta_Code, modelId.ToString());
        return ModelCodeUtil.DecompressCode(data!);
    }

    /// <summary>
    /// 用于运行时加载动态视图模型的json配置
    /// </summary>
    /// <returns>utf8 bytes</returns>
    public static async Task<byte[]?> LoadDynamicViewJsonAsync(this IMetaStore metaStore, ModelId viewModelId)
    {
        var data = await metaStore.LoadMetaDataAsync(MetaType.Meta_Code, viewModelId.ToString());
        if (data == null || data.Length == 0) return null;
        return ModelCodeUtil.DecompressCodeToUtf8Bytes(data);
    }

    /// <summary>
    /// 加载视图模型所依赖的所有程序集列表
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="viewModelName">eg: sys.HomePage</param>
    /// <returns>json data: ["A","B"]</returns>
    public static Task<byte[]?> LoadViewAssembliesAsync(this IMetaStore metaStore, string viewModelName)
    {
        return metaStore.LoadMetaDataAsync((byte)MetaAssemblyType.ViewAssemblies, viewModelName);
    }

    /// <summary>
    /// 运行时加载压缩过的视图模型的JS代码
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="viewName">eg: sys.HomePage</param>
    public static Task<byte[]?> LoadViewAssemblyAsync(this IMetaStore metaStore, string viewName)
    {
        return metaStore.LoadMetaDataAsync((byte)MetaAssemblyType.View, viewName);
    }

    /// <summary>
    /// 加载客户端应用的程序集
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="assemblyName">16进制编码的序号</param>
    /// <returns>压缩过的程序集</returns>
    public static Task<byte[]?> LoadAppAssemblyAsync(this IMetaStore metaStore, string assemblyName)
    {
        return metaStore.LoadMetaDataAsync((byte)MetaAssemblyType.Application, assemblyName);
    }

    /// <summary>
    /// 运行时加载压缩过的服务组件或应用的第三方组件
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="serviceName">eg: sys.HelloService or sys.Newtonsoft.Json.dll</param>
    public static Task<byte[]?> LoadServiceAssemblyAsync(this IMetaStore metaStore, string serviceName)
    {
        //TODO:考虑保存至本地文件，返回路径
        //暂通过判断有无扩展名来区别是服务的组件还是第三方的组件
        if (serviceName.Length >= 4 &&
            serviceName.AsSpan(serviceName.Length - 4).SequenceEqual(".dll"))
            return metaStore.LoadMetaDataAsync((byte)MetaAssemblyType.Application, serviceName);
        return metaStore.LoadMetaDataAsync((byte)MetaAssemblyType.Service, serviceName);
    }

    /// <summary>
    /// 用于设计时加载所有ApplicationModel
    /// </summary>
    public static Task<ApplicationModel[]> LoadAllApplicationAsync(this IMetaStore metaStore)
    {
        return metaStore.LoadMetasAsync<ApplicationModel>(MetaType.Meta_Application);
    }

    /// <summary>
    /// 用于设计时加载所有Model
    /// </summary>
    public static async Task<ModelBase[]> LoadAllModelAsync(this IMetaStore metaStore)
    {
        var res = await metaStore.LoadMetasAsync<ModelBase>(MetaType.Meta_Model);
        foreach (var model in res)
        {
            model.AcceptChanges(); //暂循环转换状态
        }

        return res;
    }

    /// <summary>
    /// 用于设计时加载所有Folder
    /// </summary>
    public static Task<ModelFolder[]> LoadAllFolderAsync(this IMetaStore metaStore)
    {
        return metaStore.LoadMetasAsync<ModelFolder>(MetaType.Meta_Folder);
    }
}