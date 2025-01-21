using System.IO;
using System.Reflection;

namespace AppBoxDesign;

internal static class Resources
{
    private static readonly Assembly ResAssembly;
    private static readonly string PathPrefix;

    static Resources()
    {
        ResAssembly = typeof(Resources).Assembly;
        PathPrefix = "AppBoxDesign.";
    }

    public static Stream LoadStream(string res)
    {
        return ResAssembly.GetManifestResourceStream(PathPrefix + res)!;
    }

    internal static string LoadString(string res)
    {
        var stream = ResAssembly.GetManifestResourceStream(PathPrefix + res);
        var reader = new StreamReader(stream!);
        return reader.ReadToEnd();
    }

    public static byte[] LoadBytes(string res)
    {
        using var stream = LoadStream(res);
        var data = new byte[stream.Length];
        stream.ReadExactly(data, 0, data.Length);
        return data;
    }
}