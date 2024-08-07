using System.Buffers;
using System.IO.Pipelines;
using AppBoxCore;

namespace AppBoxWebHost;

internal static class PipeExtension
{
    public static async ValueTask<BytesSegment> CopyToAsync(this PipeReader pipeReader)
    {
        var writer = MessageWriteStream.Rent();
        while (true)
        {
            var res = await pipeReader.ReadAsync();
            if (res.IsCanceled)
            {
                MessageWriteStream.Return(writer);
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
        MessageWriteStream.Return(writer);
        return bytes;
    }
}

internal sealed class PipeOutput(PipeWriter pipeWriter) : IOutputStream
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
}