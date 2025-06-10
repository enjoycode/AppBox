using System.Text.Json;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

public sealed class CopyRowParameter : IViewParameterSource
{
    internal const string SourceName = "CopyRow";

    public string Name => SourceName;

    public void WriteProperties(Utf8JsonWriter writer)
    {
        throw new NotImplementedException();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        throw new NotImplementedException();
    }

    public ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        throw new NotImplementedException();
    }
}