using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PixUI.Platform.Win
{
    public sealed class WinWindow : NativeWindow
    {
        internal IntPtr MSWindow { get; private set; }

        public WinWindow(Widget child) : base(child)
        {
        }

        private void InitWindow()
        {
            var className = WinApi.RegisterWindowClass(0);
            MSWindow = WinApi.Win32CreateWindow(WindowExStyles.WS_EX_APPWINDOW, className, "Demo",
                WindowStyles.WS_OVERLAPPED | WindowStyles.WS_CAPTION |
                WindowStyles.WS_SYSMENU | WindowStyles.WS_MINIMIZEBOX | WindowStyles.WS_MAXIMIZEBOX,
                50, 50, 911, 666, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero);
            if (MSWindow == IntPtr.Zero)
                throw new Exception("Can't create native window");
        }

        public override bool Attach(BackendType backendType)
        {
            InitWindow();

            WindowContext = new WinRasterWindowContext(this, new DisplayParams());
            OnBackendCreated();

            return true;
        }

        protected override void Show()
        {
            WinApi.Win32ShowWindow(MSWindow, WindowPlacementFlags.SW_SHOWNORMAL);
        }
    }
}
