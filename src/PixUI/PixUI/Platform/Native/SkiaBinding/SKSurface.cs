#if !__WEB__
using System;

namespace PixUI
{
    public unsafe class SKSurface : SKObject, ISKReferenceCounted, ISKSkipObjectRegistration
    {
        internal SKSurface(IntPtr h, bool owns) : base(h, owns)
        {
        }

        internal static SKSurface? GetObject(IntPtr handle) =>
            handle == IntPtr.Zero ? null : new SKSurface(handle, true);

        public Canvas Canvas =>
            OwnedBy(Canvas.GetObject(this, SkiaApi.sk_surface_get_canvas(Handle), false, unrefExisting: false), this);

        #region ====Static Create====

        // RASTER DIRECT surface

        public static SKSurface Create(SKImageInfo info, IntPtr pixels, int rowBytes)
        {
            var cinfo = SKImageInfoNative.FromManaged(ref info);
            return GetObject(SkiaApi.sk_surface_new_raster_direct(&cinfo, (void*)pixels, (IntPtr)rowBytes, 
                null, null, IntPtr.Zero))!;
        }


        // ----GPU BACKEND RENDER TARGET surface----

        public static SKSurface? Create(GRRecordingContext context, GRBackendRenderTarget renderTarget,
            GRSurfaceOrigin origin, SKColorType colorType,
            SKColorSpace? colorspace, SKSurfaceProperties? props)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));
            if (renderTarget == null)
                throw new ArgumentNullException(nameof(renderTarget));

            return GetObject(SkiaApi.sk_surface_new_backend_render_target(context.Handle, renderTarget.Handle,
                origin, colorType.ToNative(), colorspace?.Handle ?? IntPtr.Zero, props?.Handle ?? IntPtr.Zero));
        }

        // ----GPU NEW surface----
        public static SKSurface? Create(GRRecordingContext context, bool budgeted, SKImageInfo info) =>
            Create(context, budgeted, info, 0, GRSurfaceOrigin.TopLeft, null, false);

        public static SKSurface? Create(GRRecordingContext context, bool budgeted, SKImageInfo info,
            int sampleCount, GRSurfaceOrigin origin, SKSurfaceProperties? props, bool shouldCreateWithMips)
        {
            var cinfo = SKImageInfoNative.FromManaged(ref info);
            return GetObject(SkiaApi.sk_surface_new_render_target(context.Handle, budgeted, &cinfo, sampleCount, origin,
                props?.Handle ?? IntPtr.Zero, shouldCreateWithMips));
        }

        #endregion

        public void Draw(Canvas canvas, float x, float y, Paint? paint)
            => SkiaApi.sk_surface_draw(Handle, canvas.Handle, x, y, paint?.Handle ?? IntPtr.Zero);

        public void Flush() => Flush(true);

        public void Flush(bool submit, bool synchronous = false)
        {
            if (submit)
                SkiaApi.sk_surface_flush_and_submit(Handle, synchronous);
            else
                SkiaApi.sk_surface_flush(Handle);
        }
    }
}
#endif