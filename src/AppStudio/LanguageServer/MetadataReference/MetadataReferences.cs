using System.Runtime.InteropServices;
using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

/// <summary>
/// 管理虚拟工程需要引用的类库
/// </summary>
internal static class MetadataReferences
{
    private static readonly IMetadataReferenceProvider Provider =
        RuntimeInformation.ProcessArchitecture == Architecture.Wasm
            ? new ServerMetadataReferenceProvider()
            : new ClientMetadataReferenceProvider();

    private static readonly Dictionary<string, MetadataReference> MetaRefs = new();

    /// <summary>
    /// 初始化加载必需的MetadataReference
    /// </summary>
    internal static async ValueTask InitAsync()
    {
        string[] sdkLibs =
        [
            "System.Private.CoreLib.dll", "netstandard.dll", "System.Linq.dll", "System.Linq.Expressions.dll",
            "System.Text.Json.dll", "System.ObjectModel.dll", "System.Runtime.dll", "System.Collections.dll",
            "System.Private.Uri.dll", "System.Net.Http.dll",
            "System.Net.Http.Json.dll", "System.Data.Common.dll"
        ];

        string[] commonLibs = ["AppBoxCore.dll", "AppBoxStore.dll"];
        string[] clientLibs =
        [
            "PixUI.dll", "PixUI.Drawing.dll", "PixUI.Widgets.dll", "PixUI.MaterialIcons.dll", "LiveChartsCore.dll",
            "PixUI.LiveCharts.dll", "PixUI.Dynamic.dll", "PixUI.TSAttributes.dll", "AppBoxClient.dll",
            "AppBoxClientUI.dll"
        ];
        string[] serverLibs = ["AppBoxStore.dll"];

        var tasksCount = sdkLibs.Length + commonLibs.Length + clientLibs.Length + serverLibs.Length;
        var tasks = new Task<(string, MetadataReference)>[tasksCount];
        var offset = 0;
        for (var i = 0; i < sdkLibs.Length; i++)
        {
            var lib = sdkLibs[i];
            tasks[i + offset] = Task.Run(async () => (lib, await Provider.LoadSdkLib(lib)));
        }

        offset += sdkLibs.Length;

        for (var i = 0; i < commonLibs.Length; i++)
        {
            var lib = commonLibs[i];
            tasks[i + offset] = Task.Run(async () => (lib, await Provider.LoadCommonLib(lib)));
        }

        offset += commonLibs.Length;

        for (var i = 0; i < clientLibs.Length; i++)
        {
            var lib = clientLibs[i];
            tasks[i + offset] = Task.Run(async () => (lib, await Provider.LoadClientLib(lib)));
        }

        offset += clientLibs.Length;

        for (var i = 0; i < serverLibs.Length; i++)
        {
            var lib = serverLibs[i];
            tasks[i + offset] = Task.Run(async () => (lib, await Provider.LoadServerLib(lib)));
        }

        await Task.WhenAll(tasks);

        lock (MetaRefs)
        {
            foreach (var item in tasks)
            {
                MetaRefs[item.Result.Item1] = item.Result.Item2;
            }
        }
    }

    //@formatter:off
    internal static MetadataReference CoreLib => GetSdkLib("System.Private.CoreLib.dll");
    internal static MetadataReference NetstandardLib => GetSdkLib("netstandard.dll");
    internal static MetadataReference SystemLinqLib => GetSdkLib("System.Linq.dll");
    internal static MetadataReference SystemLinqExpressionsLib => GetSdkLib("System.Linq.Expressions.dll");
    internal static MetadataReference SystemJsonLib => GetSdkLib("System.Text.Json.dll");
    internal static MetadataReference SystemObjectModelLib => GetSdkLib("System.ObjectModel.dll");
    internal static MetadataReference SystemRuntimeLib => GetSdkLib("System.Runtime.dll");
    internal static MetadataReference SystemCollectionsLib => GetSdkLib("System.Collections.dll");
    internal static MetadataReference SystemPrivateUriLib => GetSdkLib("System.Private.Uri.dll");
    internal static MetadataReference SystemNetHttpLib => GetSdkLib("System.Net.Http.dll");
    internal static MetadataReference SystemNetHttpJsonLib => GetSdkLib("System.Net.Http.Json.dll");
    internal static MetadataReference SystemDataLib => GetSdkLib("System.Data.Common.dll");
    internal static MetadataReference PixUILib => GetClientLib("PixUI.dll");
    internal static MetadataReference PixUIDrawingLib => GetClientLib("PixUI.Drawing.dll");
    internal static MetadataReference PixUIWidgetsLib => GetClientLib("PixUI.Widgets.dll");
    internal static MetadataReference MaterialIconsLib => GetClientLib("PixUI.MaterialIcons.dll");
    internal static MetadataReference LiveChartsCoreLib => GetClientLib("LiveChartsCore.dll");
    internal static MetadataReference PixUILiveChartsLib => GetClientLib("PixUI.LiveCharts.dll");
    internal static MetadataReference PixUIDynamicLib => GetClientLib("PixUI.Dynamic.dll");
    internal static MetadataReference PixUIAttributesLib => GetClientLib("PixUI.TSAttributes.dll");
    internal static MetadataReference AppBoxCoreLib => GetCommonLib("AppBoxCore.dll");
    internal static MetadataReference AppBoxClientLib => GetClientLib("AppBoxClient.dll");
    internal static MetadataReference AppBoxClientUILib => GetClientLib("AppBoxClientUI.dll");
    internal static MetadataReference AppBoxStoreLib => GetLoaded("AppBoxStore.dll");
    private static MetadataReference GetSdkLib(string asmName) => GetLoaded(asmName);
    private static MetadataReference GetCommonLib(string asmName) => GetLoaded(asmName);
    private static MetadataReference GetClientLib(string asmName) => GetLoaded(asmName);
    //@formatter:on

