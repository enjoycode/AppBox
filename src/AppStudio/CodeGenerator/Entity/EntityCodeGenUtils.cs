using System;
using AppBoxCore;

namespace AppBoxDesign;

internal static class EntityCodeGenUtils
{
    internal static string GetEntityMemberWriteReadType(EntityMember member, IModelContainer modelContainer)
    {
        switch (member.Type)
        {
            case EntityMemberType.EntityField:
                var dfm = (EntityFieldMember)member;
                return dfm.FieldType == EntityFieldType.Enum ? "Int" : dfm.FieldType.ToString();
            case EntityMemberType.EntityFieldTracker:
                var target = ((EntityTrackerMember)member).Target;
                return target.FieldType == EntityFieldType.Enum ? "Int" : target.FieldType.ToString();
            case EntityMemberType.EntityRef: return "EntityRef";
            case EntityMemberType.EntitySet: return "EntitySet";
            case EntityMemberType.EntityRefField:
            {
                var refFieldMember = ((EntityRefFieldMember)member);
                var path = GetEntityRefFieldPath(refFieldMember, modelContainer);
                var field = (EntityFieldMember)path[^1];
                return field.FieldType == EntityFieldType.Enum ? "Int" : field.FieldType.ToString();
            }
            default: throw new Exception();
        }
    }

    internal static EntityMember[] GetEntityRefFieldPath(EntityRefFieldMember refField, IModelContainer modelContainer)
    {
        var path = new EntityMember[refField.RefFieldPath.Length];
        var currentEntityModel = refField.Owner;
        for (var i = 0; i < path.Length; i++)
        {
            var entityMember = currentEntityModel.GetMember(refField.RefFieldPath[i], true)!;
            path[i] = entityMember;
            if (entityMember is EntityRefMember refMember)
            {
                if (refMember.IsAggregationRef) throw new NotImplementedException();

                currentEntityModel = modelContainer.GetEntityModel(refMember.RefModelIds[0]);
            }
            else if (entityMember is not EntityFieldMember)
            {
                throw new NotSupportedException();
            }
        }

        return path;
    }
}