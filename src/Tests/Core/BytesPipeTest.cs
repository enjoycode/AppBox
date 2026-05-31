using AppBoxCore;
using AppBoxCore.Channel;
using NUnit.Framework;

namespace Tests.Core;

public class BytesPipeTest
{
    [Test]
    public async Task TestUpload()
    {
        var channel = new MockPipeChannel();
        var pipeWriter = new PipeBytesWriter(w =>
        {
            for (var i = 0; i < 100; i++)
            {
                w.WriteByte((byte)i);
                w.DivideObject();
            }

            return Task.CompletedTask;
        });
        var pipeReader = new PipeBytesReader();
        channel.Writer = pipeWriter;
        channel.Reader = pipeReader;

        pipeWriter.StartWrite(channel, MessageType.UploadChunk, 123);

        var expectedOffset = 0;
        await foreach (var segment in pipeReader.GetSegmentsAsync())
        {
            Assert.AreEqual(expectedOffset, segment.GetOffset());
            expectedOffset += (segment.Length - PipeSegmentHeader.HeaderSize);
            Console.WriteLine(
                $"Offset={segment.GetOffset()}, Length={segment.Length}, Divide={segment.IsDivided()}, Last={segment.IsLast()}, Thread={Environment.CurrentManagedThreadId}");
        }
    }
}

internal sealed class MockPipeChannel : IChannel
{
    public PipeBytesWriter Writer { get; set; } = null!;
    public PipeBytesReader Reader { get; set; } = null!;

    void IChannel.SendPipeSegment(PipeBytesWriter pipe, BytesSegment segment)
    {
        Task.Run(async () =>
        {
            var randomDelay = Random.Shared.Next(10, 100);
            await Task.Delay(randomDelay);
            //实际实现需要处理发送异常，有则通知中止
            Reader.OnReceiveSegment(segment);
        });
    }
}