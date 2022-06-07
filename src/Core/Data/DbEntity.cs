namespace AppBoxCore;

/// <summary>
/// 可持久化存储的实体基类
/// </summary>
public abstract class DbEntity : Entity
{
    private IList<short>? _changedMembers = null;
    public PersistentState PersistentState { get; private set; }

    protected void OnPropertyChanged(short memberId)
    {
        if (PersistentState != PersistentState.Unchanged) return;

        PersistentState = PersistentState.Modified;
        //Track member changes
        _changedMembers ??= new List<short>();
        if (_changedMembers.IndexOf(memberId) < 0)
            _changedMembers.Add(memberId);
    }

    public bool IsMemberChanged(short memberId) =>
        _changedMembers != null && _changedMembers.IndexOf(memberId) >= 0;

    /// <summary>
    /// 仅用于从数据库加载完成后变更持久化状态
    /// </summary>
    internal void FetchDone() => PersistentState = PersistentState.Unchanged;
}