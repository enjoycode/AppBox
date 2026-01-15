namespace AppBoxCore;

/// <summary>
/// 可持久化存储的实体基类
/// </summary>
public abstract class DbEntity : Entity
{
    public PersistentState PersistentState { get; private set; }
    internal List<short>? ChangedMembers { get; private set; }

    protected sealed override void OnPropertyChanged(short memberId)
    {
        if (PersistentState == PersistentState.Unchanged || PersistentState == PersistentState.Modified)
        {
            PersistentState = PersistentState.Modified;
            //Track member changes
            ChangedMembers ??= new List<short>();
            if (ChangedMembers.IndexOf(memberId) < 0)
                ChangedMembers.Add(memberId);
        }

        base.OnPropertyChanged(memberId);
    }

    public bool IsMemberChanged(short memberId) =>
        ChangedMembers != null && ChangedMembers.IndexOf(memberId) >= 0;

    /// <summary>
    /// 接受状态变更
    /// </summary>
    public void AcceptChanges()
    {
        //accept Tracker member changes first
        if (PersistentState != PersistentState.Detached)
            AcceptTrackerChanges();

        ChangedMembers = null;
        PersistentState = PersistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;
    }

    /// <summary>
    /// 如果有跟踪成员，子类重写重置所有跟踪成员值=null
    /// </summary>
    protected virtual void AcceptTrackerChanges() { }

    /// <summary>
    /// Only for DbStore.Delete()
    /// </summary>
    internal void AsDeleted() => PersistentState = PersistentState.Deleted;

    #region ====Convert with EntityData====

    internal void ClonePersistentStateAndChangedMembers(EntityData entityData)
    {
        PersistentState = entityData.PersistentState;
        ChangedMembers = entityData.ChangedMembers;
    }

    public sealed override EntityData ToEntityData()
    {
        var data = new EntityData(ModelId, EntityType);
        data.ClonePersistentStateAndChangedMembers(this);

        var writer = new EntityDataWriter(data);
        foreach (var memberId in AllMembers)
            WriteMember(memberId, ref writer, EntityMemberWriteFlags.None);
        return data;
    }

    #endregion

    #region ====Serialization====

    protected sealed override void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)EntityType);
        ws.WriteByte((byte)PersistentState);

        //Changes of members
        var changesCount = ChangedMembers?.Count ?? 0;
        ws.WriteVariant(changesCount);
        for (var i = 0; i < changesCount; i++)
        {
            ws.WriteShort(ChangedMembers![i]);
        }

        //Write members
        foreach (var memberId in AllMembers)
        {
            WriteMember(memberId, ref ws, WriteMemberFlags);
        }

        ResetWriteMemberFlags(); //注意写完后重置
        ws.WriteShort(0); //End write members
    }

    protected sealed override void ReadFrom(IInputStream rs)
    {
        rs.ReadByte(); //EntityType
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

        //Read members
        while (true)
        {
            var memberId = rs.ReadShort();
            if (memberId == 0) break;
            ReadMember(memberId, ref rs, 0);
        }
    }

    #endregion
}