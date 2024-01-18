using Microsoft.Net.Http.Headers;

namespace AppBoxWebHost;

public sealed class PrecompressedBlazorMiddleware
{
    private readonly RequestDelegate _next;

    public PrecompressedBlazorMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        var path = request.Path.Value;
        var extraExtension = string.Empty;
        var responseHeaders = context.Response.Headers;
        if (path != null && path.StartsWith("/_framework/", StringComparison.Ordinal))
        {
            responseHeaders[HeaderNames.Vary] = HeaderNames.AcceptEncoding;
            var acceptEncoding = request.Headers[HeaderNames.AcceptEncoding].ToString();
            if (acceptEncoding.Length > 64)
            {
                // Not happy parsing, this is far too long
                context.Response.StatusCode = StatusCodes.Status431RequestHeaderFieldsTooLarge;
                return Task.CompletedTask;
            }

            extraExtension = GetCompressionExtension(acceptEncoding);
        }

        if (extraExtension.Length > 0)
        {
            // Accept a compression type; so change path so 
            // StaticFiles picks up right file
            request.Path = path + extraExtension;

            // Note: Content-types still need to be set
            switch (extraExtension)
            {
                case ".br":
                    responseHeaders[HeaderNames.ContentEncoding] = "br";
                    break;
                case ".gz":
                    responseHeaders[HeaderNames.ContentEncoding] = "gzip";
                    break;
            }
        }

        return _next(context);
    }

    private static string GetCompressionExtension(ReadOnlySpan<char> acceptEncoding)
    {
        var extraExtension = string.Empty;
        foreach (var range in acceptEncoding.Split(','))
        {
            var encoding = acceptEncoding[range];
            // Check if is a Quality
            var qualityStart = encoding.IndexOf(';');
            if (qualityStart > 0)
            {
                // Remove Quality
                encoding = encoding[..qualityStart];
            }

            // Remove any additional spaces
            encoding = encoding.Trim(' ');

            if (encoding is "br")
            {
                // Brotli accepted, set the additional file extension
                extraExtension = ".br";
                // This is our preferred compression so exit the loop
                break;
            }

            if (encoding is "gzip")
            {
                // Gzip accepted, we'll set the extension, but keep looking
                extraExtension = ".gz";
            }
        }

        return extraExtension;
    }
}

public static class PrecompressedBlazorMiddlewareExtensions
{
    public static IApplicationBuilder UsePrecompressedPrecompressedBlazor(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<PrecompressedBlazorMiddleware>();
    }
}

// To enumerate AcceptEncoding in a non-allocating way
internal static class MemoryExtensions
{
    public static SpanSplitEnumerator<char> Split(this ReadOnlySpan<char> span, char separator) => new(span, separator);

    public ref struct SpanSplitEnumerator<T>
#nullable disable // to enable use with both T and T? for reference types due to IEquatable<T> being invariant
        where T : IEquatable<T>
#nullable restore
    {
        private readonly ReadOnlySpan<char> _span;
        private readonly char _separatorChar;
        private int _start;
        private bool _started;
        private bool _ended;
        private Range _current;

        public SpanSplitEnumerator<T> GetEnumerator() => this;

        public Range Current
        {
            get
            {
                if (!_started || _ended)
                {
                    Throw();
                }

                return _current;

                static void Throw()
                {
                    throw new InvalidOperationException();
                }
            }
        }

        internal SpanSplitEnumerator(ReadOnlySpan<char> span, char separator) : this()
        {
            _span = span;
            _separatorChar = separator;
        }

        public bool MoveNext()
        {
            _started = true;

            if (_start > _span.Length)
            {
                _ended = true;
                return false;
            }

            ReadOnlySpan<char> slice = _start == 0
                ? _span
                : _span.Slice(_start);

            int end = _start;
            if (slice.Length > 0)
            {
                int index = slice.IndexOf(_separatorChar);

                if (index == -1)
                {
                    index = slice.Length;
                }

                end += index;
            }

            _current = new Range(_start, end);
            _start = end + 1;

            return true;
        }
    }
}