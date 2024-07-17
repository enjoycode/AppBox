namespace AppBoxCore;

public sealed class MessageWriteStream : IOutputStream
{
    #region ====Static Pool====

    private static readonly ObjectPool<MessageWriteStream> Pool = new(() => new MessageWriteStream(), 16);

    public static MessageWriteStream Rent()
    {
        var res = Pool.Allocate();
        res._current = BytesSegment.Rent();
        return res;
    }

    public static void Return(MessageWriteStream mws)
    {
        mws._pos = 0;
        mws._context?.Clear();
        Pool.Free(mws);
    }

    #endregion

    private MessageWriteStream() { }

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

    public BytesSegment FinishWrite()
    {
        _current.Length = _pos;
        return _current.First!;
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
}