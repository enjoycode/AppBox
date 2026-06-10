using System.Diagnostics;
using System.Runtime.InteropServices;
using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public class SequenceGuidTest
{
    [Test]
    public void GenSequenceIdTest()
    {
        var gen = new MsSequenceGuid();
        var id1 = gen.Next();
        var id2 = gen.Next();
        Console.WriteLine(id1);
        Console.WriteLine(id2);
        Assert.IsTrue(id2 > id1);
    }

    [Test]
    public void SequenceIdTest()
    {
        var id1 = SequenceGuid.New();
        var id2 = SequenceGuid.New();
        Assert.IsTrue(id2 > id1);
    }

    private class MsSequenceGuid
    {
        private long _counter = DateTime.UtcNow.Ticks;

        public Guid Next()
        {
            Span<byte> guidBytes = stackalloc byte[16];
            var succeeded = Guid.NewGuid().TryWriteBytes(guidBytes);
            Debug.Assert(succeeded);
            var incrementedCounter = Interlocked.Increment(ref _counter);
            Span<byte> counterBytes = stackalloc byte[sizeof(long)];
            MemoryMarshal.Write(counterBytes, in incrementedCounter);

            if (!BitConverter.IsLittleEndian)
            {
                counterBytes.Reverse();
            }

            guidBytes[08] = counterBytes[1];
            guidBytes[09] = counterBytes[0];
            guidBytes[10] = counterBytes[7];
            guidBytes[11] = counterBytes[6];
            guidBytes[12] = counterBytes[5];
            guidBytes[13] = counterBytes[4];
            guidBytes[14] = counterBytes[3];
            guidBytes[15] = counterBytes[2];

            return new Guid(guidBytes);
        }
    }
}