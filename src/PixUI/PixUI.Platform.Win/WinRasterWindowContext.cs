using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace PixUI.Platform.Win
{
    internal sealed class WinRasterWindowContext : NativeWindowContext
    {
        public WinRasterWindowContext(NativeWindow nativeWindow, DisplayParams displayParams)
            : base(nativeWindow, displayParams)
        {
            InitContext();
        }

        private IntPtr _onscreenSurfaceMem;
        private IntPtr _offscreenSufaceMem;
        private SKSurface _onscreenSurface;
        private SKSurface _offscreenSurface;
        private Canvas _onscreenCanvas;
        private Canvas _offscreenCanvas;

        public override bool IsGpuContext => false;

        private unsafe void InitContext()
        {
            //TODO: fix size, get window client rectangle
            Width = 911;
            Height = 666;

            // alloc surface memory
            var memSize = sizeof(BITMAPINFOHEADER) + Width * Height * sizeof(uint);
            _onscreenSurfaceMem = Marshal.AllocHGlobal(memSize);
            _offscreenSufaceMem = Marshal.AllocHGlobal(memSize);
            // create raster surface
            _onscreenSurface = CreateSurface(_onscreenSurfaceMem, Width, Height);
            _offscreenSurface = CreateSurface(_offscreenSufaceMem, Width, Height);
            _onscreenCanvas = _onscreenSurface.Canvas;
            _offscreenCanvas = _offscreenSurface.Canvas;
        }

        private unsafe SKSurface CreateSurface(IntPtr memPtr, int w, int h)
        {
            var bmpHeaderInfo = (BITMAPINFOHEADER*)memPtr.ToPointer();
            bmpHeaderInfo->biSize = (uint)sizeof(BITMAPINFOHEADER);
            bmpHeaderInfo->biWidth = w;
            bmpHeaderInfo->biHeight = -h; // negative means top-down bitmap. Skia draws top-down.
            bmpHeaderInfo->biPlanes = 1;
            bmpHeaderInfo->biBitCount = 32;
            bmpHeaderInfo->biCompression = 0 /*BI_RGB*/;
            void* pixels = (memPtr + sizeof(BITMAPINFOHEADER)).ToPointer();

            var skImgInfo = new SKImageInfo(w, h, SKColorType.Bgra8888, AlphaType.Premul);
            return SKSurface.Create(skImgInfo, new IntPtr(pixels), sizeof(uint) * w);
        }

        public override Canvas GetOffScreenCanvas() => _offscreenCanvas;

        public override Canvas GetOnScreenCanvas() => _onscreenCanvas;

        public override void Resize(int width, int height)
        {
            //TODO:
        }

        public unsafe override void SwapBuffers()
        {
            var hWnd = ((WinWindow)NativeWindow).HWND;
            void* bmiPtr = _onscreenSurfaceMem.ToPointer();
            void* bitsPtr = (_onscreenSurfaceMem + sizeof(BITMAPINFOHEADER)).ToPointer();
            var dc = WinApi.Win32GetDC(hWnd);
            //WinApi.Win32BitBlt(dc, 0, 0, Width, Height, new IntPtr(pixels), 0, 0, 0x00CC0020/*SRCCOPY*/);
            WinApi.Win32StretchDIBits(dc, 0, 0, Width, Height, 0, 0, Width, Height,
                bitsPtr, bmiPtr, 0 /*DIB_RGB_COLORS*/, 0x00CC0020/*SRCCOPY*/);
            WinApi.Win32ReleaseDC(hWnd, dc);
        }
    }
}
