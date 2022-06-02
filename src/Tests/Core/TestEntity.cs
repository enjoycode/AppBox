using System;
using System.Collections.Generic;
using AppBoxCore;
using Microsoft.CodeAnalysis.Elfie.Serialization;

namespace Tests.Core;

public sealed class TestEntity : Entity
{
    private static readonly short[] Members = { 1, 2 };

    public string Name { get; set; } = null!;

    public int? Score { get; set; }

    public override ModelId ModelId => 12345;
    public override short[] AllMembers => Members;

    public override void WriteMember(short id, IEntityMemberWriter ws, int flags)
    {
        switch (id)
        {
            case 1:
                ws.WriteStringMember(id, Name, flags);
                break;
            case 2:
                ws.WriteIntMember(id, Score, flags);
                break;
            default: throw new Exception();
        }
    }

    public override void ReadMember(short id, IEntityMemberReader rs, int flags)
    {
        switch (id)
        {
            case 1:
                Name = rs.ReadStringMember(flags);
                break;
            case 2:
                Score = rs.ReadIntMember(flags);
                break;
            default: throw new Exception();
        }
    }
}