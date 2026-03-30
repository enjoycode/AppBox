using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;

namespace AppBoxClient;

internal sealed class DownloadManager
{
    private readonly Dictionary<int, Stream> _pendingDownloads = new();

    public void MakePendingDownload(int msgId, Stream stream)
    {
        _pendingDownloads.Add(msgId, stream);
    }

    public bool TryGetPending(int msgId, [MaybeNullWhen(returnValue: false)] out Stream pending) =>
        _pendingDownloads.TryGetValue(msgId, out pending);

    public void RemovePending(int msgId) => _pendingDownloads.Remove(msgId);
}