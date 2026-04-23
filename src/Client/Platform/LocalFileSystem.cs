using System.IO;
using System.Threading.Tasks;

namespace AppBoxClient;

public static class LocalFileSystem
{
    public static void Init(ILocalFileSystem provider)
    {
        _provider = provider;
    }

    private static ILocalFileSystem _provider = null!;

    public static ValueTask<LocalFileInfo> CreateTempFile(bool writeOnly = true) =>
        _provider.CreateTempFile(writeOnly);

    public static ValueTask DeleteTempFile(string? filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return ValueTask.CompletedTask;

        return _provider.DeleteTempFile(filePath);
    }
}