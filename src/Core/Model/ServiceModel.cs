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

    public List<string>? Dependencies { get; internal set; }

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
                ws.WriteString(dep);
            }
        }

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        var referenceCount = rs.ReadVariant();
        if (referenceCount > 0)
        {
            Dependencies = [];
            for (var i = 0; i < referenceCount; i++)
            {
                Dependencies.Add(rs.ReadString()!);
            }
        }

        rs.ReadVariant(); //保留
    }

    #endregion
}