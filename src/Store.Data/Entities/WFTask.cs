using AppBoxCore;

namespace AppBoxStore.Entities;

/// <summary>
/// 工作流待办事项
/// </summary>
internal sealed class WFTask : SqlEntity, IEntity
{
    public WFTask() { }

    public WFTask(Guid actorId, Guid instanceId, Guid bookmarkId)
    {
        _actorId = actorId;
        _instanceId = instanceId;
        _bookmarkId = bookmarkId;
    }

    private Guid _actorId;
    private Guid _instanceId;
    private Guid _bookmarkId;
    private OrgUnit? _actor;
    private WFInstance? _instance;
    private string _title = string.Empty;
    private DateTime _createTime;
    private byte[]? _actions;

    // private DateTime? _resultTime;
    // private string? _result;
    // private string? _comment;

    public Guid ActorId => _actorId;
    public Guid InstanceId => _instanceId;
    public Guid BookmarkId => _bookmarkId;

    public OrgUnit? Actor => _actor;

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

    public byte[]? Actions
    {
        get => _actions;
        set => SetField(ref _actions, value, ACTIONS_ID);
    }

    // public DateTime? ResultTime
    // {
    //     get => _resultTime;
    //     set => SetField(ref _resultTime, value, RESULT_TIME_ID);
    // }
    //
    // public string? Result
    // {
    //     get => _result;
    //     set => SetField(ref _result, value, RESULT_ID);
    // }
    //
    // public string? Comment
    // {
    //     get => _comment;
    //     set => SetField(ref _comment, value, COMMENT_ID);
    // }

    #region ====Overrides====

    public static long MODELID => 8012673906332663840; //8

    internal const short ACTOR_ID_ID = 1 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short INSTANCE_ID_ID = 2 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short BOOKMARK_ID_ID = 3 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short ACTOR_ID = 4 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short INSTANCE_ID = 5 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short TITLE_ID = 6 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    internal const short CREATE_TIME_ID = 7 << EntityMemberId.MEMBERID_SEQ_OFFSET;

    internal const short ACTIONS_ID = 8 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    // internal const short RESULT_TIME_ID = 8 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    // internal const short RESULT_ID = 9 << EntityMemberId.MEMBERID_SEQ_OFFSET;
    // internal const short COMMENT_ID = 10 << EntityMemberId.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds =
    [
        ACTOR_ID_ID, INSTANCE_ID_ID, BOOKMARK_ID_ID,
        ACTOR_ID, INSTANCE_ID, TITLE_ID, CREATE_TIME_ID, ACTIONS_ID
        /*RESULT_TIME_ID, RESULT_ID, COMMENT_ID*/
    ];

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    protected internal override void WriteMember<T>(short id, ref T ws, int flags)
    {
        switch (id)
        {
            case ACTOR_ID_ID:
                ws.WriteGuidMember(id, _actorId, flags);
                break;
            case INSTANCE_ID_ID:
                ws.WriteGuidMember(id, _instanceId, flags);
                break;
            case BOOKMARK_ID_ID:
                ws.WriteGuidMember(id, _bookmarkId, flags);
                break;
            case ACTOR_ID:
                ws.WriteEntityRefMember(id, _actor, flags);
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
            case ACTIONS_ID:
                ws.WriteBinaryMember(id, _actions, flags);
                break;
            // case RESULT_TIME_ID:
            //     ws.WriteDateTimeMember(id, _resultTime, flags);
            //     break;
            // case RESULT_ID:
            //     ws.WriteStringMember(id, _result, flags);
            //     break;
            // case COMMENT_ID:
            //     ws.WriteStringMember(id, _comment, flags);
            //     break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFTask));
        }
    }

    protected internal override void ReadMember<T>(short id, ref T rs, int flags)
    {
        switch (id)
        {
            case ACTOR_ID_ID:
                _actorId = rs.ReadGuidMember(flags);
                break;
            case INSTANCE_ID_ID:
                _instanceId = rs.ReadGuidMember(flags);
                break;
            case BOOKMARK_ID_ID:
                _bookmarkId = rs.ReadGuidMember(flags);
                break;
            case ACTOR_ID:
                _actor = rs.ReadEntityRefMember(flags, () => new OrgUnit());
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
            case ACTIONS_ID:
                _actions = rs.ReadBinaryMember(flags);
                break;
            // case RESULT_TIME_ID:
            //     _resultTime = rs.ReadDateTimeMember(flags);
            //     break;
            // case RESULT_ID:
            //     _result = rs.ReadStringMember(flags);
            //     break;
            // case COMMENT_ID:
            //     _comment = rs.ReadStringMember(flags);
            //     break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember, nameof(WFTask));
        }
    }

    #endregion
}