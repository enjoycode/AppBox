using System.Buffers.Binary;
using System.Runtime.CompilerServices;

namespace AppBoxCore.Channel;

internal static class PipeSegmentHeader
{
    // |--消息类弄--|--消息标识--|--偏移位置--|--分割或结束标记--|
    // |    1B     |   4B     |    4B     |     1B         |

    public const int HeaderSize = 10;
    public const int OffsetPosition = 5;
    public const int FlagPosition = 9;
    private const byte IsDividedMask = 1;
    private const byte IsLastMask = 1 << 1;
    private const byte IsErrorMask = 1 << 2;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static int GetOffset(this BytesSegment segment) =>
        BinaryPrimitives.ReadInt32LittleEndian(segment.Buffer.AsSpan(OffsetPosition, 4));

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static bool IsDivided(this BytesSegment segment) =>
        (segment.Buffer[FlagPosition] & IsDividedMask) == IsDividedMask;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void SetAsDivided(this BytesSegment segment) =>
        segment.Buffer[FlagPosition] |= IsDividedMask;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static bool IsLast(this BytesSegment segment) =>
        (segment.Buffer[FlagPosition] & IsLastMask) == IsLastMask;

    public static void SetAsLast(this BytesSegment segment) =>
        segment.Buffer[FlagPosition] |= IsLastMask;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static bool IsError(this BytesSegment segment) =>
        (segment.Buffer[FlagPosition] & IsErrorMask) == IsDividedMask;

    public static void SetAsError(this BytesSegment segment) =>
        segment.Buffer[FlagPosition] |= IsErrorMask;
}