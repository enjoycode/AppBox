using System.Diagnostics;
using ArgumentOutOfRangeException = System.ArgumentOutOfRangeException;
using NotSupportedException = System.NotSupportedException;

namespace AppBoxCore;

public sealed class MessageReadStream : IInputStream
{
    #region ====Static Pool====

    private static readonly ObjectPool<MessageReadStream> Pool =
        new(() => new MessageReadStream(), 16);

    public static MessageReadStream Rent(BytesSegment segment)
    {
        var res = Pool.Allocate();
        res.Current = segment;
        return res;
    }

    /// <summary>
    /// 归还并释放所有缓存块
    /// </summary>
    public static void Return(MessageReadStream mws)
    {
        BytesSegment.ReturnAll(mws.Current);
        mws.Position = 0;
        mws._context?.Clear();
        Pool.Free(mws);
    }

    #endregion

    private MessageReadStream() { }

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

    public void Free() => Return(this);

    public Stream WrapToStream() => new MessageReadStreamWrap(this);

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
}

public sealed class MessageReadStreamWrap : Stream
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

    public override void Close()
    {
        if (_inputStream != null!)
        {
            MessageReadStream.Return(_inputStream);
            _inputStream = null!;
        }

        base.Close();
    }
}