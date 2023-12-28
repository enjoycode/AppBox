using System;
using AppBoxCore;

namespace AppBoxStore.Entities;

internal sealed class Checkout : SqlEntity
{
    public Checkout() { }

    public Checkout(Guid developerId, byte nodeType, string targetId)
    {
        _developerId = developerId;
        _nodeType = nodeType;
        _targetId = targetId;
    }

    private byte _nodeType;
    private string _targetId = string.Empty;
    private Guid _developerId;
    private string _developerName = string.Empty;
    private int _version;

    public byte NodeType => _nodeType;
    public string TargetId => _targetId;
    public Guid DeveloperId => _developerId;

    public string DeveloperName
    {
        get => _developerName;
        set => SetField(ref _developerName, value, DEVELOPERNAME_ID);
    }

    public int Version
    {
        get => _version;
        set => SetField(ref _version, value, VERSION_ID);
    }

    #region ====Overrides====

    internal const long MODELID = 8012673906332663832; //6

    internal const short NODETYPE_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short TARGET_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short DEVELOPER_ID = 3 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short DEVELOPERNAME_ID = 4 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short VERSION_ID = 5 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds =
        { NODETYPE_ID, TARGET_ID, DEVELOPER_ID, DEVELOPERNAME_ID, VERSION_ID };

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    protected internal override void WriteMember<T>(short id, ref T ws, int flags)
    {
        switch (id)
        {
            case NODETYPE_ID:
                ws.WriteByteMember(id, _nodeType, flags);
                break;
            case TARGET_ID:
                ws.WriteStringMember(id, _targetId, flags);
                break;
            case DEVELOPER_ID:
                ws.WriteGuidMember(id, _developerId, flags);
                break;
            case DEVELOPERNAME_ID:
                ws.WriteStringMember(id, _developerName, flags);
                break;
            case VERSION_ID:
                ws.WriteIntMember(id, _version, flags);
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
            case NODETYPE_ID:
                _nodeType = rs.ReadByteMember(flags);
                break;
            case TARGET_ID:
                _targetId = rs.ReadStringMember(flags);
                break;
            case DEVELOPER_ID:
                _developerId = rs.ReadGuidMember(flags);
                break;
            case DEVELOPERNAME_ID:
                _developerName = rs.ReadStringMember(flags);
                break;
            case VERSION_ID:
                _version = rs.ReadIntMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    #endregion
}