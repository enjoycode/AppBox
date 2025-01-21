using System;
using AppBoxCore;

namespace AppBoxDesign;

internal static class EntityCodeGenUtils
{
    internal static string GetEntityMemberWriteReadType(EntityMemberModel member)
    {
        switch (member.Type)
        {
            case EntityMemberType.EntityField:
                var dfm = (EntityFieldModel)member;
                return dfm.FieldType == EntityFieldType.Enum ? "Int" : dfm.FieldType.ToString();
            case EntityMemberType.EntityFieldTracker:
                var target = ((FieldTrackerModel)member).Target;
                return target.FieldType == EntityFieldType.Enum ? "Int" : target.FieldType.ToString();
            case EntityMemberType.EntityRef: return "EntityRef";
            case EntityMemberType.EntitySet: return "EntitySet";
            default: throw new Exception();
        }
    }
}