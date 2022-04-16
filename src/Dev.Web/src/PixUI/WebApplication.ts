import * as PixUI from './';
import WebWindow from "./WebWindow";
import {initializeSystem} from "@/System/InitializeSystem";
import {initializeLinq} from "@/System/Linq";
import {P, match} from "ts-pattern";
import {FontCollection} from "@/PixUI/CanvasKit/FontCollection";
import {Cursor} from "./";
import {WebCursors} from "./WebCursor";

export class WebApplication extends PixUI.UIApplication {

    /** 初始化 & Polyfill*/
    public static Init() {
        initializeLinq();

        let win: any = window;
        win.match = match;
        win.when = P.when;

        win.clamp = function (v: number, min: number, max: number): number {
            return Math.min(Math.max(v, min), max)
        }

        initializeSystem();
    }

    public static Run(rootBuilder: () => PixUI.Widget) {
        //开始加载CanvasKit及默认字体
        let ckLoad = CanvasKitInit({
            locateFile: (file) => '/' + file,
        });
        let fontLoad = fetch('/MiSans-Regular.woff2').then(response => response.arrayBuffer());

        Promise.all([ckLoad, fontLoad]).then(([canvaskit, fontData]) => {
            let win: any = window;
            win.CanvasKit = canvaskit;
            let fontProvider = canvaskit.TypefaceFontProvider.Make();
            fontProvider.registerFont(fontData, FontCollection.DefaultFontFamily);
            FontCollection.Init(fontProvider);

            //初始化平台支持
            Cursor.PlatformCursors = new WebCursors();

            //创建WebApplication并执行
            let app = new WebApplication();
            PixUI.UIApplication.Current = app;
            app.RunInternal(rootBuilder());
        });
    }

    private RunInternal(rootWidget: PixUI.Widget) {
        //创建WebWindow
        let webWindow = new WebWindow(rootWidget);
        this.MainWindow = webWindow;
        //开始构建WidgetTree并首秀
        webWindow.OnFirstShow();
    }

    public PostInvalidateEvent(): void {
        requestAnimationFrame(() => {
            this.OnInvalidateRequest();
        });
    }
}
