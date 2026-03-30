using System.IO;

namespace AppBoxClient;

public sealed class OSFileSystem : ILocalFileSystem
{
    public Stream CreateTempFile(out string filePath, bool writeOnly)
    {
        filePath = Path.GetTempFileName();
        return writeOnly
            ? File.OpenWrite(filePath)
            : new FileStream(filePath, FileMode.Create, FileAccess.ReadWrite, FileShare.Read);
    }

    public void DeleteTempFile(string filePath) => File.Delete(filePath);
}