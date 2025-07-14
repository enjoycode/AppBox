using System.Diagnostics;

namespace AppBoxCore;

public sealed class ServiceModel : ModelBase
{
    internal ServiceModel() { }

    public ServiceModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.Service);
    }

    private List<string>? _dependencies;

    public bool HasDependency => _dependencies is { Count: > 0 };

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        if (_dependencies == null || _dependencies.Count == 0)
            ws.WriteVariant(0);
        else
        {
            ws.WriteVariant(_dependencies.Count);
            foreach (var dep in _dependencies)
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
            _dependencies = new List<string>();
            for (var i = 0; i < referenceCount; i++)
            {
                _dependencies.Add(rs.ReadString()!);
            }
        }

        rs.ReadVariant(); //保留
    }

    #endregion
}