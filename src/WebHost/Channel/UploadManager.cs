using System.Diagnostics.CodeAnalysis;
using System.Threading.Channels;
using AppBoxCore;

namespace AppBoxWebHost;

internal sealed class PendingUpload
{
    public PendingUpload()
    {
        Channel = System.Threading.Channels.Channel.CreateBounded<IBlobChunk>(new BoundedChannelOptions(3)
        {
            SingleWriter = true,
            FullMode = BoundedChannelFullMode.Wait,
        });
    }

    public Channel<IBlobChunk> Channel { get; }
}

internal struct UploadArgs : IAnyArgs
{
    internal UploadArgs(IAsyncEnumerable<IBlobChunk> firstArg, IInputStream inputStream)
    {
        _firstArg = firstArg;
        _streamArgs = new StreamArgs(inputStream);
        _hasReadFirstArg = false;
    }

    private readonly StreamArgs _streamArgs;
    private readonly IAsyncEnumerable<IBlobChunk> _firstArg;
    private bool _hasReadFirstArg;

    public void SetEntityFactories(EntityFactory[] factories) => _streamArgs.SetEntityFactories(factories);

    public void Free() => _streamArgs.Free();

    public void SerializeTo(IOutputStream stream) => throw new NotImplementedException();

    public bool? GetBool() => _hasReadFirstArg ? _streamArgs.GetBool() : throw new InvalidCastException();
    public short? GetShort() => _hasReadFirstArg ? _streamArgs.GetShort() : throw new InvalidCastException();
    public int? GetInt() => _hasReadFirstArg ? _streamArgs.GetInt() : throw new InvalidCastException();
    public long? GetLong() => _hasReadFirstArg ? _streamArgs.GetLong() : throw new InvalidCastException();
    public float? GetFloat() => _hasReadFirstArg ? _streamArgs.GetFloat() : throw new InvalidCastException();
    public double? GetDouble() => _hasReadFirstArg ? _streamArgs.GetDouble() : throw new InvalidCastException();
    public decimal? GetDecimal() => _hasReadFirstArg ? _streamArgs.GetDecimal() : throw new InvalidCastException();
    public DateTime? GetDateTime() => _hasReadFirstArg ? _streamArgs.GetDateTime() : throw new InvalidCastException();
    public Guid? GetGuid() => _hasReadFirstArg ? _streamArgs.GetGuid() : throw new InvalidCastException();
    public string? GetString() => _hasReadFirstArg ? _streamArgs.GetString() : throw new InvalidCastException();

    public T? GetEnum<T>() where T : struct, Enum =>
        _hasReadFirstArg ? _streamArgs.GetEnum<T>() : throw new InvalidCastException();

    public object? GetObject()
    {
        if (!_hasReadFirstArg)
        {
            _hasReadFirstArg = true;
            return _firstArg;
        }

        return _streamArgs.GetObject();
    }

    public T[]? GetArray<T>() => _hasReadFirstArg ? _streamArgs.GetArray<T>() : throw new InvalidCastException();

    public IList<T>? GetList<T>() => _hasReadFirstArg ? _streamArgs.GetList<T>() : throw new InvalidCastException();
}

/// <summary>
/// 管理客户端的上传
/// </summary>
internal sealed class UploadManager
{
    private readonly Dictionary<int, PendingUpload> _pendingUploads = new();

    public PendingUpload MakePendingUpload(int msgId)
    {
        var pending = new PendingUpload();
        _pendingUploads.Add(msgId, pending);
        return pending;
    }

    public bool TryGetPending(int msgId, [MaybeNullWhen(returnValue: false)] out PendingUpload pending) =>
        _pendingUploads.TryGetValue(msgId, out pending);

    public void RemovePending(int msgId) => _pendingUploads.Remove(msgId);

    public void OnClosed()
    {
        foreach (var pending in _pendingUploads.Values)
        {
            pending.Channel.Writer.Complete(new Exception("Channel is closed"));
            //free pending buffer
            while (pending.Channel.Reader.TryRead(out var chunk))
                chunk.Free();
        }

        _pendingUploads.Clear();
    }
}