namespace AppBoxCore;

public struct SystemReadStream : IInputStream
{
    //TODO: use buffer for read

    public SystemReadStream(Stream stream)
    {
        InputStream = stream;
    }

    public readonly Stream InputStream;
    private DeserializeContext? _context;

    public DeserializeContext Context => _context ??= new DeserializeContext();

    public bool HasRemaining => InputStream.Position < InputStream.Length;

    public byte ReadByte()
    {
        var res = InputStream.ReadByte();
        if (res == -1) throw new SerializationException(SerializationError.NothingToRead);
        return (byte)res;
    }

    public void ReadBytes(Span<byte> dest)
    {
        var read = InputStream.Read(dest);
        if (read != dest.Length)
            throw new SerializationException(SerializationError.NothingToRead);
    }

    public Stream ToSystemStream() => InputStream;

    public void Free() => InputStream.Dispose();

    #region ====IEntityMemberReader====

    string IEntityMemberReader.ReadStringMember(int flags) => this.ReadEntityStringMember(flags);
    bool IEntityMemberReader.ReadBoolMember(int flags) => this.ReadEntityBoolMember(flags);
    byte IEntityMemberReader.ReadByteMember(int flags) => this.ReadEntityByteMember(flags);
    int IEntityMemberReader.ReadIntMember(int flags) => this.ReadEntityIntMember(flags);
    long IEntityMemberReader.ReadLongMember(int flags) => this.ReadEntityLongMember(flags);
    float IEntityMemberReader.ReadFloatMember(int flags) => this.ReadEntityFloatMember(flags);
    double IEntityMemberReader.ReadDoubleMember(int flags) => this.ReadEntityDoubleMember(flags);
    decimal IEntityMemberReader.ReadDecimalMember(int flags) => this.ReadEntityDecimalMember(flags);
    DateTime IEntityMemberReader.ReadDateTimeMember(int flags) => this.ReadEntityDateTimeMember(flags);
    Guid IEntityMemberReader.ReadGuidMember(int flags) => this.ReadEntityGuidMember(flags);
    byte[] IEntityMemberReader.ReadBinaryMember(int flags) => this.ReadEntityBinaryMember(flags);

    T IEntityMemberReader.ReadEntityRefMember<T>(int flags, Func<T>? creator) =>
        this.ReadEntityRefMember(flags, creator);

    void IEntityMemberReader.ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet) =>
        this.ReadEntitySetMember(flags, entitySet);

    #endregion
}

public sealed class SystemReadStreamWrap
{
    public SystemReadStreamWrap(Stream stream)
    {
        _wrap = new SystemReadStream(stream);
    }

    private SystemReadStream _wrap;

    public Stream InputStream => _wrap.InputStream;

    public ref SystemReadStream GetRef() => ref _wrap;
}