    /// <summary>
    /// 仅获取已加载的MetadataReference，不存在报错
    /// </summary>
    private static MetadataReference GetLoaded(string asmName)
    {
        lock (MetaRefs)
        {
            if (MetaRefs.TryGetValue(asmName, out var res)) return res;
        }

        throw new Exception($"Can't find loaded metadata reference: {asmName}");
    }

    /// <summary>
    /// 尝试获取已加载的MetadataReference,不存在则从Provider加载并加入缓存
    /// </summary>
    /// <param name="type"></param>
    /// <param name="asmName"></param>
    /// <param name="appName">仅依赖的第三方库</param>
    /// <returns></returns>
    internal static async ValueTask<MetadataReference> TryGet(ModelDependencyType type, string asmName,
        string? appName = null)
    {
        if (type == ModelDependencyType.ServerExtLibrary && string.IsNullOrEmpty(appName))
            throw new ArgumentNullException(nameof(appName));

        var key = type == ModelDependencyType.ServerExtLibrary ? $"{appName!}-{asmName}" : asmName;
        lock (MetaRefs)
        {
            if (MetaRefs.TryGetValue(key, out var res))
                return res;
        }

        //根据类型异步加载
        var metadataReference = type switch
        {
            ModelDependencyType.SdkLibrary => await Provider.LoadSdkLib(asmName),
            ModelDependencyType.CoreLibrary => await Provider.LoadCommonLib(asmName),
            ModelDependencyType.ClientLibrary => await Provider.LoadClientLib(asmName),
            ModelDependencyType.ServerLibrary => await Provider.LoadServerLib(asmName),
            ModelDependencyType.ServerExtLibrary => await Provider.LoadServerExtLib(appName!, asmName),
            _ => throw new Exception($"Can't find metadata reference: {type}")
        };

        lock (MetaRefs)
            MetaRefs[key] = metadataReference;

        return metadataReference;
    }

    internal static IEnumerable<MetadataReference> GetEntitiesAssemblyReferences()
    {
        var deps = new List<MetadataReference>
        {
            CoreLib,
            NetstandardLib,
            SystemRuntimeLib,
            SystemDataLib,
            AppBoxCoreLib,
        };
        return deps;
    }

    internal static IEnumerable<MetadataReference> GetViewsAssemblyReferences(
        bool usedLiveCharts = true, bool usedDynamic = true)
    {
        var deps = new List<MetadataReference>
        {
            CoreLib,
            NetstandardLib,
            SystemRuntimeLib,
            SystemObjectModelLib,
            SystemDataLib,
            SystemCollectionsLib,
            SystemLinqLib,
            SystemLinqExpressionsLib,
            SystemJsonLib,
            PixUILib,
            PixUIDrawingLib,
            PixUIWidgetsLib,
            MaterialIconsLib,
            AppBoxCoreLib,
            AppBoxClientLib,
            AppBoxClientUILib
        };

        if (usedLiveCharts)
        {
            deps.Add(LiveChartsCoreLib);
            deps.Add(PixUILiveChartsLib);
        }

        if (usedDynamic)
        {
            deps.Add(PixUIDynamicLib);
        }

        return deps;
    }

    /// <summary>
    /// 获取服务模型的依赖引用，用于运行时编译
    /// </summary>
    internal static async Task<List<MetadataReference>> GetServiceModelReferences(ServiceModel model, string appName)
    {
        var deps = new List<MetadataReference>
        {
            CoreLib,
            NetstandardLib,
            SystemRuntimeLib,
            SystemLinqLib,
            // SystemRuntimeExtLib,
            // SystemTasksLib,
            SystemDataLib,
            SystemCollectionsLib,
            // ComponentModelPrimitivesLib,
            // ComponentModelLib,
            // SystemBuffersLib,
            SystemJsonLib,
            SystemPrivateUriLib,
            SystemNetHttpLib,
            SystemNetHttpJsonLib,
            AppBoxCoreLib,
            // AppBoxServerLib, //暂不使用
            AppBoxStoreLib
        };

        if (model.HasDependency) //添加其他引用
        {
            foreach (var dependency in model.Dependencies!)
            {
                var metadataReference = await TryGet(dependency.Type, dependency.AssemblyName, appName);
                deps.Add(metadataReference);
            }
        }

        return deps;
    }
}