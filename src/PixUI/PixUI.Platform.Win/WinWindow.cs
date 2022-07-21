using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace PixUI.Platform.Win
{
    public sealed class WinWindow : NativeWindow
    {
        internal IntPtr HWND { get; private set; }

        private static bool _hasRegisterWinCls = false;
        private static WndProcFunc _wndProc = new WndProcFunc(WndProc);

        public WinWindow(Widget child) : base(child)
        {
        }

        private void InitWindow()
        {
            var className = RegisterWindowClass();
            HWND = WinApi.Win32CreateWindow(WindowExStyles.WS_EX_APPWINDOW, className, "Demo",
                WindowStyles.WS_OVERLAPPED | WindowStyles.WS_CAPTION |
                WindowStyles.WS_SYSMENU | WindowStyles.WS_MINIMIZEBOX | WindowStyles.WS_MAXIMIZEBOX,
                50, 50, 911, 666, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero);
            if (HWND == IntPtr.Zero)
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
            WinApi.Win32ShowWindow(HWND, WindowPlacementFlags.SW_SHOWNORMAL);
            //WinApi.Win32UpdateWindow(HWND);
        }

        private static string RegisterWindowClass()
        {
            var className = $"PixUIApp";
            if (_hasRegisterWinCls) return className;
            _hasRegisterWinCls = true;

            var wndClass = new WNDCLASS();
            wndClass.style = 1 | 2 | 0x00000020;//classStyle;
            wndClass.lpfnWndProc = _wndProc;
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
            var eventHandled = IntPtr.Zero;
            var ps = new PAINTSTRUCT();

            var win = (WinWindow)Current; //TODO:暂单窗体
            if (hWnd != win.HWND)
                return WinApi.Win32DefWindowProc(hWnd, msg, wParam, lParam);

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
                        win.OnScroll(ScrollEvent.Make(xPos, yPos, 0, -delta));
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
                case Msg.WM_LBUTTONDOWN:
                case Msg.WM_RBUTTONDOWN:
                    {
                        var xPos = lParam.ToInt32() & 0xFFFF;
                        var yPos = lParam.ToInt32() >> 16;
                        win.OnPointerDown(PointerEvent.UseDefault(GetButtonsFromWParam(wParam.ToInt64()), xPos, yPos, 0, 0));
                        return eventHandled;
                    }
                case Msg.WM_LBUTTONUP:
                case Msg.WM_RBUTTONUP:
                    {
                        var xPos = lParam.ToInt32() & 0xFFFF;
                        var yPos = lParam.ToInt32() >> 16;
                        win.OnPointerUp(PointerEvent.UseDefault(GetButtonsFromWParam(wParam.ToInt64()), xPos, yPos, 0, 0));
                        return eventHandled;
                    }
                case Msg.WM_SETCURSOR:
                    if ((lParam.ToInt32() & 0xFFFF) != 1 /*HTCLIENT*/)
                        return WinApi.Win32DefWindowProc(hWnd, msg, wParam, lParam);
                    return eventHandled;
                case Msg.WM_PAINT:
                    //Console.WriteLine($"Got WM_PAINT {DateTime.Now}");
                    WinApi.Win32BeginPaint(win.HWND, ref ps);
                    WinApi.Win32EndPaint(win.HWND, ref ps);
                    return eventHandled;
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
