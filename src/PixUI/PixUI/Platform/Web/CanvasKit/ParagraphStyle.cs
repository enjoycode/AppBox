#if __WEB__
using System;

namespace PixUI
{
    [TSType("CanvasKit.ParagraphStyle")]
    public sealed class ParagraphStyle : IDisposable
    {
        [TSCustomInterceptor("CanvasKitCtor")] public ParagraphStyle() {}

        [TSRename("maxLines")] public uint MaxLines;

        [TSRename("textStyle")] public TextStyle TextStyle;

        [TSRename("heightMultiplier")] public float Height;

        [TSMethodIgnore]
        public void Dispose() { }
    }
}
#endif