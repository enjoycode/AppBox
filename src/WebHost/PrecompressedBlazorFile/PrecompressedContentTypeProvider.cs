using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.StaticFiles;

namespace AppBoxWebHost;

internal sealed class PreCompressedContentTypeProvider : IContentTypeProvider
{
    private static readonly FileExtensionContentTypeProvider DefaultProvider = new();

    public bool TryGetContentType(string subpath, [MaybeNullWhen(false)] out string contentType)
    {
        if (subpath.EndsWith(".js.br") || subpath.EndsWith(".js.gz"))
        {
            contentType = "text/javascript";
            return true;
        }

        if (subpath.EndsWith(".wasm.br") || subpath.EndsWith(".wasm.gz"))
        {
            contentType = "application/wasm";
            return true;
        }

        if (subpath.EndsWith(".dat") || subpath.EndsWith(".dat.br") || subpath.EndsWith(".dat.gz"))
        {
            contentType = "application/octet-stream";
            return true;
        }

        if (subpath.EndsWith(".json.br") || subpath.EndsWith(".json.gz"))
        {
            contentType = "application/json";
            return true;
        }

        return DefaultProvider.TryGetContentType(subpath, out contentType);
    }
}