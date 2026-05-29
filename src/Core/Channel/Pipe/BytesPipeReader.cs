using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace AppBoxCore.Channel;

public sealed class BytesPipeReader : IDisposable
{
    private readonly PooledTaskSource<bool> _waitingTaskSource = new();

    private int _waitingFlag = 1;
    private readonly Lock _pendingsLock = new();
    private readonly SortedList<int, BytesSegment> _pendings = new();
    private static readonly Exception PipeWriteError = new("Pipe write error"); //表示写入端发生异常

    public async IAsyncEnumerable<BytesSegment> GetSegmentsAsync()
    {
        var nextOffset = 0;
        while (true)
        {
            while (TryGetNextFromPendings(nextOffset, out var next))
            {
                nextOffset = next.GetOffset() + (next.Length - PipeSegmentHeader.HeaderSize);
                if (next.IsError()) throw PipeWriteError; //判断是否发送端表示写入异常的包
                var isLast = next.IsLast();
                yield return next;
                if (isLast) yield break;
            }

            if (Interlocked.CompareExchange(ref _waitingFlag, 1, 0) == 0)
                await _waitingTaskSource.WaitAsync().ConfigureAwait(false);
        }
    }

    public async IAsyncEnumerable<BytesSegment> GetObjectsAsync()
    {
        BytesSegment? current = null;
        await foreach (var segment in GetSegmentsAsync().ConfigureAwait(false))
        {
            current?.Append(segment);
            current = segment;

            var isDivided = segment.IsDivided();
            if (isDivided)
                yield return segment.First!;
        }
    }

    private bool TryGetNextFromPendings(int expectedOffset, [MaybeNullWhen(returnValue: false)] out BytesSegment next)
    {
        using (_pendingsLock.EnterScope())
        {
            return _pendings.Remove(expectedOffset, out next);
        }
    }

    /// <summary>
    /// Called by channel received a segment
    /// </summary>
    internal void OnReceiveSegment(BytesSegment segment)
    {
        Debug.Assert(segment.First == segment && segment.Next == null);

        //判断消息头长度
        if (segment.Length < PipeSegmentHeader.HeaderSize)
        {
            segment.ReturnOne();
            _waitingTaskSource.SetException(new Exception("Read segment is invalid"));
            //TODO: notify error to remove pending
            return;
        }

        //考虑进一步1.判断消息类型，消息标识是否有效, 2.判断当前状态，3.防止接收连续空包

        //加入挂起队列
        // Console.WriteLine(
        //     $"OnReceiveSegment: Offset={segment.GetOffset()} Thread={Environment.CurrentManagedThreadId}");
        using (_pendingsLock.EnterScope())
        {
            var segmentOffset = segment.GetOffset();
            if (_pendings.TryAdd(segmentOffset, segment)) //如果是空的结束包，offset会+1
            {
                //尝试通知读取队列
                if (Interlocked.CompareExchange(ref _waitingFlag, 0, 1) == 1)
                    _waitingTaskSource.SetResult(true);
            }
            else
            {
                segment.ReturnOne(); //无效数据包，考虑中止
                //TODO: log warn
            }
        }
    }

    public void Dispose()
    {
        using (_pendingsLock.EnterScope())
        {
            foreach (var segment in _pendings)
            {
                segment.Value.ReturnOne();
            }

            _pendings.Clear();
        }
    }
}