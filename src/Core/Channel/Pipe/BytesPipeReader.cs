using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace AppBoxCore.Channel;

public sealed class BytesPipeReader : IDisposable
{
    private readonly PooledTaskSource<int> _waitingTaskSource = new(false); //值为offset

    private int _waitingFlag; //默认没有等待
    private readonly Lock _pendingsLock = new();
    private readonly SortedList<int, BytesSegment> _pendings = new();
    private static readonly Exception PipeWriteError = new("Pipe write error"); //表示写入端发生异常

    public Action? OnReadFinished { get; set; } //所有数据读完后的操作,目前用于客户端下载完成通知挂起的请求

    public async IAsyncEnumerable<BytesSegment> GetSegmentsAsync()
    {
        var nextOffset = 0;
        // Console.WriteLine("<<<<开始读取队列");
        while (true)
        {
            while (TryGetNextFromPendings(nextOffset, out var next))
            {
                nextOffset = next.GetOffset() + (next.Length - PipeSegmentHeader.HeaderSize);
                if (next.IsError()) throw PipeWriteError; //判断是否发送端表示写入异常的包
                var isLast = next.IsLast();
                if (!next.IsEmpty()) //可能空的标记结束的包
                    yield return next;
                else
                    next.ReturnOne();

                if (isLast)
                {
                    OnReadFinished?.Invoke();
                    yield break;
                }
            }

            while (Interlocked.CompareExchange(ref _waitingFlag, 1, 0) == 0)
            {
                // Console.WriteLine($"<<<<[{Environment.CurrentManagedThreadId}]: 等待新块");
                var offset = await _waitingTaskSource.WaitAsync();
                if (offset == nextOffset) //如果等于期望的下一块，开始读取否则继续循环等待
                    break;
                // Console.WriteLine($"<<<<[{Environment.CurrentManagedThreadId}]: 收到新块");
            }
        }
    }

    private bool TryGetNextFromPendings(int expectedOffset, [MaybeNullWhen(returnValue: false)] out BytesSegment next)
    {
        using (_pendingsLock.EnterScope())
        {
            return _pendings.Remove(expectedOffset, out next);
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

    public async ValueTask CopyToStreamAsync(Stream toStream, CancellationToken ct = default)
    {
        await foreach (var segment in GetSegmentsAsync().WithCancellation(ct).ConfigureAwait(false))
        {
            await toStream
                .WriteAsync(segment.Memory[PipeSegmentHeader.HeaderSize..], ct)
                .ConfigureAwait(false);
        }
    }

    public async ValueTask CopyToFileAsync(string filePath)
    {
        await using var fileStream = File.OpenWrite(filePath);
        await CopyToStreamAsync(fileStream);
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
        // Console.WriteLine($">>>>[{Environment.CurrentManagedThreadId}]: Offset={segment.GetOffset()} Last={segment.IsLast()}");
        using (_pendingsLock.EnterScope())
        {
            var segmentOffset = segment.GetOffset();
            if (_pendings.TryAdd(segmentOffset, segment)) //如果是空的结束包，offset会+1
            {
                //尝试通知读取队列
                if (Interlocked.CompareExchange(ref _waitingFlag, 0, 1) == 1)
                {
                    // Console.WriteLine($">>>>[{Environment.CurrentManagedThreadId}]: 开始通知等待者");
                    _waitingTaskSource.SetResult(segmentOffset);
                    // Console.WriteLine($">>>>[{Environment.CurrentManagedThreadId}]: 结束通知等待者");
                }
            }
            else
            {
                segment.ReturnOne(); //无效数据包，考虑中止
                //TODO: log warn
            }
        }
    }

    /// <summary>
    /// Called by channel when it closed
    /// </summary>
    internal void OnChannelClosed()
    {
        //TODO:
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