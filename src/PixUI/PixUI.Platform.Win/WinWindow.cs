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

        private static bool _hasRegisterWinCls = false;

        public WinWindow(Widget child) : base(child)
        {
        }

        private void InitWindow()
        {
            var className = RegisterWindowClass();
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

        private static string RegisterWindowClass()
        {
            var className = $"PixUIApp";
            if (_hasRegisterWinCls) return className;
            _hasRegisterWinCls = true;

            var wndClass = new WNDCLASS();
            wndClass.style = 1 | 2 | 0x00000020;//classStyle;
            wndClass.lpfnWndProc = WndProc;
            wndClass.cbClsExtra = 0;
            wndClass.cbWndExtra = 0;
            wndClass.hbrBackground = (IntPtr)(GetSysColorIndex.COLOR_WINDOW + 1);
            wndClass.hCursor = WinApi.Win32LoadCursor(IntPtr.Zero, LoadCursorType.IDC_ARROW);
            wndClass.hIcon = IntPtr.Zero;
            wndClass.hInstance = IntPtr.Zero;
            wndClass.lpszClassName = className;
            wndClass.lpszMenuName = "";

            var result = WinApi.Win32RegisterClass(ref wndClass);
            if (!result)
                throw new Exception("Can't register window class");

            return className;
        }

        private static IntPtr WndProc(IntPtr hWnd, Msg msg, IntPtr wParam, IntPtr lParam)
        {
            var eventHandled = new IntPtr(0);

            var win = Current; //TODO:暂单窗体

            switch (msg)
            {
                case Msg.WM_CLOSE:
                    WinApi.Win32PostQuitMessage(0);
                    return eventHandled;
                case Msg.WM_MOUSEMOVE:
                    {
                        var xPos = lParam.ToInt32() & 0xFFFF;
                        var yPos = lParam.ToInt32() >> 16;
                        var buttons = GetButtonsFromWParam(wParam.ToInt64());
                        //Console.WriteLine($"MouseMove: pos=[{xPos}, {yPos}] btn={buttons}");
                        win.OnPointerMove(PointerEvent.UseDefault(buttons, xPos, yPos, 0, 0));
                        return eventHandled;
                    }
                case Msg.WM_NCMOUSEMOVE:
                    {
                        win.OnPointerMoveOutWindow();
                        return eventHandled;
                    }
                case Msg.WM_MOUSEWHEEL:
                    {
                        var xPos = lParam.ToInt32() & 0xFFFF;
                        var yPos = lParam.ToInt32() >> 16;
                        var delta = (short)(wParam.ToInt64() >> 16);
                        //Console.WriteLine($"MouseWheel: {delta}");
                        win.OnScroll(ScrollEvent.Make(xPos, yPos, 0, delta));
                        return eventHandled;
                    }
                case Msg.WM_MOUSEHWHEEL:
                    {
                        var xPos = lParam.ToInt32() & 0xFFFF;
                        var yPos = lParam.ToInt32() >> 16;
                        var delta = (short)(wParam.ToInt64() >> 16);
                        win.OnScroll(ScrollEvent.Make(xPos, yPos, delta, 0));
                        return eventHandled;
                    }
                default:
                    return WinApi.Win32DefWindowProc(hWnd, msg, wParam, lParam);
            }
        }

        private static PointerButtons GetButtonsFromWParam(long param)
        {
            PointerButtons buttons = PointerButtons.None;

            if ((param & 0x0001) != 0)
                buttons |= PointerButtons.Left;
            if ((param & 0x0010) != 0)
                buttons |= PointerButtons.Middle;
            if ((param & 0x0002) != 0)
                buttons |= PointerButtons.Right;

            return buttons;
        }
    }
}
