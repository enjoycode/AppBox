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
        var type = (MetadataReferenceType)args.GetInt()!.Value;
        string asmName;
        string appName;
        if (type != MetadataReferenceType.ServerExtLibrary)
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
            MetadataReferenceType.SdkLibrary => Path.Combine(SdkPath, asmName),
            MetadataReferenceType.CoreLibrary => Path.Combine(AppPath, asmName),
            MetadataReferenceType.ClientLibrary => Path.Combine(AppPath, ViewRunnerPath, asmName),
            MetadataReferenceType.ServerLibrary => Path.Combine(AppPath, asmName),
            MetadataReferenceType.ServerExtLibrary => Path.Combine(
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