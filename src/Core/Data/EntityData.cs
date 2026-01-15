using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 用于包装实体的序列化数据，以便互相转换
/// </summary>
public sealed class EntityData : Entity
{
    internal EntityData(ModelId modelId)
    {
        Debug.Assert(modelId.Type == ModelType.Entity);
        _modelId = modelId;
    }

    internal EntityData(ModelId modelId, EntityType type)
    {
        Debug.Assert(modelId.Type == ModelType.Entity);
        _modelId = modelId;
        _entityType = type;
    }

    private ModelId _modelId;
    private EntityType _entityType;
    public override ModelId ModelId => _modelId;
    protected override EntityType EntityType => _entityType;
    public PersistentState PersistentState { get; private set; }
    private readonly List<MemberData> _members = [];
    internal List<short>? ChangedMembers { get; private set; }

    protected override short[] AllMembers => _members.Select(m => m.MemberId).ToArray();

    internal void AddMember(short id, AnyValue value) => _members.Add(new MemberData(id, value));

    public override EntityData ToEntityData() => this;

    #region ====Convert with Entity====

    public T ToEntity<T>() where T : Entity, new()
    {
        var entity = new T();
        if (entity.ModelId != ModelId)
            throw new Exception("EntityModel is not same");

        if (entity is DbEntity dbEntity)
        {
            dbEntity.ClonePersistentStateAndChangedMembers(this);
        }

        var reader = new EntityDataReader(this);
        for (var i = 0; i < _members.Count; i++)
        {
            reader.SetMemberIndex(i);
            entity.ReadMember(_members[i].MemberId, ref reader, 0);
        }

        return entity;
    }

    internal void ClonePersistentStateAndChangedMembers(DbEntity dbEntity)
    {
        PersistentState = dbEntity.PersistentState;
        ChangedMembers = dbEntity.ChangedMembers;
    }

    #endregion

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
        public decimal ReadDecimalMember(int flags) => _data._members[_index].Value.GetDecimal()!.Value;
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

    protected internal override void WriteMember<T>(short id, ref T ws, int flags) => throw new NotSupportedException();

    protected internal override void ReadMember<T>(short id, ref T rs, int flags) => throw new NotSupportedException();

    protected override void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)EntityType);

        if (EntityType == EntityType.SqlStore)
        {
            ws.WriteByte((byte)PersistentState);

            //Changes of members
            var changesCount = ChangedMembers?.Count ?? 0;
            ws.WriteVariant(changesCount);
            for (var i = 0; i < changesCount; i++)
            {
                ws.WriteShort(ChangedMembers![i]);
            }
        }

        // Members
        for (var i = 0; i < _members.Count; i++)
        {
            ws.WriteShort(_members[i].MemberId);
            _members[i].Value.SerializeTo(ws);
        }

        ws.WriteShort(0); ////End write members
    }

    protected override void ReadFrom(IInputStream rs)
    {
        _entityType = (EntityType)rs.ReadByte();

        if (EntityType == EntityType.SqlStore)
        {
            PersistentState = (PersistentState)rs.ReadByte();
            //Changed members
            var changesCount = rs.ReadVariant();
            if (changesCount > 0)
            {
                ChangedMembers = new List<short>(changesCount);
                for (var i = 0; i < changesCount; i++)
                {
                    ChangedMembers.Add(rs.ReadShort());
                }
            }
        }

        //Members
        while (true)
        {
            var memberId = rs.ReadShort();
            if (memberId == 0) break;
            _members.Add(new MemberData(memberId, AnyValue.ReadFrom(rs)));
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