using System.IO;

namespace AppBoxClient;

public sealed class OSFileSystem : ILocalFileSystem
{
    public Stream CreateTempFile(out string filePath)
    {
        filePath = Path.GetTempFileName();
        return File.OpenWrite(filePath);
    }

    public void DeleteTempFile(string filePath) => File.Delete(filePath);
}