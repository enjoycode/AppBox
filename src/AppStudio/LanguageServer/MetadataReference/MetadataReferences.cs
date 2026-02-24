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

    private static MetadataReference GetLoaded(string asmName)
    {
        lock (MetaRefs)
        {
            if (MetaRefs.TryGetValue(asmName, out var res)) return res;
        }

        throw new Exception($"Can't find loaded metadata reference: {asmName}");
    }

    // private static MetadataReference TryGet(string asmName, Func<string, ValueTask<MetadataReference>> loader)
    // {
    //     MetadataReference? res;
    //     lock (MetaRefs)
    //     {
    //         if (MetaRefs.TryGetValue(asmName, out res)) return res;
    //
    //         var l = loader(asmName);
    //         res = l.IsCompleted ? l.Result : l.AsTask().Result;
    //         MetaRefs.Add(asmName, res);
    //     }
    //
    //     return res;
    // }

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
    /// 获取服务模型的依赖引用
    /// </summary>
    internal static IEnumerable<MetadataReference> GetServiceModelReferences(ServiceModel model)
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
            throw new NotImplementedException("ServiceModel has references");
            // for (int i = 0; i < model.References.Count; i++)
            // {
            //     deps.Add(MetadataReferences.Get($"{model.References[i]}.dll", appName));
            // }
        }

        return deps;
    }
}