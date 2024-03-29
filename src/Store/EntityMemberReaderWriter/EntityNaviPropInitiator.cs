using System;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 用于查询时初始化实体的导航属性
/// </summary>
internal struct EntityNaviPropInitiator : IEntityMemberReader
{
    public EntityNaviPropInitiator() { }

    /// <summary>
    /// EntityRef或EntitySet的实例
    /// </summary>
    internal object NaviMemberValue { get; private set; } = null!;

    #region ====NotSupported====

    public string ReadStringMember(int flags) => throw new NotSupportedException();

    public bool ReadBoolMember(int flags) => throw new NotSupportedException();

    public byte ReadByteMember(int flags) => throw new NotSupportedException();

    public int ReadIntMember(int flags) => throw new NotSupportedException();

    public long ReadLongMember(int flags) => throw new NotSupportedException();

    public float ReadFloatMember(int flags) => throw new NotSupportedException();

    public double ReadDoubleMember(int flags) => throw new NotSupportedException();

    public DateTime ReadDateTimeMember(int flags) => throw new NotSupportedException();

    public Guid ReadGuidMember(int flags) => throw new NotSupportedException();

    public byte[] ReadBinaryMember(int flags) => throw new NotSupportedException();

    #endregion

    public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
    {
        var res = creator!.Invoke();
        NaviMemberValue = res;
        return res;
    }

    public void ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) where T : Entity, new()
    {
        NaviMemberValue = entitySet;
    }
}