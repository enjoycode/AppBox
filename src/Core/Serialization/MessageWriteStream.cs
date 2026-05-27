namespace AppBoxCore;

public struct MessageWriteStream : IOutputStream
{
    public MessageWriteStream()
    {
        _current = BytesSegment.Rent();
    }

    private BytesSegment _current = null!;
    private int _pos;
    private SerializeContext? _context;

    public SerializeContext Context => _context ??= new SerializeContext();

    private void MoveToNext()
    {
        var next = BytesSegment.Rent();
        _current.Append(next);
        _current = next;
        _pos = 0;
    }

    /// <summary>
    /// Finish write and take (owns) buffer
    /// </summary>
    /// <returns></returns>
    public BytesSegment FinishWrite()
    {
        _current.Length = _pos;
        var res = _current;
        _current = null!;
        return res.First!;
    }

    public void FreeBuffer()
    {
        if (_current != null!)
            BytesSegment.ReturnAll(_current.First!);
        _current = null!;
    }

    #region ====IOutputStream====

    public void WriteByte(byte value)
    {
        if (_pos >= _current.Length)
            MoveToNext();
        _current.Buffer[_pos++] = value;
    }

    public void WriteBytes(ReadOnlySpan<byte> src)
    {
        while (true)
        {
            var left = _current.Length - _pos;
            if (left > 0)
            {
                if (left >= src.Length)
                {
                    src.CopyTo(_current.Buffer.AsSpan(_pos));
                    _pos += src.Length;
                }
                else
                {
                    src.Slice(0, left).CopyTo(_current.Buffer.AsSpan(_pos));
                    MoveToNext();
                    src = src.Slice(left);
                    continue;
                }
            }
            else
            {
                MoveToNext();
                continue;
            }

            break;
        }
    }

    #endregion

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