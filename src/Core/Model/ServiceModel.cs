using System.Diagnostics;

namespace AppBoxCore;

public sealed class ServiceModel : ModelBase
{
    internal ServiceModel() { }

    public ServiceModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.Service);
    }

    public bool HasDependency => Dependencies is { Count: > 0 };

    /// <summary>
    /// 附加依赖项，比如系统内的PixUI.Drawing.dll或第三方依赖库
    /// </summary>
    public List<ModelDependency>? Dependencies { get; internal set; }

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        if (Dependencies == null || Dependencies.Count == 0)
            ws.WriteVariant(0);
        else
        {
            ws.WriteVariant(Dependencies.Count);
            foreach (var dep in Dependencies)
            {
                ws.WriteByte((byte)dep.Type);
                ws.WriteString(dep.AssemblyName);
            }
        }

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        var dependencyCount = rs.ReadVariant();
        if (dependencyCount > 0)
        {
            Dependencies = [];
            for (var i = 0; i < dependencyCount; i++)
            {
                Dependencies.Add(new ModelDependency()
                {
                    Type = (ModelDependencyType)rs.ReadByte(),
                    AssemblyName = rs.ReadString()!
                });
            }
        }

        rs.ReadFieldId(); //保留
    }

    #endregion
}