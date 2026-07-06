using AppBoxCore;

namespace AppBoxStore.Entities;

internal sealed class WFInstance : SqlEntity, IEntity
{
    public WFInstance() { }

    public WFInstance(Guid id)
    {
        _id = id;
    }

    private Guid _id;
    private string _title = string.Empty;
    private Guid _creatorId;
    private OrgUnit? _creator;
    private DateTime _createTime;
    private byte _status;
    private byte[] _context = [];

    public Guid Id => _id;

    public string Title
    {
        get => _title;
        set => SetField(ref _title, value, TITLE_ID);
    }

    public Guid CreatorId
    {
        get => _creatorId;
        set => SetField(ref _creatorId, value, CREATOR_ID_ID);
    }

    public OrgUnit? Creator => _creator;

    public DateTime CreateTime
    {
        get => _createTime;
        set => SetField(ref _createTime, value, CREATE_TIME_ID);
    }

    public byte Status
    {
        get => _status;
        set => SetField(ref _status, value, STATUS_ID);
    }

    /// <summary>
    /// 序列化的参数及执行状态
    /// </summary>
    public byte[] Context
    {
        get => _context;
        set => SetField(ref _context, value, CONTEXT_ID);
    }

    #region ====Overrides====

    public static long MODELID => 8012673906332663836; //7

    internal const short ID_ID = 1 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short TITLE_ID = 2 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short CREATOR_ID_ID = 3 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short CREATOR_ID = 4 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short CREATE_TIME_ID = 5 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short STATUS_ID = 6 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short CONTEXT_ID = 7 << EntityMemberId.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds =
        [ID_ID, TITLE_ID, CREATOR_ID_ID, CREATOR_ID, CREATE_TIME_ID, STATUS_ID, CONTEXT_ID];

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    protected internal override void WriteMember<T>(short id, ref T ws, int flags)
    {
        switch (id)
        {
            case ID_ID:
                ws.WriteGuidMember(id, _id, flags);
                break;
            case TITLE_ID:
                ws.WriteStringMember(id, _title, flags);
                break;
            case CREATOR_ID_ID:
                ws.WriteGuidMember(id, _creatorId, flags);
                break;
            case CREATOR_ID:
                ws.WriteEntityRefMember(id, _creator, flags);
                break;
            case CREATE_TIME_ID:
                ws.WriteDateTimeMember(id, _createTime, flags);
                break;
            case STATUS_ID:
                ws.WriteByteMember(id, _status, flags);
                break;
            case CONTEXT_ID:
                ws.WriteBinaryMember(id, _context, flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFInstance));
        }
    }

    protected internal override void ReadMember<T>(short id, ref T rs, int flags)
    {
        switch (id)
        {
            case ID_ID:
                _id = rs.ReadGuidMember(flags);
                break;
            case TITLE_ID:
                _title = rs.ReadStringMember(flags);
                break;
            case CREATOR_ID_ID:
                _creatorId = rs.ReadGuidMember(flags);
                break;
            case CREATOR_ID:
                _creator = rs.ReadEntityRefMember(flags, () => new OrgUnit());
                break;
            case CREATE_TIME_ID:
                _createTime = rs.ReadDateTimeMember(flags);
                break;
            case STATUS_ID:
                _status = rs.ReadByteMember(flags);
                break;
            case CONTEXT_ID:
                _context = rs.ReadBinaryMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFInstance));
        }
    }

    #endregion
}