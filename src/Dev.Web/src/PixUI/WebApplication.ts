import WebWindow from "./WebWindow";
import {FontCollection} from "@/PixUI/CanvasKit/FontCollection";
import {Cursor, Clipboard, Rx, UIApplication, Widget} from "./";
import {WebCursors} from "./WebCursor";
import {WebClipboard} from "./WebClipboard";

export class WebApplication extends UIApplication {

    public static Run(rootBuilder: () => Widget) {
        //开始加载CanvasKit及默认字体
        let ckLoad = CanvasKitInit({
            locateFile: (file) => '/' + file,
        });
        let fontLoad = fetch('/MiSans-Regular.woff2').then(response => response.arrayBuffer());

        Promise.all([ckLoad, fontLoad]).then(([canvaskit, fontData]) => {
            let win: any = window;
            win.CanvasKit = canvaskit;
            //初始化默认字体
            FontCollection.Init(fontData);

            //初始化平台支持
            Cursor.PlatformCursors = new WebCursors();
            Clipboard.Init(new WebClipboard());

            //创建WebApplication并执行
            let app = new WebApplication();
            UIApplication.Current = app;
            app.RunInternal(rootBuilder());
        });
    }

    private RunInternal(rootWidget: Widget) {
        //创建WebWindow
        let webWindow = new WebWindow(rootWidget);
        this.MainWindow = webWindow;
        //开始构建WidgetTree并首秀
        webWindow.OnFirstShow();
    }

    public PostInvalidateEvent(): void {
        requestAnimationFrame(() => {
            // try {
            this.OnInvalidateRequest();
            // } catch (error) {
            //     console.warn(error);
            // }
        });
    }
}
