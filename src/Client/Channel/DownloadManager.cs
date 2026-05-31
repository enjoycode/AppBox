using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using AppBoxCore.Channel;

namespace AppBoxClient;

internal sealed class DownloadManager
{
    private readonly Dictionary<int, PipeBytesReader> _pendingDownloads = new();

    public void MakePendingDownload(int msgId, PipeBytesReader reader)
    {
        _pendingDownloads.Add(msgId, reader);
    }

    public bool TryGetPending(int msgId, [MaybeNullWhen(returnValue: false)] out PipeBytesReader pending) =>
        _pendingDownloads.TryGetValue(msgId, out pending);

    public void RemovePending(int msgId) => _pendingDownloads.Remove(msgId);
}