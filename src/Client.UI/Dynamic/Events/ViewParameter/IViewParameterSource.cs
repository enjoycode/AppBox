using AppBoxCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 视图参数的来源
/// </summary>
public interface IViewParameterSource : IBinSerializable
{
    string TypeName { get; }

    ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName);
}