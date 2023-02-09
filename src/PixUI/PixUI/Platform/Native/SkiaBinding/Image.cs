#if !__WEB__
using System;

namespace PixUI
{
    public sealed class Image : SKObject, ISKReferenceCounted
    {
        private Image(IntPtr x, bool owns) : base(x, owns) { }

        public int Width => SkiaApi.sk_image_get_width(Handle);

        public int Height => SkiaApi.sk_image_get_height(Handle);

        public AlphaType AlphaType => SkiaApi.sk_image_get_alpha_type(Handle);

        internal static Image? GetObject(IntPtr handle) =>
            GetOrAddObject(handle, (h, o) => new Image(h, o));

        public static Image? FromEncodedData(SKData data)
        {
            if (data == null)
                throw new ArgumentNullException(nameof(data));

            var handle = SkiaApi.sk_image_new_from_encoded(data.Handle);
            return GetObject(handle);
        }

        public static Image FromEncodedData(byte[] data)
        {
            if (data == null)
                throw new ArgumentNullException(nameof(data));
            if (data.Length == 0)
                throw new ArgumentException("The data buffer was empty.");

            using var skdata = SKData.CreateCopy(data);
            return FromEncodedData(skdata)!;
        }
    }
}
#endif