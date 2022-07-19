using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace PixUI.Platform.Win
{
    public sealed class WinApplication : UIApplication
    {
        private static readonly Thread _uiThread = Thread.CurrentThread;
        private static readonly IntPtr _usrHWND = new IntPtr(0xFFFFFFFF);
        private static readonly IntPtr _invokeMsg = new IntPtr(1);
        private static readonly IntPtr _invalidateMsg = new IntPtr(2);

        public static void Run(Widget child)
        {
            // init platform supports
            //Cursor.PlatformCursors = new MacCursors();

            // create and run application
            var app = new WinApplication();
            Current = app;
            app.RunInternal(child);
        }

        private void RunInternal(Widget child)
        {
            // Init SynchronizationContext
            SynchronizationContext.SetSynchronizationContext(new WinSynchronizationContext());

            // init platform supports
            Cursor.PlatformCursors = new WinCursors();

            // Create root & native window
            var window = new WinWindow(child);
            // window.InitWindow();
            window.Attach(NativeWindow.BackendType.Raster);
            MainWindow = window;

            // Run EventLoop
            var quit = false;
            var msg = new MSG();
            while (!quit && WinApi.Win32GetMessage(ref msg, IntPtr.Zero, 0, 0))
            {
                Console.WriteLine($"EventLoop got msg: {msg.message}");
                if (msg.message == Msg.WM_QUIT)
                    quit = true;

                // process the events
                //if (msg.message == Msg.WM_PAINT)
                //    OnInvalidateRequest();

                // 自定义消息处理
                if (msg.hwnd == _usrHWND && msg.message == Msg.WM_USER)
                {
                    if (msg.wParam == _invokeMsg)
                    {
                        var gcHandle = GCHandle.FromIntPtr(msg.lParam);
                        var action = (Action)gcHandle.Target!;
                        gcHandle.Free();
                        action();
                    }
                    else if (msg.wParam == _invalidateMsg)
                    {
                        OnInvalidateRequest();
                    }
                }

                WinApi.Win32TranslateMessage(ref msg);
                WinApi.Win32DispatchMessage(ref msg);
            }

            Console.WriteLine("Application exit.");
        }

        public static bool InvokeRequired => Thread.CurrentThread != _uiThread;

        public override void BeginInvoke(Action action)
        {
            var gcHandle = GCHandle.Alloc(action);
            WinApi.Win32PostMessage(_usrHWND, Msg.WM_USER, _invokeMsg, GCHandle.ToIntPtr(gcHandle));
        }

        public override void PostInvalidateEvent()
        {
            //TODO:
            WinApi.Win32PostMessage(_usrHWND, Msg.WM_USER, _invalidateMsg, IntPtr.Zero);
        }
    }
}
