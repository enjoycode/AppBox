using System;
using AppBoxCore;

namespace AppBoxStore;

public sealed class StagedModel : SqlEntity
{
    public StagedModel() { }

    public StagedModel(byte type, string modelId, Guid developerId)
    {
        _type = type;
        _modelId = modelId;
        _developerId = developerId;
    }

    private byte _type;
    private string _modelId;
    private Guid _developerId;
    private byte[] _data;

    public byte Type => _type;

    public string ModelIdString => _modelId;

    public byte[] Data
    {
        get => _data;
        set
        {
            _data = value;
            OnPropertyChanged(DATA_ID);
        }
    }

    #region ====Overrides====

    internal static readonly ModelId MODELID =
        ModelId.Make(Consts.SYS_APP_ID, ModelType.Entity, 5, ModelLayer.SYS);

    internal const short TYPE_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short MODEL_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short DEVELOPER_ID = 3 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short DATA_ID = 4 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds = { TYPE_ID, MODEL_ID, DEVELOPER_ID, DATA_ID };

    public override ModelId ModelId => MODELID;
    public override short[] AllMembers => MemberIds;

    public override void WriteMember(short id, IEntityMemberWriter ws, int flags)
    {
        switch (id)
        {
            case TYPE_ID:
                ws.WriteByteMember(id, _type, flags);
                break;
            case MODEL_ID:
                ws.WriteStringMember(id, _modelId, flags);
                break;
            case DEVELOPER_ID:
                ws.WriteGuidMember(id, _developerId, flags);
                break;
            case DATA_ID:
                ws.WriteBinaryMember(id, _data, flags);
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
            case TYPE_ID:
                _type = rs.ReadByteMember(flags);
                break;
            case MODEL_ID:
                _modelId = rs.ReadStringMember(flags);
                break;
            case DEVELOPER_ID:
                _developerId = rs.ReadGuidMember(flags);
                break;
            case DATA_ID:
                _data = rs.ReadBinaryMember(flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    #endregion
}