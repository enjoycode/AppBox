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
public sealed class ViewModel : ModelBase
{
    internal ViewModel() { }

    public ViewModel(ModelId id, string name, ViewModelType type = ViewModelType.PixUI) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.View);
        ViewType = type;
    }

    public ViewModelType ViewType { get; private set; }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        ws.WriteByte((byte)ViewType);
        ws.WriteFieldEnd();
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);
        ViewType = (ViewModelType)rs.ReadByte();
        rs.ReadFieldId();
    }
}