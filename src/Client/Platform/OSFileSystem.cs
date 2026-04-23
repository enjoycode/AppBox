using System.IO;
using System.Threading.Tasks;

namespace AppBoxClient;

public sealed class OSFileSystem : ILocalFileSystem
{
    public ValueTask<LocalFileInfo> CreateTempFile(bool writeOnly)
    {
        var filePath = Path.GetTempFileName();
        var stream = writeOnly
            ? File.OpenWrite(filePath)
            : new FileStream(filePath, FileMode.Create, FileAccess.ReadWrite, FileShare.Read);
        return new ValueTask<LocalFileInfo>(new LocalFileInfo() { FileStream = stream, FilePath = filePath });
    }

    public ValueTask DeleteTempFile(string filePath)
    {
        File.Delete(filePath);
        return ValueTask.CompletedTask;
    }
}