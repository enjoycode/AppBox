using System.IO;

namespace AppBoxClient;

public interface ILocalFileSystem
{
    Stream CreateTempFile(out string filePath, bool writeOnly);

    void DeleteTempFile(string filePath);
}