using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer.Design;

/// <summary>
/// MetadataReference加载器
/// </summary>
internal static class MetadataReferenceLoader
{
    private static readonly string SdkPath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
    private static readonly string AppPath = Path.GetDirectoryName(typeof(MetaStore).Assembly.Location)!;
    private const string ViewRunnerPath = "ViewRunner";

    internal static AnyValue LoadMetadataReference<T>(T args) where T : struct, IAnyArgs
    {
        var type = (ModelDependencyType)args.GetInt()!.Value;
        string asmName;
        string appName;
        if (type != ModelDependencyType.ServerExtLibrary)
        {
            asmName = args.GetString()!;
            appName = string.Empty;
        }
        else
        {
            appName = args.GetString()!;
            asmName = args.GetString()!;
        }

        var fullPath = type switch
        {
            ModelDependencyType.SdkLibrary => Path.Combine(SdkPath, asmName),
            ModelDependencyType.CoreLibrary => Path.Combine(AppPath, asmName),
            ModelDependencyType.ClientLibrary => Path.Combine(AppPath, ViewRunnerPath, asmName),
            ModelDependencyType.ServerLibrary => Path.Combine(AppPath, asmName),
            ModelDependencyType.ServerExtLibrary => Path.Combine(
                ExternalLibraryManager.GetExternalLibraryPath(appName), asmName),
            _ => throw new ArgumentException($"Invalid type: {type}")
        };

        return AnyValue.From(ws =>
        {
            using var fileStream = File.OpenRead(fullPath);
            ws.WriteStream(fileStream);
        });
    }
}