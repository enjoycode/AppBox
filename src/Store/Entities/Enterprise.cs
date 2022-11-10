using System;
using AppBoxCore;

namespace AppBoxStore.Entities;

internal sealed class Enterprise : SqlEntity
{
    public Enterprise(Guid id)
    {
        _id = id;
    }

    private Guid _id;
    private string _name = null!;
    private string? _address;

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

    internal const long MODELID = 8012673906332663816; //2

    internal const short ID_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short NAME_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short ADDRESS_ID = 3 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds = { ID_ID, NAME_ID, ADDRESS_ID };

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    protected internal override void WriteMember<T>(short id, ref T ws, int flags)
    {
        switch (id)
        {
            case ID_ID:
                ws.WriteGuidMember(id, _id, flags);
                break;
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

    protected internal override void ReadMember<T>(short id, ref T rs, int flags)
    {
        switch (id)
        {
            case ID_ID:
                _id = rs.ReadGuidMember(flags);
                break;
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