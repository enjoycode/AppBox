using System.Diagnostics;

namespace AppBoxCore;

public sealed class ServiceModel : ModelBase
{
    public ServiceModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.Service);
    }

    private IList<string>? _references;

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        if (_references == null || _references.Count == 0)
            ws.WriteVariant(0);
        else
        {
            ws.WriteVariant(_references.Count);
            foreach (var reference in _references)
            {
                ws.WriteString(reference);
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
            _references = new List<string>();
            for (var i = 0; i < referenceCount; i++)
            {
                _references.Add(rs.ReadString()!);
            }
        }

        rs.ReadVariant(); //保留
    }

    #endregion
}