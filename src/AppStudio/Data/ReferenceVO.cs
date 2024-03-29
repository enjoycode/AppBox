using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 模型引用的源位置, 作为FindUsages和GotoDefinition的结果
/// </summary>
internal sealed class ReferenceVO : IBinSerializable
{
    public string ModelId { get; internal set; } = null!;
    public string? ModelName { get; private set; }
    public string? Location { get; internal set; }

    public int Offset { get; internal set; } = -1;
    public int Length { get; internal set; } = -1;

    public int TargetType { get; private set; } = -1;

#if __APPBOXDESIGN__
    internal static ReferenceVO From(Reference source)
    {
        var vo = new ReferenceVO();
        vo.ModelId = source.ModelNode.Model.Id.ToString();
        vo.ModelName = $"{source.ModelNode.AppNode.Model.Name}.{source.ModelNode.Model.Name}";
        vo.Location = source.Location;

        if (source is CodeReference codeReference)
        {
            vo.Offset = codeReference.Offset;
            vo.Length = codeReference.Length;
        }
        else if (source is ModelReference modelReference)
        {
            vo.TargetType = (int)modelReference.TargetReference.TargetType;
        }

        return vo;
    }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteString(ModelId);
        ws.WriteString(ModelName);
        ws.WriteString(Location);
        ws.WriteVariant(Offset);
        ws.WriteVariant(Length);
        ws.WriteVariant(TargetType);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

#else
    public void WriteTo(IOutputStream ws) => throw new System.NotSupportedException();

    public void ReadFrom(IInputStream rs)
    {
        ModelId = rs.ReadString()!;
        ModelName = rs.ReadString();
        Location = rs.ReadString();
        Offset = rs.ReadVariant();
        Length = rs.ReadVariant();
        TargetType = rs.ReadVariant();
    }
#endif
}