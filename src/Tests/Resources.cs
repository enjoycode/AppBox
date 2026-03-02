using System.Reflection;

namespace Tests;

internal static class Resources
{
    private static readonly Assembly ResAssembly;
    private static readonly string PathPrefix;

    static Resources()
    {
        ResAssembly = typeof(Resources).Assembly;
        PathPrefix = ResAssembly.GetName().Name! + ".";
    }

    internal static string GetString(string res)
    {
        var stream = ResAssembly.GetManifestResourceStream(PathPrefix + res);
        var reader = new System.IO.StreamReader(stream!);
        return reader.ReadToEnd();
    }

    internal static byte[] GetBytes(string res)
    {
        var stream = ResAssembly.GetManifestResourceStream(PathPrefix + res)!;
        var bytes = new byte[stream.Length];
        var _ = stream.Read(bytes, 0, bytes.Length);
        return bytes;
    }
}