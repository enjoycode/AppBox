using System.Buffers;
using System.Buffers.Binary;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace AppBoxCore;

/// <summary>
/// 托管的字节缓存块
/// </summary>
public sealed class BytesSegment : ReadOnlySequenceSegment<byte>
{
    #region ====Static Pool====

    private static readonly ObjectPool<BytesSegment> Pools = new(() => new BytesSegment(), 256); //TODO: check count

    internal const int FrameSize = 256;

    /// <summary>
    /// 从缓存池租用一块
    /// </summary>
    public static BytesSegment Rent()
    {
        var f = Pools.Allocate();
        f.First = f;
        f.Next = null;
        f.Length = f.Buffer.Length;
        f.RunningIndex = 0;
        return f;
    }

    /// <summary>
    /// 仅归还一块
    /// </summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void ReturnOne(BytesSegment item)
    {
        item.First = null;
        item.Next = null;
        Pools.Free(item);
    }

    /// <summary>
    /// 归还整个链
    /// </summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void ReturnAll(BytesSegment item)
    {
        var current = item.First;
        while (current != null)
        {
            var next = current.Next;
            ReturnOne(current);
            current = next as BytesSegment;
        }
    }

    #endregion

    public const int BlobChunkHeaderSize = 9;

    private BytesSegment()
    {
        Buffer = new byte[FrameSize];
        Memory = Buffer.AsMemory();
        RunningIndex = 0;
    }

    public byte[] Buffer { get; }

    /// <summary>
    /// 实际数据长度(包括消息头)，不一定等于缓存块大小
    /// </summary>
    public int Length
    {
        get => Memory.Length;
        set
        {
            if (Memory.Length != value)
            {
                Memory = Buffer.AsMemory(0, value); //注意必须重设Memory
            }
        }
    }

    /// <summary>
    /// 链表的第一个缓存块
    /// </summary>
    public BytesSegment? First { get; private set; }

    /// <summary>
    /// 注意调用前必须先正确设置当前包的长度
    /// </summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Append(BytesSegment next)
    {
        Debug.Assert(Next == null);
        next.First = First;
        next.Next = null;
        next.RunningIndex = RunningIndex + Length;
        Next = next;
    }

    public void ReturnOne() => BytesSegment.ReturnOne(this);
    
}