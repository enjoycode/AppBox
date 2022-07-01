#if __WEB__
using System;

namespace PixUI
{
    [TSType("CanvasKit.ParagraphBuilder")]
    public sealed class ParagraphBuilder : IDisposable
    {
        [TSCustomInterceptor("CanvasKitCtor")]
        public ParagraphBuilder(ParagraphStyle style) { }

        [TSRename("pushStyle")]
        public void PushStyle(TextStyle textStyle) { }

        [TSRename("addText")]
        public void AddText(string text) { }

        [TSRename("pop")]
        public void Pop() { }

        [TSRename("build")]
        public Paragraph Build()
        {
            throw new NotSupportedException();
        }

        [TSRename("delete")]
        public void Dispose() { }
    }
}
#endif