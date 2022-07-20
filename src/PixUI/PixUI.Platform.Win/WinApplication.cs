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
        private static readonly IntPtr _invokeMsg = new IntPtr(1);
        private static readonly IntPtr _invalidateMsg = new IntPtr(2);

        public static void Run(Widget child)
        {
            // Init SynchronizationContext
            SynchronizationContext.SetSynchronizationContext(new WinSynchronizationContext());
            // init platform supports
            Cursor.PlatformCursors = new WinCursors();

            // 测试加载字体
            //var fontStream = File.OpenRead("MiSans-Regular.ttf");
            //var fontData = SKData.Create(fontStream);
            //FontCollection.Instance.RegisterTypefaceToAsset(fontData, "MiSans", false);

            // create and run application
            var app = new WinApplication();
            Current = app;
            app.RunInternal(child);
        }

        private void RunInternal(Widget child)
        {
            // Create root & native window
            MainWindow = new WinWindow(child);
            // window.InitWindow();
            ((NativeWindow)MainWindow).Attach(NativeWindow.BackendType.Raster);
           
            // Run EventLoop
            var quit = false;
            var msg = new MSG();
            while (!quit && WinApi.Win32GetMessage(ref msg, IntPtr.Zero, 0, 0))
            {
                if (msg.message == Msg.WM_QUIT)
                    quit = true;

                // 自定义消息处理
                if (msg.message == Msg.WM_USER)
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
            //HWND_BROADCAST = 0xFFFF
            var win = (WinWindow)MainWindow;
            var gcHandle = GCHandle.Alloc(action);
            var ok = WinApi.Win32PostMessage(win.MSWindow, Msg.WM_USER, _invokeMsg, GCHandle.ToIntPtr(gcHandle));
            if (!ok)
            {
                gcHandle.Free();
                Console.WriteLine("Can't post message to event loop");
            }
        }

        public override void PostInvalidateEvent()
        {
            //TODO:
            var ok = WinApi.Win32PostMessage(IntPtr.Zero, Msg.WM_USER, _invalidateMsg, IntPtr.Zero);
            if (!ok)
                Console.WriteLine("Can't post message to event loop");
        }
    }
}
