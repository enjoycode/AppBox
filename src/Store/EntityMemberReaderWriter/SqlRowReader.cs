using System;
using System.Data.Common;
using System.Threading;
using AppBoxCore;

namespace AppBoxStore;

public sealed class SqlRowReader : IEntityMemberReader
{
    //flags = 列序号
    
    private static readonly ThreadLocal<SqlRowReader> _threadLocal =
        new(() => new SqlRowReader());

    internal static SqlRowReader ThreadInstance => _threadLocal.Value;

    private DbDataReader? _dataReader;

    public DbDataReader? DataReader
    {
        set => _dataReader = value;
    }

    public string ReadStringMember(int flags) => _dataReader!.GetString(flags);

    public bool ReadBoolMember(int flags) => _dataReader!.GetBoolean(flags);

    public byte ReadByteMember(int flags) => _dataReader!.GetByte(flags);

    public int ReadIntMember(int flags) => _dataReader!.GetInt32(flags);

    public long ReadLongMember(int flags) => _dataReader!.GetInt64(flags);

    public DateTime ReadDateTimeMember(int flags) => _dataReader!.GetDateTime(flags);

    public Guid ReadGuidMember(int flags) => _dataReader!.GetGuid(flags);

    public byte[] ReadBinaryMember(int flags) => (byte[])_dataReader!.GetValue(flags);

    public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
        => throw new NotSupportedException();

    public void ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) where T : Entity, new()
        => throw new NotSupportedException();
}