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
}