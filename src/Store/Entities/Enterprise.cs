using AppBoxCore;

namespace AppBoxStore;

public sealed class Enterprise : SqlEntity
{
    private string _name = null!;
    private string? _address;

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

    public string? Address
    {
        get => _address;
        set
        {
            if (_address == value) return;
            _address = value;
            OnPropertyChanged(ADDRESS_ID);
        }
    }

    #region ====Overrides====

    internal static readonly ModelId MODELID =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Entity, 2, ModelLayer.SYS);

    internal const short NAME_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short ADDRESS_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds = { NAME_ID, ADDRESS_ID };

    public override ModelId ModelId => MODELID;
    public override short[] AllMembers => MemberIds;

    public override void WriteMember(short id, IEntityMemberWriter ws, int flags)
    {
        switch (id)
        {
            case NAME_ID:
                ws.WriteStringMember(id, _name, flags);
                break;
            case ADDRESS_ID:
                ws.WriteStringMember(id, _address, flags);
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
            case ADDRESS_ID:
                _address = rs.ReadStringMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    #endregion
}