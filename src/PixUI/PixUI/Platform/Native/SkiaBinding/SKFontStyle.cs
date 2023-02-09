#if !__WEB__
using System;

namespace PixUI
{
    public sealed class SKFontStyle : SKObject, ISKSkipObjectRegistration //TODO: remove this, CanvasKit not support
    {
        static SKFontStyle()
        {
            Normal = new SKFontStyle(SKFontStyleWeight.Normal, SKFontStyleWidth.Normal,
                FontSlant.Upright);
            Bold = new SKFontStyle(SKFontStyleWeight.Bold, SKFontStyleWidth.Normal,
                FontSlant.Upright);
            Italic = new SKFontStyle(SKFontStyleWeight.Normal, SKFontStyleWidth.Normal,
                FontSlant.Italic);
            BoldItalic = new SKFontStyle(SKFontStyleWeight.Bold, SKFontStyleWidth.Normal,
                FontSlant.Italic);
        }

        public static SKFontStyle Normal { get; }

        public static SKFontStyle Bold { get; }

        public static SKFontStyle Italic { get; }

        public static SKFontStyle BoldItalic { get; }

        internal static SKFontStyle? GetObject(IntPtr handle) =>
            handle == IntPtr.Zero ? null : new SKFontStyle(handle, true);

        internal SKFontStyle(IntPtr handle, bool owns)
            : base(handle, owns) { }

        public SKFontStyle()
            : this(SKFontStyleWeight.Normal, SKFontStyleWidth.Normal, FontSlant.Upright) { }

        public SKFontStyle(SKFontStyleWeight weight, SKFontStyleWidth width, FontSlant slant)
            : this((int)weight, (int)width, slant) { }

        public SKFontStyle(int weight, int width, FontSlant slant)
            : this(SkiaApi.sk_fontstyle_new(weight, width, slant), true) { }

        protected override void DisposeNative() => SkiaApi.sk_fontstyle_delete(Handle);

        public int Weight => SkiaApi.sk_fontstyle_get_weight(Handle);

        public int Width => SkiaApi.sk_fontstyle_get_width(Handle);

        public FontSlant Slant => SkiaApi.sk_fontstyle_get_slant(Handle);
    }
}
#endif