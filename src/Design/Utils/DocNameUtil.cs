using System.Diagnostics;
using AppBoxCore;

namespace AppBoxDesign;

internal static class DocNameUtil
{
    internal static string MakeModelDocName(in ModelId modelId) => $"M{modelId}.cs";
    
    internal static ModelId GetModelIdFromDocName(string docName)
    {
        Debug.Assert(docName.StartsWith('M') && docName.EndsWith(".cs"));
        var lastDotIndex = docName.LastIndexOf('.');
        var value = ulong.Parse(docName.AsSpan(1, lastDotIndex - 1));
        ModelId modelId = (long)value;
        return modelId;
    }

    internal static ModelId? TryGetModelIdFromDocName(string docName)
    {
        if (!(docName.StartsWith('M') && docName.EndsWith(".cs"))) return null;
        var lastDotIndex = docName.LastIndexOf('.');
        if (!ulong.TryParse(docName.AsSpan(1, lastDotIndex - 1), out var value))
            return null;
        ModelId modelId = (long)value;
        return modelId;
    }
}