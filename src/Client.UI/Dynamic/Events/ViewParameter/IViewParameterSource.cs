using System.Text.Json;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 视图参数的来源
/// </summary>
public interface IViewParameterSource
{
    string Name { get; }

    void WriteProperties(Utf8JsonWriter writer);

    void ReadProperties(ref Utf8JsonReader reader);

    ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName);
}