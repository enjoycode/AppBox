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

    internal static readonly string SdkPath =
        Path.GetDirectoryName(typeof(object).Assembly.Location)!;

    internal static readonly MetadataReference CoreLib =
        MetadataReference.CreateFromFile(typeof(object).Assembly.Location);

    internal static MetadataReference NetstandardLib => GetSdkLib("netstandard.dll");

    internal static MetadataReference SystemLinqLib => GetSdkLib("System.Linq.dll");

    internal static MetadataReference SystemRuntimeLib => GetSdkLib("System.Runtime.dll");

    internal static MetadataReference SystemCollectionsLib => GetSdkLib("System.Collections.dll");

    internal static MetadataReference SystemTasksLib => GetSdkLib("System.Threading.Tasks.dll");

    internal static MetadataReference SystemDataLib => GetSdkLib("System.Data.Common.dll");

    internal static MetadataReference PixUIDesktopLib => GetPixUIDesktopLib("PixUIDesktop.dll");

    internal static MetadataReference PixUIWebLib => GetPixUIWebLib("PixUIWeb.dll");

    internal static MetadataReference AppBoxCoreLib =>
        TryGet("AppBoxCore.dll", typeof(Entity).Assembly.Location);

    internal static MetadataReference AppBoxClientLib =>
        TryGet("AppBoxClient.dll",
            Path.Combine(Path.GetDirectoryName(typeof(MetaStore).Assembly.Location)!,
                "AppBoxClient.dll"));

    internal static MetadataReference AppBoxStoreLib =>
        TryGet("AppBoxStore.dll", typeof(MetaStore).Assembly.Location);

    private static MetadataReference GetSdkLib(string asmName) =>
        TryGet(asmName, Path.Combine(SdkPath, asmName));

    private static MetadataReference GetPixUIDesktopLib(string asmName)
    {
#if DEBUG
        var currentPath = Directory.GetCurrentDirectory();
        var srcIndex = currentPath.IndexOf(
            $"{Path.DirectorySeparatorChar}src{Path.DirectorySeparatorChar}",
            StringComparison.Ordinal);
        var srcPath = currentPath.Substring(0, srcIndex + 5);
        if (asmName == "PixUIDesktop.dll")
        {
            var fullPath = Path.Combine(srcPath, "PixUI", "PixUI", "bin", "Debug",
                "netstandard2.1", "PixUI.dll");
            return TryGet(asmName, fullPath);
        }

        throw new NotImplementedException();
#else
        throw new NotImplementedException();
#endif
    }

    private static MetadataReference GetPixUIWebLib(string asmName)
    {
#if DEBUG
        var currentPath = Directory.GetCurrentDirectory();
        var srcIndex = currentPath.IndexOf(
            $"{Path.DirectorySeparatorChar}src{Path.DirectorySeparatorChar}",
            StringComparison.Ordinal);
        var srcPath = currentPath.Substring(0, srcIndex + 5);
        if (asmName == "PixUIWeb.dll")
        {
            var fullPath = Path.Combine(srcPath, "PixUI", "PixUI", "bin", "DebugWeb",
                "netstandard2.1", "PixUI.dll");
            return TryGet(asmName, fullPath);
        }

        throw new NotImplementedException();
#else
        var appPath = Path.GetDirectoryName(typeof(MetadataReferences).Assembly.Location)!;
        return TryGet(asmName, Path.Combine(appPath, "WebLibs", asmName));
#endif
    }

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
}