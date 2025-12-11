using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 用于包装实体的序列化数据，以便互相转换
/// </summary>
public sealed class EntityData : IBinSerializable
{
    internal EntityData() { }

    internal EntityData(ModelId modelId)
    {
        Debug.Assert(modelId.Type == ModelType.Entity);
        ModelId = modelId;
    }

    public ModelId ModelId { get; private set; }
    private readonly List<MemberData> _members = [];

    internal void AddMember(short id, AnyValue value)
    {
        _members.Add(new MemberData(id, value));
    }

    public T ToEntity<T>() where T : Entity, new()
    {
        var entity = new T();
        if (entity.ModelId != ModelId)
            throw new Exception("EntityModel is not same");

        var reader = new EntityDataReader(this);
        for (var i = 0; i < _members.Count; i++)
        {
            reader.SetMemberIndex(i);
            entity.ReadMember(_members[i].MemberId, ref reader, 0);
        }

        return entity;
    }

    #region ====EntityDataReader====

    private struct EntityDataReader : IEntityMemberReader
    {
        public EntityDataReader(EntityData data)
        {
            _data = data;
        }

        private readonly EntityData _data;
        private int _index;

        internal void SetMemberIndex(int index) => _index = index;

        public string ReadStringMember(int flags) => (string)_data._members[_index].Value;
        public bool ReadBoolMember(int flags) => _data._members[_index].Value.GetBool()!.Value;
        public byte ReadByteMember(int flags) => _data._members[_index].Value.GetByte()!.Value;
        public int ReadIntMember(int flags) => _data._members[_index].Value.GetInt()!.Value;
        public long ReadLongMember(int flags) => _data._members[_index].Value.GetLong()!.Value;
        public float ReadFloatMember(int flags) => _data._members[_index].Value.GetFloat()!.Value;
        public double ReadDoubleMember(int flags) => _data._members[_index].Value.GetDouble()!.Value;
        public DateTime ReadDateTimeMember(int flags) => _data._members[_index].Value.GetDateTime()!.Value;
        public Guid ReadGuidMember(int flags) => _data._members[_index].Value.GetGuid()!.Value;

        public byte[] ReadBinaryMember(int flags)
        {
            throw new NotImplementedException();
        }

        public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
        {
            throw new NotImplementedException();
        }

        public void ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) where T : Entity, new()
        {
            throw new NotImplementedException();
        }
    }

    #endregion

    #region ====Serialization====

    void IBinSerializable.WriteTo(IOutputStream ws)
    {
        ws.WriteLong(ModelId);

        ws.WriteVariant(_members.Count);
        for (var i = 0; i < _members.Count; i++)
        {
            ws.WriteShort(_members[i].MemberId);
            _members[i].Value.SerializeTo(ws);
        }
    }

    void IBinSerializable.ReadFrom(IInputStream rs)
    {
        ModelId = rs.ReadLong();
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            _members.Add(new MemberData(rs.ReadShort(), AnyValue.ReadFrom(rs)));
        }
    }

    #endregion

    #region ====MemberData====

    private readonly struct MemberData
    {
        public MemberData(short id, AnyValue value)
        {
            MemberId = id;
            Value = value;
        }

        public readonly short MemberId;
        public readonly AnyValue Value;
    }

    #endregion
}