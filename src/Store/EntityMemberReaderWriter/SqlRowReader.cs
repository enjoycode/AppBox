using System;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

public readonly struct SqlRowReader : IEntityMemberReader
{
    //flags = 列序号

    public SqlRowReader(DbDataReader dbDataReader)
    {
        DataReader = dbDataReader;
    }

    internal readonly DbDataReader DataReader;

    public string ReadStringMember(int flags) => DataReader.GetString(flags);

    public string? ReadNullableStringMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : DataReader.GetString(flags);

    public bool ReadBoolMember(int flags) => DataReader.GetBoolean(flags);

    public bool? ReadNullableBoolMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : DataReader.GetBoolean(flags);

    public byte ReadByteMember(int flags) => DataReader.GetByte(flags);

    public byte? ReadNullableByteMember(int flags) => DataReader.IsDBNull(flags) ? null : DataReader.GetByte(flags);

    public int ReadIntMember(int flags) => DataReader.GetInt32(flags);

    public int? ReadNullableIntMember(int flags) => DataReader.IsDBNull(flags) ? null : DataReader.GetInt32(flags);

    public long ReadLongMember(int flags) => DataReader.GetInt64(flags);

    public long? ReadNullableLongMember(int flags) => DataReader.IsDBNull(flags) ? null : DataReader.GetInt64(flags);

    public float ReadFloatMember(int flags) => DataReader.GetFloat(flags);

    public float? ReadNullableFloatMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : DataReader.GetFloat(flags);

    public double ReadDoubleMember(int flags) => DataReader.GetDouble(flags);

    public double? ReadNullableDoubleMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : DataReader.GetDouble(flags);

    public decimal ReadDecimalMember(int flags) => DataReader.GetDecimal(flags);

    public decimal? ReadNullableDecimalMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : DataReader.GetDecimal(flags);

    public DateTime ReadDateTimeMember(int flags) => DataReader.GetDateTime(flags).ToLocalTime();

    public DateTime? ReadNullableDateTimeMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : DataReader.GetDateTime(flags).ToLocalTime();

    public Guid ReadGuidMember(int flags) => DataReader.GetGuid(flags);

    public Guid? ReadNullableGuidMember(int flags) => DataReader.IsDBNull(flags) ? null : DataReader.GetGuid(flags);

    public byte[] ReadBinaryMember(int flags) => (byte[])DataReader.GetValue(flags);

    public byte[]? ReadNullableBinaryMember(int flags) =>
        DataReader.IsDBNull(flags) ? null : (byte[])DataReader.GetValue(flags);

    public T ReadEntityRefMember<T>(int flags, Func<T>? creator) where T : Entity
        => throw new NotSupportedException();

    public void ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) where T : Entity, new()
        => throw new NotSupportedException();
}