using System;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

public readonly struct SqlRowReader : IEntityMemberReader
{
    //flags = 列序号

    public SqlRowReader(DbDataReader dbDataReader)
    {
        _dataReader = dbDataReader;
    }

    private readonly DbDataReader _dataReader;

    public string ReadStringMember(int flags) => _dataReader.GetString(flags);

    public string? ReadNullableStringMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : _dataReader.GetString(flags);

    public bool ReadBoolMember(int flags) => _dataReader.GetBoolean(flags);

    public bool? ReadNullableBoolMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : _dataReader.GetBoolean(flags);

    public byte ReadByteMember(int flags) => _dataReader.GetByte(flags);

    public byte? ReadNullableByteMember(int flags) => _dataReader.IsDBNull(flags) ? null : _dataReader.GetByte(flags);

    public int ReadIntMember(int flags) => _dataReader.GetInt32(flags);

    public int? ReadNullableIntMember(int flags) => _dataReader.IsDBNull(flags) ? null : _dataReader.GetInt32(flags);

    public long ReadLongMember(int flags) => _dataReader.GetInt64(flags);

    public long? ReadNullableLongMember(int flags) => _dataReader.IsDBNull(flags) ? null : _dataReader.GetInt64(flags);

    public float ReadFloatMember(int flags) => _dataReader.GetFloat(flags);

    public float? ReadNullableFloatMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : _dataReader.GetFloat(flags);

    public double ReadDoubleMember(int flags) => _dataReader.GetDouble(flags);

    public double? ReadNullableDoubleMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : _dataReader.GetDouble(flags);

    public decimal ReadDecimalMember(int flags) => _dataReader.GetDecimal(flags);

    public decimal? ReadNullableDecimalMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : _dataReader.GetDecimal(flags);

    public DateTime ReadDateTimeMember(int flags) => _dataReader.GetDateTime(flags).ToLocalTime();

    public DateTime? ReadNullableDateTimeMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : _dataReader.GetDateTime(flags).ToLocalTime();

    public Guid ReadGuidMember(int flags) => _dataReader.GetGuid(flags);

    public Guid? ReadNullableGuidMember(int flags) => _dataReader.IsDBNull(flags) ? null : _dataReader.GetGuid(flags);

    public byte[] ReadBinaryMember(int flags) => (byte[])_dataReader.GetValue(flags);

    public byte[]? ReadNullableBinaryMember(int flags) =>
        _dataReader.IsDBNull(flags) ? null : (byte[])_dataReader.GetValue(flags);

    public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
        => throw new NotSupportedException();

    public void ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) where T : Entity, new()
        => throw new NotSupportedException();
}