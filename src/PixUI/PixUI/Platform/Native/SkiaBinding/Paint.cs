#if !__WEB__
using System;

namespace PixUI
{
    public enum SKPaintHinting
    {
        NoHinting = 0,
        Slight = 1,
        Normal = 2,
        Full = 3,
    }

    public unsafe class Paint : SKObject, ISKSkipObjectRegistration
    {
        // private SKFont font;
        // private bool lcdRenderText;

        private Paint(IntPtr handle, bool owns) : base(handle, owns) { }

        public Paint() : this(SkiaApi.sk_compatpaint_new(), true)
        {
            if (Handle == IntPtr.Zero)
            {
                throw new InvalidOperationException("Unable to create a new Paint instance.");
            }
        }

        protected override void DisposeNative() => SkiaApi.sk_compatpaint_delete(Handle);

        internal static Paint? GetObject(IntPtr handle) =>
            handle == IntPtr.Zero ? null : new Paint(handle, true);

        #region ====Properties====

        public bool AntiAlias
        {
            get => SkiaApi.sk_paint_is_antialias(Handle);
            set
            {
                SkiaApi.sk_paint_set_antialias(Handle, value);
                // UpdateFontEdging (value);
            }
        }

        public bool IsStroke
        {
            get => Style != PaintStyle.Fill;
            set => Style = value ? PaintStyle.Stroke : PaintStyle.Fill;
        }

        public PaintStyle Style
        {
            get => SkiaApi.sk_paint_get_style(Handle);
            set => SkiaApi.sk_paint_set_style(Handle, value);
        }

        public Color Color
        {
            get => SkiaApi.sk_paint_get_color(Handle);
            set => SkiaApi.sk_paint_set_color(Handle, (uint)value);
        }

        public float StrokeWidth
        {
            get => SkiaApi.sk_paint_get_stroke_width(Handle);
            set => SkiaApi.sk_paint_set_stroke_width(Handle, value);
        }

        public BlendMode BlendMode
        {
            get => SkiaApi.sk_paint_get_blendmode(Handle);
            set => SkiaApi.sk_paint_set_blendmode(Handle, value);
        }

        #endregion

        // private void UpdateFontEdging (bool antialias)
        // {
        //     var edging = SKFontEdging.Alias;
        //     if (antialias) {
        //         edging = lcdRenderText
        //             ? SKFontEdging.SubpixelAntialias
        //             : SKFontEdging.Antialias;
        //     }
        //     GetFont ().Edging = edging;
        // }
    }
}
#endif