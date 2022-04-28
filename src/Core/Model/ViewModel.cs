using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 视图模型
/// </summary>
[BinSerializable(BinSerializePolicy.Compact, true)]
public sealed partial class ViewModel : ModelBase
{
    [Field(1)] private bool _isDynamicView;

    public ViewModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.View);
    }
}