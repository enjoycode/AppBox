using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxStore;

public sealed class OrgUnit : SqlEntity
{
    private string _name = null!;
    private Guid _baseId;
    private long _baseType;
    private Guid? _parentId;

    private Entity? _base;
    private OrgUnit? _parent;
    private IList<OrgUnit>? _children;

    #region ====Overrides====

    internal static readonly ModelId MODELID =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Entity, 4, ModelLayer.SYS);

    internal const short NAME_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short BASEID_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short BASETYPE_ID = 3 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short BASE_ID = 4 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short PARENTID_ID = 5 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short PARENT_ID = 6 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short CHILDREN_ID = 7 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds =
        { NAME_ID, BASEID_ID, BASETYPE_ID, BASE_ID, PARENTID_ID, PARENT_ID, CHILDREN_ID };

    public override ModelId ModelId => MODELID;
    public override short[] AllMembers => MemberIds;

    public override void WriteMember(short id, IEntityMemberWriter ws, int flags)
    {
        switch (id)
        {
            case NAME_ID:
                ws.WriteStringMember(id, _name, flags);
                break;
            case BASEID_ID:
                ws.WriteGuidMember(id, _baseId, flags);
                break;
            case BASETYPE_ID:
                ws.WriteLongMember(id, _baseType, flags);
                break;
            case PARENTID_ID:
                ws.WriteGuidMember(id, _parentId, flags);
                break;
            case BASE_ID:
                ws.WriteEntityRefMember(id, _base, flags);
                break;
            case PARENT_ID:
                ws.WriteEntityRefMember(id, _parent, flags);
                break;
            case CHILDREN_ID:
                ws.WriteEntitySetMember(id, _children, flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    public override void ReadMember(short id, IEntityMemberReader rs, int flags)
    {
        switch (id)
        {
            case NAME_ID:
                _name = rs.ReadStringMember(flags);
                break;
            case BASEID_ID:
                _baseId = rs.ReadGuidMember(flags);
                break;
            case BASETYPE_ID:
                _baseType = rs.ReadLongMember(flags);
                break;
            case PARENTID_ID:
                _parentId = rs.ReadGuidMember(flags);
                break;
            case BASE_ID:
                _base = rs.ReadEntityRefMember<Entity>(flags, () =>
                {
                    if (_baseType == Employee.MODELID)
                        return new Employee();
                    if (_baseType == Workgroup.MODELID)
                        return new Workgroup();
                    if (_baseType == Enterprise.MODELID)
                        return new Enterprise();
                    throw new Exception();
                });
                break;
            case PARENT_ID:
                _parent = rs.ReadEntityRefMember(flags, () => new OrgUnit());
                break;
            case CHILDREN_ID:
                _children = rs.ReadEntitySetMember(flags, () => new OrgUnit());
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    #endregion
}