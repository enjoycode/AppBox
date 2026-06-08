namespace AppBoxCore;

public static class SequenceGuid
{
    private static int _seq = 0;

    static SequenceGuid()
    {
        int v = Random.Shared.Next();
        Interlocked.Exchange(ref _seq, v);
    }

    /// <summary>
    /// 获取顺序Guid，线程安全
    /// </summary>
    public static Guid New(int partitionHash = 0)
    {
        var ticks = DateTime.UtcNow.Ticks;
        var rng = Interlocked.Increment(ref _seq);

        return new Guid(partitionHash,
            (short)((ticks >> 48) & 0xFFFF),
            (short)((ticks >> 32) & 0xFFFF),
            (byte)((ticks >> 24) & 0xFF),
            (byte)((ticks >> 16) & 0xFF),
            (byte)((ticks >> 8) & 0xFF),
            (byte)(ticks & 0xFF),
            (byte)((rng >> 24) & 0xFF),
            (byte)((rng >> 16) & 0xFF),
            (byte)((rng >> 8) & 0xFF),
            (byte)(rng & 0xFF));
    }
}