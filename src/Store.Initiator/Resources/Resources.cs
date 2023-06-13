using System.Reflection;

namespace AppBoxStore;

internal static class Resources
{
    private static readonly Assembly resAssembly = typeof(StoreInitiator).Assembly;

    internal static string GetString(string res)
    {
        var stream = resAssembly.GetManifestResourceStream("AppBoxStore.Initiator." + res);
        var reader = new System.IO.StreamReader(stream!);
        return reader.ReadToEnd();
    }

    internal static byte[] GetBytes(string res)
    {
        var stream = resAssembly.GetManifestResourceStream("AppBoxStore.Initiator." + res);
        byte[] bytes = new byte[stream!.Length];
        _ = stream.Read(bytes, 0, bytes.Length);
        return bytes;
    }
}