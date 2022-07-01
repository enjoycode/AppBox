#if __WEB__
using System;

namespace PixUI
{
    [TSType("CanvasKit.Path")]
    public sealed class Path : IDisposable
    {
        [TSTemplate("new CanvasKit.Path()")]
        public Path() {}
        
        [TSRename("addRect")]
        public void AddRect(Rect rect, bool isCCW = false) {}
        
        [TSRename("addRRect")]
        public void AddRRect(RRect rect, bool isCCW = false) { }

        [TSRename("delete")]
        public void Dispose() { }
    }
}
#endif