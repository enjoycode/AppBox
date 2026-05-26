using System.Buffers;
using System.IO.Pipelines;
using AppBoxCore;

namespace AppBoxWebHost;

internal static class PipeExtension
{
    public static async ValueTask<BytesSegment> CopyToAsync(this PipeReader pipeReader)
    {
        var writer = new MessageWriteStream();
        while (true)
        {
            var res = await pipeReader.ReadAsync();
            if (res.IsCanceled)
            {
                writer.FreeBuffer();
                throw new OperationCanceledException();
            }

            var buffer = res.Buffer;
            if (!buffer.IsEmpty)
            {
                foreach (var seg in buffer)
                {
                    writer.WriteBytes(seg.Span);
                }
            }

            if (res.IsCompleted)
            {
                pipeReader.AdvanceTo(buffer.End);
                break;
            }

            pipeReader.AdvanceTo(buffer.Start, buffer.End);
        }

        // await pipeReader.CompleteAsync();
        var bytes = writer.FinishWrite();
        return bytes;
    }
}

internal struct PipeOutput(PipeWriter pipeWriter) : IOutputStream
{
    public SerializeContext Context { get; } = new();

    public unsafe void WriteByte(byte value)
    {
        pipeWriter.Write(new ReadOnlySpan<byte>(&value, 1));
    }

    public void WriteBytes(ReadOnlySpan<byte> src)
    {
        pipeWriter.Write(src);
    }

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