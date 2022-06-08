using System;
using System.Collections.Generic;
using System.Threading;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 用于查询时初始化实体的导航属性
/// </summary>
internal sealed class EntityNaviPropInitiator : IEntityMemberReader
{
    private static readonly ThreadLocal<EntityNaviPropInitiator> _threadLocal =
        new(() => new EntityNaviPropInitiator());

    internal static EntityNaviPropInitiator ThreadInstance => _threadLocal.Value;

    private object _naviMemberValue = null!;

    internal object NaviMemberValue => _naviMemberValue;

    public string ReadStringMember(int flags) => throw new NotSupportedException();

    public bool ReadBoolMember(int flags) => throw new NotSupportedException();

    public byte ReadByteMember(int flags) => throw new NotSupportedException();

    public int ReadIntMember(int flags) => throw new NotSupportedException();

    public long ReadLongMember(int flags) => throw new NotSupportedException();

    public DateTime ReadDateTimeMember(int flags) => throw new NotSupportedException();

    public Guid ReadGuidMember(int flags) => throw new NotSupportedException();

    public byte[] ReadBinaryMember(int flags) => throw new NotSupportedException();

    public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
    {
        var res = creator!.Invoke();
        _naviMemberValue = res;
        return res;
    }

    public IList<T> ReadEntitySetMember<T>(int flags, Func<T>? creator) where T : Entity
    {
        var res = new List<T>();
        _naviMemberValue = res;
        return res;
    }
}