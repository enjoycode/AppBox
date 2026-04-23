using System.IO;
using System.Threading.Tasks;

namespace AppBoxClient;

public interface ILocalFileSystem
{
    ValueTask<LocalFileInfo> CreateTempFile(bool writeOnly);

    ValueTask DeleteTempFile(string filePath);
}

public readonly struct LocalFileInfo
{
    public readonly Stream FileStream { get; init; }
    public readonly string FilePath { get; init; }

    public ValueTask Close()
    {
        if (FileStream != null)
            FileStream.Close();
        return ValueTask.CompletedTask;
    }
}