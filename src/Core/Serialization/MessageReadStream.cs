using System.Diagnostics;

namespace AppBoxCore;

public struct MessageReadStream : IInputStream
{
    public MessageReadStream(BytesSegment first)
    {
        Current = first;
        _context = null;
        Position = 0;
    }

    private DeserializeContext? _context;

    internal BytesSegment Current { get; private set; } = null!;
    internal int Position { get; private set; }

    public DeserializeContext Context => _context ??= new DeserializeContext();

    internal void Reset(BytesSegment segment, int position = 0)
    {
        Current = segment;
        Position = position;
    }

    /// <summary>
    /// Take owner for blob chunk, and free self
    /// </summary>
    internal IBlobChunk TakeBlobChunkAndFreeSelf()
    {
        var msgType = (MessageType)Current.Buffer[0];
        if (msgType != MessageType.UploadChunk && msgType != MessageType.DownloadChunk)
            throw new NotSupportedException("Only for Upload or Download data chunk");

        var result = Current;
        Current = null!;
        Free();
        return result;
    }

    /// <summary>
    /// 当前缓存块剩余的字节数
    /// </summary>
    internal int CurrentRemaining => Current.Length - Position;

    public bool HasRemaining => CurrentRemaining > 0 || Current.Next != null;

    internal void MoveToNext()
    {
        var next = Current.Next as BytesSegment;
        if (next == null)
            throw new SerializationException(SerializationError.NothingToRead);
        Reset(next);
    }

    /// <summary>
    /// 归还并释放所有缓存块
    /// </summary>
    public void Free()
    {
        if (Current != null!)
            BytesSegment.ReturnAll(Current);

        _context?.Clear();
    }

    // public Stream ToSystemStream() => new MessageReadStreamWrap(this);

    public async Task CopyToAsync(Stream destination)
    {
        while (true)
        {
            await destination.WriteAsync(Current.Buffer, Position, CurrentRemaining);
            var next = Current.Next as BytesSegment;
            if (next == null)
                return;
            Reset(next);
        }
    }

    #region ====IInputStream====

    public byte ReadByte()
    {
        if (CurrentRemaining <= 0) MoveToNext();

        return Current.Buffer[Position++];
    }

    public void ReadBytes(Span<byte> dest)
    {
        while (true)
        {
            var left = CurrentRemaining;
            if (left > 0)
            {
                if (left >= dest.Length)
                {
                    Current.Buffer.AsSpan(Position, dest.Length).CopyTo(dest);
                    Position += dest.Length;
                }
                else
                {
                    Current.Buffer.AsSpan(Position, left).CopyTo(dest);
                    MoveToNext();
                    dest = dest.Slice(left);
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

internal sealed class MessageReadStreamWrap : Stream
{
    public MessageReadStreamWrap(MessageReadStream inputStream)
    {
        _inputStream = inputStream;
        _start = _inputStream.Current;
        _startPos = _inputStream.Position;

        _length = _inputStream.CurrentRemaining;
        var temp = _start.Next as BytesSegment;
        while (temp != null)
        {
            _length += temp.Length;
            temp = temp.Next as BytesSegment;
        }
    }

    private MessageReadStream _inputStream;
    private int _position;
    private readonly BytesSegment _start;
    private readonly int _startPos;
    private readonly int _length;

    public override void Flush() { }

    public override int Read(byte[] buffer, int offset, int count)
    {
        var bytesRead = 0;
        while (bytesRead < count)
        {
            if (!_inputStream.HasRemaining)
                break;

            var curLeft = _inputStream.CurrentRemaining;
            if (curLeft == 0)
            {
                _inputStream.MoveToNext();
                curLeft = _inputStream.CurrentRemaining;
            }

            var thisRead = Math.Min(curLeft, count - bytesRead);
            _inputStream.ReadBytes(buffer.AsSpan(offset + bytesRead, thisRead));
            bytesRead += thisRead;
        }

        Position += bytesRead;
        return bytesRead;
    }

    public override long Seek(long offset, SeekOrigin loc)
    {
        switch (loc)
        {
            case SeekOrigin.Begin:
            {
                int tempPosition = unchecked((int)offset);
                if (offset < 0 || tempPosition < 0)
                    throw new ArgumentOutOfRangeException();
                _position = tempPosition;
                break;
            }
            case SeekOrigin.Current:
            {
                int tempPosition = unchecked(_position + (int)offset);
                if (unchecked(_position + offset) < 0 || tempPosition < 0)
                    throw new ArgumentOutOfRangeException();
                _position = tempPosition;
                break;
            }
            case SeekOrigin.End:
            {
                int tempPosition = unchecked(_length + (int)offset);
                if (unchecked(_length + offset) < 0 || tempPosition < 0)
                    throw new ArgumentOutOfRangeException();
                _position = tempPosition;
                break;
            }
            default:
                throw new ArgumentException();
        }

        Debug.Assert(_position >= 0, "_position >= 0");
        GotoPosition(_position);
        return _position;
    }

    private void GotoPosition(int pos)
    {
        // if (pos < 0 || pos >= _length)
        //     throw new ArgumentOutOfRangeException();
        if (_start.Length - _startPos >= pos)
        {
            _inputStream.Reset(_start, _startPos + pos);
            return;
        }

        var cur = _start.Length - _startPos;
        var tempSeg = (BytesSegment)_start.Next!;
        while (cur < pos)
        {
            if (cur + tempSeg.Length >= pos)
            {
                _inputStream.Reset(tempSeg, pos - cur);
                return;
            }

            cur += tempSeg.Length;
            tempSeg = (BytesSegment)tempSeg.Next!;
        }
    }

    public override void SetLength(long value) => throw new NotSupportedException();

    public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

    public override bool CanRead => true;

    public override bool CanSeek => true;

    public override bool CanWrite => false;

    public override long Length => _length;

    public override long Position
    {
        get => _position;
        set
        {
            _position = (int)value;
            GotoPosition(_position);
        }
    }
}