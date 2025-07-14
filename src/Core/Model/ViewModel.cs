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
    internal ViewModel() { }

    public ViewModel(ModelId id, string name, ViewModelType type = ViewModelType.PixUI) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.View);
        ViewType = type;
    }

    [Field(1)] public ViewModelType ViewType { get; private set; }
}