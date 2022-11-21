namespace AppBoxCore;

/// <summary>
/// 可持久化存储的实体基类
/// </summary>
public abstract class DbEntity : Entity
{
    private IList<short>? _changedMembers;
    public PersistentState PersistentState { get; private set; }

    protected sealed override void OnPropertyChanged(short memberId)
    {
        if (PersistentState == PersistentState.Unchanged || PersistentState == PersistentState.Modified)
        {
            PersistentState = PersistentState.Modified;
            //Track member changes
            _changedMembers ??= new List<short>();
            if (_changedMembers.IndexOf(memberId) < 0)
                _changedMembers.Add(memberId);
        }
        
        base.OnPropertyChanged(memberId);
    }

    public bool IsMemberChanged(short memberId) =>
        _changedMembers != null && _changedMembers.IndexOf(memberId) >= 0;

    /// <summary>
    /// 接受状态变更
    /// </summary>
    public void AcceptChanges()
    {
        _changedMembers = null;
        PersistentState = PersistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;
        //TODO: accept Tracker member change?
    }

    /// <summary>
    /// Only for DbStore.Delete()
    /// </summary>
    internal void AsDeleted() => PersistentState = PersistentState.Deleted;

    #region ====Serialization====

    internal void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)PersistentState);

        var changesCount = _changedMembers?.Count ?? 0;
        ws.WriteVariant(changesCount);
        for (var i = 0; i < changesCount; i++)
        {
            ws.WriteShort(_changedMembers![i]);
        }
    }

    internal void ReadFrom(IInputStream rs)
    {
        PersistentState = (PersistentState)rs.ReadByte();

        var changesCount = rs.ReadVariant();
        if (changesCount > 0)
        {
            _changedMembers = new List<short>(changesCount);
            for (var i = 0; i < changesCount; i++)
            {
                _changedMembers.Add(rs.ReadShort());
            }
        }
    }

    #endregion
}