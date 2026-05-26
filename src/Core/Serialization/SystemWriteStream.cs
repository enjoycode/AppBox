namespace AppBoxCore;

public struct SystemWriteStream : IOutputStream
{
    public SystemWriteStream(Stream stream)
    {
        OutputStream = stream;
    }

    public readonly Stream OutputStream;
    private SerializeContext? _context;

    public SerializeContext Context => _context ??= new SerializeContext();

    public void WriteByte(byte value) => OutputStream.WriteByte(value);

    public void WriteBytes(ReadOnlySpan<byte> src) => OutputStream.Write(src);

    public void Flush() => OutputStream.Flush();
    public Task FlushAsync() => OutputStream.FlushAsync();

    #region ====IEntityMemberWriter====

    void IEntityMemberWriter.WriteStringMember(short id, string? value, int flags) =>
        this.WriteEntityStringMember(id, value, flags);

    void IEntityMemberWriter.WriteBoolMember(short id, bool? value, int flags) =>
        this.WriteEntityBoolMember(id, value, flags);

    void IEntityMemberWriter.WriteByteMember(short id, byte? value, int flags) =>
        this.WriteEntityByteMember(id, value, flags);

    void IEntityMemberWriter.WriteIntMember(short id, int? value, int flags) =>
        this.WriteEntityIntMember(id, value, flags);

    void IEntityMemberWriter.WriteLongMember(short id, long? value, int flags) =>
        this.WriteEntityLongMember(id, value, flags);

    void IEntityMemberWriter.WriteFloatMember(short id, float? value, int flags) =>
        this.WriteEntityFloatMember(id, value, flags);

    void IEntityMemberWriter.WriteDoubleMember(short id, double? value, int flags) =>
        this.WriteEntityDoubleMember(id, value, flags);

    void IEntityMemberWriter.WriteDecimalMember(short id, decimal? value, int flags) =>
        this.WriteEntityDecimalMember(id, value, flags);

    void IEntityMemberWriter.WriteDateTimeMember(short id, DateTime? value, int flags) =>
        this.WriteEntityDateTimeMember(id, value, flags);

    void IEntityMemberWriter.WriteGuidMember(short id, Guid? value, int flags) =>
        this.WriteEntityGuidMember(id, value, flags);

    void IEntityMemberWriter.WriteBinaryMember(short id, byte[]? value, int flags) =>
        this.WriteEntityBinaryMember(id, value, flags);

    void IEntityMemberWriter.WriteEntityRefMember(short id, Entity? value, int flags) =>
        this.WriteEntityRefMember(id, value, flags);

    void IEntityMemberWriter.WriteEntitySetMember<T>(short id, EntitySet<T>? value, int flags) =>
        this.WriteEntitySetMember(id, value, flags);

    #endregion
}

public sealed class SystemWriteStreamWrap
{
    public SystemWriteStreamWrap(Stream stream)
    {
        _wrap = new SystemWriteStream(stream);
    }

    private SystemWriteStream _wrap;

    public Stream OutputStream => _wrap.OutputStream;

    public ref SystemWriteStream GetRef() => ref _wrap;
}