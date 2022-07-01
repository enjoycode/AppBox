using AppKit;
using CoreAnimation;
using Foundation;
using Metal;

namespace PixUI.Platform.Mac
{
    public sealed class MacMetalWindowContext : MetalWindowContext
    {
        private readonly NSView _mainView;

        public MacMetalWindowContext(NSView mainView, NativeWindow nativeWindow, DisplayParams displayParams) 
            : base(nativeWindow, displayParams)
        {
            _mainView = mainView;

            // any config code here (particularly for msaa)?
            InitializeContext();
        }

        public override void Resize(int width, int height)
        {
            var backingScaleFactor = NativeWindow.ScaleFactor;

            var backingSize = _mainView.Bounds.Size;
            backingSize.Width *= backingScaleFactor;
            backingSize.Height *= backingScaleFactor;

            MetalLayer!.DrawableSize = backingSize;
            MetalLayer.ContentsScale = backingScaleFactor;

            Width = (int)backingSize.Width;
            Height = (int)backingSize.Height;

            //Reset cached offscreen canvas
            OffscreenCanvas?.Dispose();
            OffscreenCanvas = null;
        }

        protected override bool OnInitializeContext()
        {
            MetalLayer = new CAMetalLayer();
            MetalLayer.Device = Device;
            MetalLayer.PixelFormat = MTLPixelFormat.BGRA8Unorm;

            // resize ignores the passed values and uses the fMainView directly.
            Resize(0, 0);

            var useVsync = !DisplayParams.DisableVsync;
            MetalLayer.DisplaySyncEnabled = useVsync; // TODO: need solution for 10.12 or lower
            MetalLayer.LayoutManager = CAConstraintLayoutManager.LayoutManager;
            MetalLayer.AutoresizingMask = CAAutoresizingMask.HeightSizable | CAAutoresizingMask.WidthSizable;
            MetalLayer.ContentsGravity = CALayer.GravityTopLeft;
            MetalLayer.MagnificationFilter = CALayer.FilterNearest;
            var cs = _mainView.Window.ColorSpace;
            MetalLayer.ColorSpace = cs.ColorSpace;

            _mainView.Layer = MetalLayer;
            _mainView.WantsLayer = true;

            return true;
        }

        protected internal override void OnDestroyContext()
        {
            _mainView.Layer = null;
            _mainView.WantsLayer = false;
        }
    }
}