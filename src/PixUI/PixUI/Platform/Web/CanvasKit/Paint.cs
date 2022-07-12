#if __WEB__
using System;

namespace PixUI
{
    [TSType("CanvasKit.Paint")]
    public sealed class Paint : IDisposable
    {
        // public static Paint Shared(Color? color = null,PaintStyle style = PaintStyle.Fill,
        //     float strokeWidth = 1) => new Paint();

        [TSTemplate("new CanvasKit.Paint()")]
        public Paint() { }

        [TSPropertyToGetSet] public Color Color { get; set; }

        [TSPropertyToGetSet] public PaintStyle Style { get; set; }

        [TSPropertyToGetSet] public float StrokeWidth { get; set; }

        [TSPropertyToGetSet] public bool AntiAlias { get; set; }

        [TSPropertyToGetSet] public MaskFilter? MaskFilter { get; set; }

        [TSRename("delete")]
        public void Dispose() { }
    }
}
#endif