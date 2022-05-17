using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

internal static class MetadataReferences
{
    private static readonly Dictionary<string, MetadataReference> _metaRefs = new();

    internal static readonly string SdkPath =
        Path.GetDirectoryName(typeof(object).Assembly.Location)!;

    internal static readonly MetadataReference CoreLib =
        MetadataReference.CreateFromFile(typeof(object).Assembly.Location);

    internal static MetadataReference NetstandardLib => GetSdkLib("netstandard.dll");

    private static MetadataReference GetSdkLib(string asmName)
    {
        MetadataReference? res = null;
        lock (_metaRefs)
        {
            if (!_metaRefs.TryGetValue(asmName, out res))
            {
                res = MetadataReference.CreateFromFile(Path.Combine(SdkPath, asmName));
                _metaRefs.Add(asmName, res);
            }
        }

        return res;
    }
}