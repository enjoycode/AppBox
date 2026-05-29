using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 用于包装BytesSegment链表为系统流，支持Seek
/// </summary>
internal sealed class BytesSegmentReadStream : Stream
{
    public BytesSegmentReadStream(BytesSegment current, int currentPos = 0, int headerSize = 0)
    {
        _start = current;
        _current = current;
        _startPos = currentPos;
        _currentPos = currentPos;
        _headerSize = headerSize;

        _length = current.Length - currentPos - headerSize;
        var temp = _start.Next as BytesSegment;
        while (temp != null)
        {
            _length += (temp.Length - headerSize);
            temp = temp.Next as BytesSegment;
        }
    }


    private BytesSegment _current;
    private int _currentPos;
    private int _position;
    private readonly BytesSegment _start;
    private readonly int _startPos;
    private readonly int _headerSize;
    private readonly int _length;

    private int CurrentRemaining => _current.Length - _currentPos;
    private bool HasRemaining => CurrentRemaining > 0 || _current.Next != null;

    private void MoveToNext()
    {
        var next = _current.Next as BytesSegment;
        if (next == null)
            throw new SerializationException(SerializationError.NothingToRead);
        _current = next;
        _currentPos = _headerSize;
    }

    public override void Flush() { }

    public override int Read(byte[] buffer, int offset, int count)
    {
        var bytesRead = 0;
        while (bytesRead < count)
        {
            if (!HasRemaining)
                break;

            var curLeft = CurrentRemaining;
            if (curLeft == 0)
            {
                MoveToNext();
                curLeft = CurrentRemaining;
            }

            var thisRead = Math.Min(curLeft, count - bytesRead);
            _current.Buffer.AsSpan(_startPos, thisRead).CopyTo(buffer.AsSpan(offset + bytesRead, thisRead));
            _currentPos += thisRead;
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

        Debug.Assert(_position >= 0);
        GotoPosition(_position);
        return _position;
    }

    private void GotoPosition(int pos)
    {
        // if (pos < 0 || pos >= _length)
        //     throw new ArgumentOutOfRangeException();
        if (_start.Length - _startPos >= pos)
        {
            _current = _start;
            _currentPos = _startPos + pos;
            return;
        }

        var cur = _start.Length - _startPos;
        var tempSeg = (BytesSegment)_start.Next!;
        while (cur < pos)
        {
            if (cur + tempSeg.Length - _headerSize >= pos)
            {
                _current = tempSeg;
                _currentPos = pos - cur + _headerSize;
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