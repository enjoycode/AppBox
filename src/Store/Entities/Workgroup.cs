using System;
using AppBoxCore;

namespace AppBoxStore;

public sealed class Workgroup : SqlEntity
{
    internal Workgroup() { }

    public Workgroup(Guid id)
    {
        _id = id;
    }

    private Guid _id;
    private string _name = null!;

    public Guid Id => _id;

    public string Name
    {
        get => _name;
        set
        {
            if (_name == value) return;
            _name = value;
            OnPropertyChanged(NAME_ID);
        }
    }

    #region ====Overrides====

    internal static readonly ModelId MODELID =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Entity, 3, ModelLayer.SYS);

    internal const short ID_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short NAME_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds = { ID_ID, NAME_ID };

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    public override void WriteMember(short id, IEntityMemberWriter ws, int flags)
    {
        switch (id)
        {
            case ID_ID:
                ws.WriteGuidMember(id, _id, flags);
                break;
            case NAME_ID:
                ws.WriteStringMember(id, _name, flags);
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
            case ID_ID:
                _id = rs.ReadGuidMember(flags);
                break;
            case NAME_ID:
                _name = rs.ReadStringMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    #endregion
}