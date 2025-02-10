using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer.Design;

internal static class MetadataReferenceService
{
    private static readonly string SdkPath = Path.GetDirectoryName(typeof(object).Assembly.Location)!;
    private static readonly string AppPath = Path.GetDirectoryName(typeof(MetaStore).Assembly.Location)!;
    private const string ViewRunnerPath = "ViewRunner";

    internal static AnyValue LoadMetadataReference(int type, string asmName)
    {
        string fullPath;
        switch (type)
        {
            case 0: fullPath = Path.Combine(SdkPath, asmName); break;
            case 1: fullPath = Path.Combine(AppPath, asmName); break;
            case 2: fullPath = Path.Combine(AppPath, ViewRunnerPath, asmName); break;
            case 3: fullPath = Path.Combine(AppPath, asmName); break;
            default:
                throw new ArgumentException($"Invalid type: {type}");
        }

        return AnyValue.From(ws =>
        {
            using var fileStream = File.OpenRead(fullPath);
            ws.WriteStream(fileStream);
        });
    }
}