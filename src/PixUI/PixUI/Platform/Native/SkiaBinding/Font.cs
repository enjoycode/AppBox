#if !__WEB__
using System;

namespace PixUI
{
    public sealed class Font : SKObject
    {
        private Font(IntPtr handle, bool owns) : base(handle, owns) { }

        public Font(SKTypeface typeface, float size, float scaleX = 1, float skewX = 0)
            : this(SkiaApi.sk_font_new_with_values(typeface.Handle, size, scaleX, skewX), true)
        {
            if (Handle == IntPtr.Zero)
                throw new InvalidOperationException("Unable to create a new Font instance.");
        }

        protected override void DisposeNative() => SkiaApi.sk_font_delete(Handle);

        public bool ForceAutoHinting
        {
            get => SkiaApi.sk_font_is_force_auto_hinting(Handle);
            set => SkiaApi.sk_font_set_force_auto_hinting(Handle, value);
        }

        public bool EmbeddedBitmaps
        {
            get => SkiaApi.sk_font_is_embedded_bitmaps(Handle);
            set => SkiaApi.sk_font_set_embedded_bitmaps(Handle, value);
        }

        public bool Subpixel
        {
            get => SkiaApi.sk_font_is_subpixel(Handle);
            set => SkiaApi.sk_font_set_subpixel(Handle, value);
        }

        public bool LinearMetrics
        {
            get => SkiaApi.sk_font_is_linear_metrics(Handle);
            set => SkiaApi.sk_font_set_linear_metrics(Handle, value);
        }

        public bool Embolden
        {
            get => SkiaApi.sk_font_is_embolden(Handle);
            set => SkiaApi.sk_font_set_embolden(Handle, value);
        }

        public bool BaselineSnap
        {
            get => SkiaApi.sk_font_is_baseline_snap(Handle);
            set => SkiaApi.sk_font_set_baseline_snap(Handle, value);
        }

        public SKFontEdging Edging
        {
            get => SkiaApi.sk_font_get_edging(Handle);
            set => SkiaApi.sk_font_set_edging(Handle, value);
        }

        public SKFontHinting Hinting
        {
            get => SkiaApi.sk_font_get_hinting(Handle);
            set => SkiaApi.sk_font_set_hinting(Handle, value);
        }

        public SKTypeface? Typeface
        {
            get => SKTypeface.GetObject(SkiaApi.sk_font_get_typeface(Handle));
            set => SkiaApi.sk_font_set_typeface(Handle, value?.Handle ?? IntPtr.Zero);
        }

        public float Size
        {
            get => SkiaApi.sk_font_get_size(Handle);
            set => SkiaApi.sk_font_set_size(Handle, value);
        }

        public float ScaleX
        {
            get => SkiaApi.sk_font_get_scale_x(Handle);
            set => SkiaApi.sk_font_set_scale_x(Handle, value);
        }

        public float SkewX
        {
            get => SkiaApi.sk_font_get_skew_x(Handle);
            set => SkiaApi.sk_font_set_skew_x(Handle, value);
        }

        public unsafe float Spacing => SkiaApi.sk_font_get_metrics(Handle, null);

        public ushort GetGlyphId(int codepoint) =>
            SkiaApi.sk_font_unichar_to_glyph(Handle, codepoint);
    }
}
#endif