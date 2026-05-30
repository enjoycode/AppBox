using System.Buffers.Binary;

namespace AppBoxCore.Channel;

public sealed class BytesPipeWriter
{
    public BytesPipeWriter(Func<BytesWriter, Task> dataProvider)
    {
        _dataProvider = dataProvider;
        _writer = new BytesWriter(this);
    }

    private readonly BytesWriter _writer;
    private IChannel _channel = null!;
    private readonly Func<BytesWriter, Task> _dataProvider;

    /// <summary>
    /// Only called by Channel begin send bytes segment
    /// </summary>
    internal void StartWrite(IChannel channel, MessageType msgType, int msgId)
    {
        if (msgType != MessageType.UploadChunk && msgType != MessageType.DownloadChunk)
            throw new Exception("Only for upload or download chunks");

        _channel = channel;
        _writer.StartWrite(msgType, msgId);
        //开始写入数据
        _dataProvider(_writer).ContinueWith(task =>
        {
            if (task.IsFaulted)
            {
                //将当前消息块标为错误发送至接收端
                _writer.Complete(task.Exception);
                //TODO:通知Channel挂起的请求失败并移除
            }
            else
            {
                //将当前消息块标为完成并发送至接收端
                _writer.Complete();
            }
        });
    }

    private void SendSegment(BytesSegment segment) => _channel.SendPipeSegment(this, segment);

    internal void NotifySendError()
    {
        //TODO: 中止写入过程
    }

    /// <summary>
    /// 包装BytesSegmentWriter用于支持异步写
    /// </summary>
    public sealed class BytesWriter
    {
        internal BytesWriter(BytesPipeWriter owner)
        {
            _owner = owner;
        }

        private readonly BytesPipeWriter _owner;
        private SegmentWriter _segmentWriter;

        internal void StartWrite(MessageType msgType, int msgId)
        {
            _segmentWriter = new SegmentWriter(this, msgType, msgId);
        }

        //通知上级立即发送并归还缓存块 
        internal void SendSegment(BytesSegment segment) => _owner.SendSegment(segment);

        public void WriteByte(byte value) => _segmentWriter.WriteByte(value);

        public void WriteBytes(ReadOnlySpan<byte> src) => _segmentWriter.WriteBytes(src);

        public void WriteString(string? value) => _segmentWriter.WriteString(value);

        public void WriteVariant(int value) => _segmentWriter.WriteVariant(value);

        public async Task CopyFromAsync(Stream fromStream)
        {
            //TODO: 优化直接使用BytesSegment的缓冲块
            var buffer = new byte[2048];
            while (true)
            {
                var bytesRead = await fromStream.ReadAsync(buffer.AsMemory(0));
                if (bytesRead <= 0)
                    break;
                _segmentWriter.WriteBytes(buffer.AsSpan(0, bytesRead));
            }
        }

        /// <summary>
        /// 用于从流中分割对象(在消息头中标记)，以便于流式反序列化
        /// </summary>
        public void DivideObject() => _segmentWriter.DivideObject();

        internal void Complete(Exception? exception = null) => _segmentWriter.Complete(exception != null);
    }

    private struct SegmentWriter : IOutputStream
    {
        public SegmentWriter(BytesWriter owner, MessageType msgType, int msgId)
        {
            _owner = owner;
            _msgType = msgType;
            _msgId = msgId;
            _offset = 0;

            RentSegment();
        }

        private readonly BytesWriter _owner;
        private BytesSegment _current = null!;
        private readonly MessageType _msgType;
        private readonly int _msgId;
        private int _offset; //数据流的位置(不包括消息头)
        private int _pos; //当前缓存块写入位置(包括消息头)
        private SerializeContext? _context;

        public SerializeContext Context => _context ??= new SerializeContext();

        private void RentSegment()
        {
            _current = BytesSegment.Rent();
            //Write header 
            var buffer = _current.Buffer;
            buffer[0] = (byte)_msgType;
            BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(1, 4), _msgId);
            BinaryPrimitives.WriteInt32LittleEndian(buffer.AsSpan(PipeSegmentHeader.OffsetPosition, 4), _offset);
            buffer[PipeSegmentHeader.FlagPosition] = 0;
            _pos = PipeSegmentHeader.HeaderSize;
        }

        private void OnSegmentFull()
        {
            _offset += _current.Length - PipeSegmentHeader.HeaderSize;
            //通知上层当前消息块已写满
            _owner.SendSegment(_current);
            //重新租用一块
            RentSegment();
        }

        internal void DivideObject()
        {
            _offset += _pos - PipeSegmentHeader.HeaderSize;
            //设置分割标记及长度
            _current.Length = _pos;
            _current.SetAsDivided();
            //通知上层发送消息块
            _owner.SendSegment(_current);
            //重新租用一块
            RentSegment();
        }

        internal void Complete(bool withException = false)
        {
            _offset += _pos - PipeSegmentHeader.HeaderSize;
            //设置标记及长度
            _current.Length = _pos;
            if (withException)
            {
                _current.SetAsError();
            }
            else
            {
                _current.SetAsDivided();
                _current.SetAsLast();
            }

            //通知上层发送消息块
            _owner.SendSegment(_current);

            _current = null!;
        }

        #region ====IOutputStream====

        public void WriteByte(byte value)
        {
            if (_pos >= _current.Length)
                OnSegmentFull();

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
                        OnSegmentFull();
                        src = src.Slice(left);
                        continue;
                    }
                }
                else
                {
                    OnSegmentFull();
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
}

public sealed class PipeWriteStream : Stream
{
    public PipeWriteStream(BytesPipeWriter.BytesWriter writer)
    {
        _writer = writer;
    }

    private readonly BytesPipeWriter.BytesWriter _writer;

    public override void Flush() { }
    public override int Read(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
    public override void SetLength(long value) => throw new NotSupportedException();

    public override void Write(byte[] buffer, int offset, int count)
    {
        _writer.WriteBytes(buffer.AsSpan(offset, count));
        Position += count;
    }

    public override bool CanRead => false;
    public override bool CanSeek => false;
    public override bool CanWrite => true;
    public override long Length => throw new NotSupportedException();
    public override long Position { get; set; }
}