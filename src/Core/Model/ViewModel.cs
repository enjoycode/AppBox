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

    public bool HasDependency => Dependencies is { Count: > 0 };

    /// <summary>
    /// 附加依赖项，比如附加系统提供的图表库或第三方UI库
    /// </summary>
    public List<ModelDependency>? Dependencies { get; internal set; }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        ws.WriteByte((byte)ViewType);

        if (Dependencies is { Count: > 0 })
        {
            ws.WriteFieldId(1);

            ws.WriteVariant(Dependencies.Count);
            foreach (var dep in Dependencies)
            {
                ws.WriteByte((byte)dep.Type);
                ws.WriteString(dep.AssemblyName);
            }
        }

        ws.WriteFieldEnd();
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);
        ViewType = (ViewModelType)rs.ReadByte();

        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 1:
                    var depCount = rs.ReadVariant();
                    Dependencies = [];
                    for (var i = 0; i < depCount; i++)
                    {
                        Dependencies.Add(new ModelDependency()
                        {
                            Type = (ModelDependencyType)rs.ReadByte(),
                            AssemblyName = rs.ReadString()!
                        });
                    }

                    break;
                case 0: return;
                default: throw new SerializationException(SerializationError.ReadUnknownFieldId);
            }
        }
    }
}