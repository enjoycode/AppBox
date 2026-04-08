using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

public interface IMetaStore
{
    Task CreateApplicationAsync(ApplicationModel app, DbTransaction txn);

    Task<ModelId> GenModelIdAsync(int appId, ModelType type, ModelLayer layer);

    Task UpsertFolderAsync(ModelFolder folder, DbTransaction txn);

    Task DeleteFolderAsync(ModelFolder folder, DbTransaction txn);

    Task InsertModelAsync(ModelBase model, DbTransaction txn);

    Task UpdateModelAsync(ModelBase model, DbTransaction txn);

    Task DeleteModelAsync(ModelBase model, DbTransaction txn);

    Task UpsertModelCodeAsync(ModelId modelId, byte[] codeData, DbTransaction txn);

    Task DeleteModelCodeAsync(ModelId modelId, DbTransaction txn);

    Task UpsertAssemblyAsync(MetaAssemblyType type, string asmName, byte[] asmData,
        DbTransaction? txn, AssemblyPlatform flag = AssemblyPlatform.None);

    Task DeleteAssemblyAsync(MetaAssemblyType type, string asmName, DbTransaction txn);

    /// <summary>
    /// 删除前端应用所有的程序集，用于重新Build web application
    /// </summary>
    Task DeleteAllAppAssembliesAsync(DbTransaction txn);

    /// <summary>
    /// 加载单个元数据
    /// </summary>
    Task LoadMetaDataAsync(Stream toStream, byte metaType, string id);

    /// <summary>
    /// 设计时加载所有指定类型的元数据
    /// </summary>
    Task LoadMetasAsync(Stream toStream, byte metaType, byte? model);

    /// <summary>
    /// 加载元数据名称列表
    /// </summary>
    /// <remarks>
    /// 1. 用于设计时注册动态组件至工具箱
    /// 2. 用于设计时列出外部程序集
    /// </remarks>
    Task<string[]> LoadMetaNamesAsync(byte metaType, byte? model);
}

public static class MetaStoreExtensions
{
    /// <summary>
    /// 用于运行时加载单个ApplicationModel
    /// </summary>
    public static async ValueTask<ApplicationModel> LoadApplicationAsync(this IMetaStore metaStore, int appId)
    {
        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, MetaType.META_APPLICATION, appId.ToString());
        ms.Seek(0, SeekOrigin.Begin);
        return MetaSerializer.DeserializeMeta(ms, () => new ApplicationModel());
    }

    /// <summary>
    /// 加载单个Model，用于运行时或设计时重新加载
    /// </summary>
    public static async Task<ModelBase> LoadModelAsync(this IMetaStore metaStore, ModelId modelId)
    {
        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, MetaType.META_MODEL, modelId.ToString());
        ms.Seek(0, SeekOrigin.Begin);
        var model = MetaSerializer.DeserializeMeta(ms, () => ModelFactory.Make(modelId.Type));
        model.AcceptChanges();
        return model;
    }

    /// <summary>
    /// 加载模型(视图、服务等)的代码
    /// </summary>
    public static async Task<Stream> DownloadModelCodeAsync(this IMetaStore metaStore, ModelId modelId)
    {
        //TODO:使用指定临时文件路径
        var inputFilePath = Path.GetTempFileName();
        var inputFileStream = File.Open(inputFilePath, FileMode.Create, FileAccess.ReadWrite);
        try
        {
            await metaStore.LoadMetaDataAsync(inputFileStream, MetaType.META_CODE, modelId.ToString());
            if (inputFileStream.Length == 0)
                throw new Exception("Can't download model code");

            inputFileStream.Seek(0, SeekOrigin.Begin);
            var outputFilePath = Path.GetTempFileName();
            var outputFileStream = File.Open(outputFilePath, FileMode.Create, FileAccess.ReadWrite);
            await ModelCodeUtil.DecompressCode(inputFileStream, outputFileStream);
            outputFileStream.Seek(0, SeekOrigin.Begin);
            return outputFileStream;
        }
        finally
        {
            inputFileStream.Close();
            File.Delete(inputFilePath);
        }
    }

    /// <summary>
    /// 用于运行时加载动态视图模型的json配置
    /// </summary>
    /// <returns>utf8 bytes</returns>
    public static async Task<byte[]?> LoadDynamicViewJsonAsync(this IMetaStore metaStore, ModelId viewModelId)
    {
        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, MetaType.META_CODE, viewModelId.ToString());
        if (ms.Length == 0) return null;
        return ModelCodeUtil.DecompressCodeToUtf8Bytes(ms.ToArray());
    }

    /// <summary>
    /// 加载视图模型所依赖的所有程序集列表
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="viewModelName">eg: sys.HomePage</param>
    /// <returns>json data: ["A","B"]</returns>
    public static async Task<byte[]?> LoadViewAssembliesAsync(this IMetaStore metaStore, string viewModelName)
    {
        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, (byte)MetaAssemblyType.ViewAssemblies, viewModelName);
        if (ms.Length == 0) return null;
        return ms.ToArray();
    }

    /// <summary>
    /// 运行时加载压缩过的视图模型的JS代码
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="viewName">eg: sys.HomePage</param>
    public static async Task<byte[]?> LoadViewAssemblyAsync(this IMetaStore metaStore, string viewName)
    {
        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, (byte)MetaAssemblyType.ViewJS, viewName);
        if (ms.Length == 0) return null;
        return ms.ToArray();
    }

    /// <summary>
    /// 加载客户端应用的程序集
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="assemblyName">16进制编码的序号</param>
    /// <returns>压缩过的程序集</returns>
    public static async Task<byte[]?> LoadAppAssemblyAsync(this IMetaStore metaStore, string assemblyName)
    {
        //TODO: 支持加载客户端应用依赖的外部程序集(可根据名称中是否包信'.'判断是否外部依赖)
        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, (byte)MetaAssemblyType.ClientApp, assemblyName);
        if (ms.Length == 0) return null;
        return ms.ToArray();
    }

    /// <summary>
    /// 运行时加载压缩过的服务组件或应用的第三方组件
    /// </summary>
    /// <param name="metaStore"></param>
    /// <param name="serviceName">eg: sys.HelloService or sys.Newtonsoft.Json.dll</param>
    public static async Task<byte[]?> LoadServiceAssemblyAsync(this IMetaStore metaStore, string serviceName)
    {
        //TODO:保存至本地文件，返回路径
        //暂通过判断有无扩展名来区别是服务的组件还是第三方的组件
        MetaAssemblyType assemblyType;
        if (serviceName.Length >= 4 && serviceName.AsSpan(serviceName.Length - 4) is ".dll")
            assemblyType = MetaAssemblyType.ExtService;
        else
            assemblyType = MetaAssemblyType.Service;

        using var ms = new MemoryStream();
        await metaStore.LoadMetaDataAsync(ms, (byte)assemblyType, serviceName);
        if (ms.Length == 0) return null;
        return ms.ToArray();
    }

    /// <summary>
    /// 加载所有标为动态组件的视图模型的名称，用于设计时注册动态组件至工具箱
    /// </summary>
    public static Task<string[]> LoadDynamicWidgetsAsync(this IMetaStore metaStore) =>
        metaStore.LoadMetaNamesAsync((byte)MetaAssemblyType.ViewAssemblies, (byte)AssemblyPlatform.ViewDynamic);
}