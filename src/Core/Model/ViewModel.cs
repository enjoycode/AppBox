using System.Diagnostics;

namespace AppBoxCore;

public enum ViewModelType
{
    PixUI,
    PixUIDynamic,
    Vue,
    VueDynamic
}

/// <summary>
/// 视图模型
/// </summary>
[BinSerializable(BinSerializePolicy.Compact, true)]
public sealed partial class ViewModel : ModelBase
{
    [Field(1)] private ViewModelType _type;

    public ViewModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.View);
    }
}