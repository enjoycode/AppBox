using AppBoxCore;
using AppBoxStore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

/// <summary>
/// 管理虚拟工程需要引用的类库
/// </summary>
internal static class MetadataReferences
{
    private static readonly Dictionary<string, MetadataReference> MetaRefs = new();

    internal static readonly string SdkPath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
    private static readonly string AppPath = Path.GetDirectoryName(typeof(MetaStore).Assembly.Location)!;

    internal static readonly MetadataReference CoreLib =
        MetadataReference.CreateFromFile(typeof(object).Assembly.Location);

    internal static MetadataReference NetstandardLib => GetSdkLib("netstandard.dll");

    internal static MetadataReference SystemLinqLib => GetSdkLib("System.Linq.dll");

    internal static MetadataReference SystemObjectModelLib => GetSdkLib("System.ObjectModel.dll");

    internal static MetadataReference SystemRuntimeLib => GetSdkLib("System.Runtime.dll");

    internal static MetadataReference SystemCollectionsLib => GetSdkLib("System.Collections.dll");

    internal static MetadataReference SystemTasksLib => GetSdkLib("System.Threading.Tasks.dll");

    internal static MetadataReference SystemDataLib => GetSdkLib("System.Data.Common.dll");

    internal static MetadataReference PixUILib => TryGetViewLib("PixUI.dll");

    internal static MetadataReference PixUIWidgetsLib => TryGetViewLib("PixUI.Widgets.dll");

    internal static MetadataReference MaterialIconsLib => TryGetViewLib("PixUI.MaterialIcons.dll");

    internal static MetadataReference LiveChartsCoreLib => TryGetViewLib("LiveChartsCore.dll");

    internal static MetadataReference PixUILiveChartsLib => TryGetViewLib("PixUI.LiveCharts.dll");

    internal static MetadataReference PixUIDynamicLib => TryGetViewLib("PixUI.Dynamic.dll");

    internal static MetadataReference PixUIAttributesLib => //TODO: remove
        TryGetViewLib("PixUI.TSAttributes.dll");

    internal static MetadataReference AppBoxCoreLib =>
        TryGet("AppBoxCore.dll", typeof(Entity).Assembly.Location);

    internal static MetadataReference AppBoxClientLib => TryGetViewLib("AppBoxClient.dll");

    internal static MetadataReference AppBoxClientUILib => TryGetViewLib("AppBoxClientUI.dll");

    internal static MetadataReference AppBoxServerLib =>
        TryGet("AppBoxServer.dll", Path.Combine(AppPath, "AppBoxServer.dll"));

    internal static MetadataReference AppBoxStoreLib =>
        TryGet("AppBoxStore.dll", typeof(MetaStore).Assembly.Location);

    private static MetadataReference GetSdkLib(string asmName) =>
        TryGet(asmName, Path.Combine(SdkPath, asmName));

    private static MetadataReference TryGetViewLib(string asmName) =>
        TryGet(asmName, Path.Combine(AppPath, "ViewLibs", asmName));

    private static MetadataReference TryGet(string asmName, string fullPath)
    {
        MetadataReference? res = null;
        lock (MetaRefs)
        {
            if (MetaRefs.TryGetValue(asmName, out res)) return res;

            res = MetadataReference.CreateFromFile(fullPath);
            MetaRefs.Add(asmName, res);
        }

        return res;
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
            PixUILib,
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
            MetadataReferences.CoreLib,
            MetadataReferences.NetstandardLib,
            MetadataReferences.SystemRuntimeLib,
            MetadataReferences.SystemLinqLib,
            // MetadataReferences.SystemRuntimeExtLib,
            // MetadataReferences.SystemTasksLib,
            MetadataReferences.SystemDataLib,
            MetadataReferences.SystemCollectionsLib,
            // MetadataReferences.ComponentModelPrimitivesLib,
            //MetadataReferences.ComponentModelLib,
            //MetadataReferences.SystemBuffersLib,
            MetadataReferences.AppBoxCoreLib,
            MetadataReferences.AppBoxServerLib,
            MetadataReferences.AppBoxStoreLib
        };

        if (model.HasReference) //添加其他引用
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