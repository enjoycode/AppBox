using System.Reflection;

namespace Tests;

internal static class Resources
{
    private static readonly Assembly resAssembly;
    private static readonly string pathPrefix;

    static Resources()
    {
        resAssembly = typeof(Resources).Assembly;
        pathPrefix = resAssembly.GetName().Name! + ".";
    }

    internal static string GetString(string res)
    {
        var stream = resAssembly.GetManifestResourceStream(pathPrefix + res);
        var reader = new System.IO.StreamReader(stream!);
        return reader.ReadToEnd();
    }

    internal static byte[] GetBytes(string res)
    {
        var stream = resAssembly.GetManifestResourceStream(pathPrefix + res)!;
        var bytes = new byte[stream.Length];
        var _ = stream.Read(bytes, 0, bytes.Length);
        return bytes;
    }
}