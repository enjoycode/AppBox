#if !__WEB__
namespace PixUI.Platform
{
    public struct DisplayParams
    {
        public readonly SKColorType ColorType;
        public readonly SKColorSpace? ColorSpace;
        public readonly int MSAASampleCount;
        public readonly SKSurfaceProperties SurfaceProps;
        public readonly bool DisableVsync;
        public readonly bool DelayDrawableAcquisition;
        public readonly bool EnableBinaryArchive;
        public GRContextOptions GrContextOptions;
    }
}
#endif