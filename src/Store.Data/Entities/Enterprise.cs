using AppBoxCore;

namespace AppBoxStore.Entities;

internal sealed class Enterprise : SqlEntity, IEntity
{
    public Enterprise(Guid id)
    {
        _id = id;
    }

    private Guid _id;
    private string _name = null!;
    private string? _address;
    private Guid? _managerId;
    private OrgUnit? _manager;

    public Guid Id => _id;

    public string Name
    {
        get => _name;
        set => SetField(ref _name, value, NAME_ID);
    }

    public string? Address
    {
        get => _address;
        set => SetField(ref _address, value, ADDRESS_ID);
    }

    public Guid? ManagerId
    {
        get => _managerId;
        set => SetField(ref _managerId, value, MANAGERID_ID);
    }

    public OrgUnit? Manager
    {
        get => _manager;
        set
        {
            _manager = value;
            ManagerId = _manager?.Id;
        }
    }

    #region ====Overrides====

    public static long MODELID => 8012673906332663816; //2

    internal const short ID_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short NAME_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short ADDRESS_ID = 3 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short MANAGERID_ID = 4 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short MANAGER_ID = 5 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds = [ID_ID, NAME_ID, ADDRESS_ID, MANAGERID_ID, MANAGER_ID];

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
            case MANAGERID_ID:
                ws.WriteGuidMember(id, _managerId, flags);
                break;
            case MANAGER_ID:
                ws.WriteEntityRefMember(id, _manager, flags);
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
            case MANAGERID_ID:
                _managerId = rs.ReadGuidMember(flags);
                break;
            case MANAGER_ID:
                _manager = rs.ReadEntityRefMember(flags, () => new OrgUnit());
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(Employee));
        }
    }

    #endregion
}