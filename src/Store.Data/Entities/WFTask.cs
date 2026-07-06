using AppBoxCore;

namespace AppBoxStore.Entities;

/// <summary>
/// 工作流待办事项
/// </summary>
public sealed class WFTask : SqlEntity, IEntity
{
    public WFTask() { }

    public WFTask(Guid instanceId, Guid bookmarkId)
    {
        _instanceId = instanceId;
        _bookmarkId = bookmarkId;
    }

    private Guid _instanceId;
    private Guid _bookmarkId;
    private WFInstance? _instance;
    private string _title = string.Empty;
    private DateTime _createTime;

    public Guid InstanceId => _instanceId;
    public Guid BookmarkId => _bookmarkId;

    public WFInstance? Instance => _instance;

    public string Title
    {
        get => _title;
        set => SetField(ref _title, value, TITLE_ID);
    }

    public DateTime CreateTime
    {
        get => _createTime;
        set => SetField(ref _createTime, value, CREATE_TIME_ID);
    }

    #region ====Overrides====

    public static long MODELID => 8012673906332663840; //8

    internal const short INSTANCE_ID_ID = 1 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short BOOKMARK_ID_ID = 2 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short INSTANCE_ID = 3 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short TITLE_ID = 4 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short CREATE_TIME_ID = 5 << EntityMemberId.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds = [INSTANCE_ID_ID, BOOKMARK_ID_ID, TITLE_ID, CREATE_TIME_ID];

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    protected internal override void WriteMember<T>(short id, ref T ws, int flags)
    {
        switch (id)
        {
            case INSTANCE_ID_ID:
                ws.WriteGuidMember(id, _instanceId, flags);
                break;
            case BOOKMARK_ID_ID:
                ws.WriteGuidMember(id, _bookmarkId, flags);
                break;
            case INSTANCE_ID:
                ws.WriteEntityRefMember(id, _instance, flags);
                break;
            case TITLE_ID:
                ws.WriteStringMember(id, _title, flags);
                break;
            case CREATE_TIME_ID:
                ws.WriteDateTimeMember(id, _createTime, flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFTask));
        }
    }

    protected internal override void ReadMember<T>(short id, ref T rs, int flags)
    {
        switch (id)
        {
            case INSTANCE_ID_ID:
                _instanceId = rs.ReadGuidMember(flags);
                break;
            case BOOKMARK_ID_ID:
                _bookmarkId = rs.ReadGuidMember(flags);
                break;
            case INSTANCE_ID:
                _instance = rs.ReadEntityRefMember(flags, () => new WFInstance());
                break;
            case TITLE_ID:
                _title = rs.ReadStringMember(flags);
                break;
            case CREATE_TIME_ID:
                _createTime = rs.ReadDateTimeMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFTask));
        }
    }

    #endregion
}