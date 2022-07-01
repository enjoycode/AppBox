using System;

#if !__WEB__
namespace PixUI
{
    public enum SKColorType
    {
        Unknown = 0,
        Alpha8 = 1,
        Rgb565 = 2,
        Argb4444 = 3,
        Rgba8888 = 4,
        Rgb888x = 5,
        Bgra8888 = 6,
        Rgba1010102 = 7,
        Rgb101010x = 8,
        Gray8 = 9,
        RgbaF16 = 10,
        RgbaF16Clamped = 11,
        RgbaF32 = 12,
        Rg88 = 13,
        AlphaF16 = 14,
        RgF16 = 15,
        Alpha16 = 16,
        Rg1616 = 17,
        Rgba16161616 = 18,
        Bgra1010102 = 19,
        Bgr101010x = 20,
    }

    public enum SKFontStyleWeight
    {
        Invisible = 0,
        Thin = 100,
        ExtraLight = 200,
        Light = 300,
        Normal = 400,
        Medium = 500,
        SemiBold = 600,
        Bold = 700,
        ExtraBold = 800,
        Black = 900,
        ExtraBlack = 1000,
    }

    public enum SKFontStyleWidth
    {
        UltraCondensed = 1,
        ExtraCondensed = 2,
        Condensed = 3,
        SemiCondensed = 4,
        Normal = 5,
        SemiExpanded = 6,
        Expanded = 7,
        ExtraExpanded = 8,
        UltraExpanded = 9,
    }

    public static partial class SkiaExtensions
    {
        // SkImageInfo.cpp - SkColorTypeBytesPerPixel
        public static int GetBytesPerPixel(this SKColorType colorType) =>
            colorType switch
            {
                // 0
                SKColorType.Unknown => 0,
                // 1
                SKColorType.Alpha8 => 1,
                SKColorType.Gray8 => 1,
                // 2
                SKColorType.Rgb565 => 2,
                SKColorType.Argb4444 => 2,
                SKColorType.Rg88 => 2,
                SKColorType.Alpha16 => 2,
                SKColorType.AlphaF16 => 2,
                // 4
                SKColorType.Bgra8888 => 4,
                SKColorType.Bgra1010102 => 4,
                SKColorType.Bgr101010x => 4,
                SKColorType.Rgba8888 => 4,
                SKColorType.Rgb888x => 4,
                SKColorType.Rgba1010102 => 4,
                SKColorType.Rgb101010x => 4,
                SKColorType.Rg1616 => 4,
                SKColorType.RgF16 => 4,
                // 8
                SKColorType.RgbaF16Clamped => 8,
                SKColorType.RgbaF16 => 8,
                SKColorType.Rgba16161616 => 8,
                // 16
                SKColorType.RgbaF32 => 16,
                //
                _ => throw new ArgumentOutOfRangeException(nameof(colorType)),
            };
    }
}
#endif