using System.IO;

namespace AppBoxClient;

public interface ILocalFileSystem
{
    Stream CreateTempFile(out string filePath);

    void DeleteTempFile(string filePath);
}