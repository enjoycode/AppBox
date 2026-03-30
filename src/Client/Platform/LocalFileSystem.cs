using System.IO;

namespace AppBoxClient;

public static class LocalFileSystem
{
    public static void Init(ILocalFileSystem provider)
    {
        _provider = provider;
    }

    private static ILocalFileSystem _provider = null!;

    public static Stream CreateTempFile(out string filePath, bool writeOnly = true) =>
        _provider.CreateTempFile(out filePath, writeOnly);

    public static void DeleteTempFile(string? filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return;

        _provider.DeleteTempFile(filePath);
    }
}