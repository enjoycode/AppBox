using System;
using AppBoxCore;

namespace AppBoxDesign;

public sealed class EntityMemberInfo : IBinSerializable
{
    public string AppName { get; set; } = null!;
    public string ModelName { get; set; } = null!;
    public string MemberName { get; set; } = null!;
    public string ModelId { get; set; } = null!;
    public short MemberId { get; set; }

    public override string ToString() => $"{AppName}.{ModelName}.{MemberName}";

#if __APPBOXDESIGN__
    public void WriteTo(IOutputStream ws)
    {
        ws.WriteString(AppName);
        ws.WriteString(ModelName);
        ws.WriteString(MemberName);
        ws.WriteString(ModelId);
        ws.WriteShort(MemberId);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

#else
    public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

    public void ReadFrom(IInputStream rs)
    {
        AppName = rs.ReadString()!;
        ModelName = rs.ReadString()!;
        MemberName = rs.ReadString()!;
        ModelId = rs.ReadString()!;
        MemberId = rs.ReadShort();
    }
#endif
}