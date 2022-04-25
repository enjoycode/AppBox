namespace AppBoxCore;

public sealed class MessageReadStream : IInputStream
{
    #region ====Static Pool====

    private static readonly ObjectPool<MessageReadStream> Pool =
        new ObjectPool<MessageReadStream>(() => new MessageReadStream(), 16);

    public static MessageReadStream Rent()
    {
        var res = Pool.Allocate();
        res._current = BytesSegment.Rent();
        return res;
    }

    public static MessageReadStream RentFrom(BytesSegment segment)
    {
        var res = Pool.Allocate();
        res._current = segment;
        return res;
    }

    /// <summary>
    /// 归还并释放所有缓存块
    /// </summary>
    public static void Return(MessageReadStream mws)
    {
        BytesSegment.ReturnAll(mws._current);
        mws._pos = 0;
        Pool.Free(mws);
    }

    #endregion

    private MessageReadStream() { }

    private BytesSegment _current = null!;
    private int _pos;

    private void Reset(BytesSegment segment)
    {
        _current = segment;
        _pos = 0;
    }

    /// <summary>
    /// 当前缓存块剩余的字节数
    /// </summary>
    private int CurrentRemaning => _current.Length - _pos;

    private void MoveToNext()
    {
        var next = _current.Next as BytesSegment;
        if (next == null)
            throw new Exception("Has no data to read");
        Reset(next);
    }

    #region ====IInputStream====

    public byte ReadByte()
    {
        if (CurrentRemaning <= 0) MoveToNext();

        return _current.Buffer[_pos++];
    }

    public void ReadBytes(Span<byte> dest)
    {
        while (true)
        {
            var left = CurrentRemaning;
            if (left > 0)
            {
                if (left >= dest.Length)
                {
                    _current.Buffer.AsSpan(_pos, dest.Length).CopyTo(dest);
                    _pos += dest.Length;
                }
                else
                {
                    _current.Buffer.AsSpan(_pos, left).CopyTo(dest);
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