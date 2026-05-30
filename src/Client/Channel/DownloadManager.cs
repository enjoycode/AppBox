using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using AppBoxCore.Channel;

namespace AppBoxClient;

internal sealed class DownloadManager
{
    private readonly Dictionary<int, BytesPipeReader> _pendingDownloads = new();

    public void MakePendingDownload(int msgId, BytesPipeReader reader)
    {
        _pendingDownloads.Add(msgId, reader);
    }

    public bool TryGetPending(int msgId, [MaybeNullWhen(returnValue: false)] out BytesPipeReader pending) =>
        _pendingDownloads.TryGetValue(msgId, out pending);

    public void RemovePending(int msgId) => _pendingDownloads.Remove(msgId);
}