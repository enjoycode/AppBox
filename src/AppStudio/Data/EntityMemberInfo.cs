using System;
using AppBoxCore;

namespace AppBoxDesign;

public sealed class EntityMemberInfo
{
    public string AppName { get; set; } = null!;
    public string ModelName { get; set; } = null!;
    public string MemberName { get; set; } = null!;
    public string ModelId { get; set; } = null!;
    public short MemberId { get; set; }

    public override string ToString() => $"{AppName}.{ModelName}.{MemberName}";
}