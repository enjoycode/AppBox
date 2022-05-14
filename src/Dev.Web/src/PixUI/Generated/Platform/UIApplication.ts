import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class UIApplication {
    public MainWindow: PixUI.UIWindow; //目前仅支持单一Window

    static #Current: UIApplication;
    public static get Current() {
        return UIApplication.#Current;
    }

    protected static set Current(value) {
        UIApplication.#Current = value;
    }

    public abstract PostInvalidateEvent(): void;

    protected OnInvalidateRequest() {
        let window = this.MainWindow; //TODO:根据事件判断哪个UIWindow
        let widgetsCanvas = window.GetOffscreenCanvas();
        let overlayCanvas = window.GetOnscreenCanvas();

        let ctx = PaintContext.Default;
        ctx.Window = this.MainWindow;
        let beginTime = System.DateTime.UtcNow;

        //先绘制WidgetsCanvas
        if (!window.WidgetsInvalidQueue.IsEmpty) {
            ctx.Canvas = widgetsCanvas;
            window.WidgetsInvalidQueue.RenderFrame(ctx);
            window.FlushOffscreenSurface();
        }

        //再绘制OverlayCanvas
        if (!window.OverlayInvalidQueue.IsEmpty) {
            ctx.Canvas = overlayCanvas;
            window.OverlayInvalidQueue.RelayoutAll();
        }

        window.DrawOffscreenSurface();
        if (window.ScaleFactor != 1) {
            overlayCanvas.save();
            overlayCanvas.scale(window.ScaleFactor, window.ScaleFactor);
        }
        window.Overlay.Paint(overlayCanvas); //always repaint
        if (window.ScaleFactor != 1)
            overlayCanvas.restore();

        window.HasPostInvalidateEvent = false;

        let duration = System.DateTime.op_Subtraction(System.DateTime.UtcNow, beginTime);
        console.log(`Draw frame: ${duration.TotalMilliseconds}ms`);

        window.Present();
    }
}

export class PaintContext //TODO: remove this
{
    public static readonly Default: PaintContext = new PaintContext();

    private constructor() {
    }

    #Window!: PixUI.UIWindow;
    public get Window() {
        return this.#Window;
    }

    public set Window(value) {
        this.#Window = value;
    }

    #Canvas!: PixUI.Canvas;
    public get Canvas() {
        return this.#Canvas;
    }

    public set Canvas(value) {
        this.#Canvas = value;
    }

    public Init(props: Partial<PaintContext>): PaintContext {
        Object.assign(this, props);
        return this;
    }
}
