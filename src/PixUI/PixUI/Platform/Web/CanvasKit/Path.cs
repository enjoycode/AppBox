#if __WEB__
using System;

namespace PixUI
{
    [TSType("CanvasKit.Path")]
    public sealed class Path : IDisposable
    {
        [TSTemplate("new CanvasKit.Path()")]
        public Path() { }

        [TSRename("isEmpty")]
        public void IsEmpty() => false;

        [TSRename("addRect")]
        public void AddRect(Rect rect, bool isCCW = false) { }

        [TSRename("addRRect")]
        public void AddRRect(RRect rect, bool isCCW = false) { }

        [TSRename("moveTo")]
        public void MoveTo(float x, float y) { }

        [TSRename("lineTo")]
        public void LineTo(float x, float y) { }

        [TSRename("delete")]
        public void Dispose() { }
    }
}
#endif