using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PixUI.Platform.Win
{
    public sealed class WinApplication : UIApplication
    {
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

                WinApi.Win32TranslateMessage(ref msg);
                WinApi.Win32DispatchMessage(ref msg);
            }

            Console.WriteLine("Application exit.");
        }
        public override void BeginInvoke(Action action)
        {
            throw new NotImplementedException();
        }

        public override void PostInvalidateEvent()
        {
            //TODO:
            WinApi.Win32PostMessage(new IntPtr(0xFFFFFFFF), Msg.WM_PAINT, IntPtr.Zero, IntPtr.Zero);
        }
    }
}
