using AppBoxCore;

namespace AppBoxStore.Entities;

/// <summary>
/// 工作流任务的参与者
/// </summary>
public sealed class WFTaskActor : SqlEntity, IEntity
{
    public WFTaskActor() { }

    public WFTaskActor(Guid instanceId, Guid bookmarkId, Guid actorId)
    {
        _instanceId = instanceId;
        _bookmarkId = bookmarkId;
        _actorId = actorId;
    }

    private Guid _instanceId;
    private Guid _bookmarkId;
    private Guid _actorId;
    private WFTask? _task;
    private OrgUnit? _actor;
    private byte _status;
    private DateTime? _resultTime;
    private string? _result;
    private string? _comment;

    public Guid InstanceId => _instanceId;
    public Guid BookmarkId => _bookmarkId;
    public Guid ActorId => _actorId;
    public WFTask? Task => _task;
    public OrgUnit? Actor => _actor;

    public byte Status
    {
        get => _status;
        set => SetField(ref _status, value, STATUS_ID);
    }

    public DateTime? ResultTime
    {
        get => _resultTime;
        set => SetField(ref _resultTime, value, RESULT_TIME_ID);
    }

    public string? Result
    {
        get => _result;
        set => SetField(ref _result, value, RESULT_ID);
    }

    public string? Comment
    {
        get => _comment;
        set => SetField(ref _comment, value, COMMENT_ID);
    }

    #region ====Overrides====

    public static long MODELID => 8012673906332663844; //9

    internal const short INSTANCE_ID_ID = 1 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short BOOKMARK_ID_ID = 2 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short TASK_ID = 3 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short ACTOR_ID_ID = 4 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short STATUS_ID = 5 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short ACTOR_ID = 6 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short RESULT_TIME_ID = 7 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short RESULT_ID = 8 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short COMMENT_ID = 9 << EntityMemberId.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds =
    [
        INSTANCE_ID_ID, BOOKMARK_ID_ID, TASK_ID, ACTOR_ID_ID, STATUS_ID, ACTOR_ID, RESULT_TIME_ID, RESULT_ID, COMMENT_ID
    ];

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
            case TASK_ID:
                ws.WriteEntityRefMember(id, _task, flags);
                break;
            case ACTOR_ID_ID:
                ws.WriteGuidMember(id, _actorId, flags);
                break;
            case STATUS_ID:
                ws.WriteByteMember(id, _status, flags);
                break;
            case ACTOR_ID:
                ws.WriteEntityRefMember(id, _actor, flags);
                break;
            case RESULT_TIME_ID:
                ws.WriteDateTimeMember(id, _resultTime, flags);
                break;
            case RESULT_ID:
                ws.WriteStringMember(id, _result, flags);
                break;
            case COMMENT_ID:
                ws.WriteStringMember(id, _comment, flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFTaskActor));
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
            case TASK_ID:
                _task = rs.ReadEntityRefMember(flags, () => new WFTask());
                break;
            case ACTOR_ID_ID:
                _actorId = rs.ReadGuidMember(flags);
                break;
            case STATUS_ID:
                _status = rs.ReadByteMember(flags);
                break;
            case ACTOR_ID:
                _actor = rs.ReadEntityRefMember(flags, () => new OrgUnit());
                break;
            case RESULT_TIME_ID:
                _resultTime = rs.ReadDateTimeMember(flags);
                break;
            case RESULT_ID:
                _result = rs.ReadStringMember(flags);
                break;
            case COMMENT_ID:
                _comment = rs.ReadStringMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFTaskActor));
        }
    }

    #endregion
}