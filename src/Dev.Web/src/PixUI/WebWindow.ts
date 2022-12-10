import * as PixUI from './';
import {Canvas, GrDirectContext, Surface} from "canvaskit-wasm";
import {ConvertToButtons, ConvertToKeys} from "./InputUtils";

export default class WebWindow extends PixUI.UIWindow {
    private _offscreenSurface: Surface;
    private _onscreenSurface: Surface;
    private _offscreenCanvas: Canvas;
    private _onscreenCanvas: Canvas;

    private readonly _webGLVersion: number = -1;
    private _forceNewContext = false;
    private _contextLost = false;
    private _glContext: number = 0;
    private _grContext: GrDirectContext | null = null;
    private _currentCanvasPhysicalWidth = 0;
    private _currentCanvasPhysicalHeight = 0;

    private _htmlCanvas: HTMLCanvasElement;
    private _htmlInput: HTMLInputElement | null;

    public constructor(rootWidget: PixUI.Widget) {
        super(rootWidget);

        this._webGLVersion = (typeof WebGL2RenderingContext !== 'undefined') ? 2 :
            ((typeof WebGLRenderingContext !== 'undefined') ? 1 : -1);

        this.CreateCanvas();
        this.CreateSurface();

        this.BindWindowEvents();

        //创建隐藏的Input
        this.CreateInput();
    }

    private CreateCanvas() {
        //TODO:考虑预先放大一些
        this._htmlCanvas = document.createElement("canvas");
        this._htmlCanvas.style.position = "absolute";
        this._htmlCanvas.style.zIndex = "1";
        this.UpdateCanvasSize();

        // this._htmlCanvas.setAttribute("aria-hidden", "true");
        // this._htmlCanvas.addEventListener("webglcontextlost", (e) => {
        //     console.warn("Canvas webglcontextlost")
        // });
        // this._htmlCanvas.addEventListener("webglcontextrestored", (e) => {
        //     console.warn("Canvas webglcontextrestored")
        // });

        this._forceNewContext = false;
        this._contextLost = false;

        if (this._webGLVersion != -1) {
            this._glContext = CanvasKit.GetWebGLContext(this._htmlCanvas, {
                antialias: 0,
                majorVersion: this._webGLVersion
            })

            if (this._glContext != 0) {
                this._grContext = CanvasKit.MakeGrContext(this._glContext);
                this._grContext.setResourceCacheLimitBytes(100 * 1024 * 1024);
            }
        }

        document.body.append(this._htmlCanvas);
    }

    private UpdateCanvasSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const ratio = window.devicePixelRatio;
        //set physical size
        this._htmlCanvas.width = width * ratio;
        this._htmlCanvas.height = height * ratio;
        //set logical size
        this._htmlCanvas.style.width = width + "px";
        this._htmlCanvas.style.height = height + "px";
    }

    private CreateSurface() {
        //清理旧的
        // https://github.com/flutter/flutter/issues/52485
        if (this._offscreenSurface != null) {
            this._offscreenSurface.dispose();
            this._onscreenSurface.dispose();

            this._offscreenCanvas = null;
            this._offscreenSurface = null;
            this._onscreenCanvas = null;
            this._onscreenSurface = null;

            // console.log(this._grContext.getResourceCacheUsageBytes() > this._grContext.getResourceCacheLimitBytes());
            //this._grContext.releaseResourcesAndAbandonContext();
            // console.log(this._grContext.getResourceCacheLimitBytes())
            // this._grContext.releaseResourcesAndAbandonContext();
            // this._grContext.delete();
            // this._grContext = null;

            // let ctx = this._htmlCanvas.getContext('webgl2');
            // let ext = ctx.getExtension("WEBGL_lose_context");
            // ext.loseContext();
            // CanvasKit.deleteContext(this._glContext);
            // this._glContext = 0;
        }

        const ratio = window.devicePixelRatio;
        const physicalWidth = this.Width * ratio;
        const physicalHeight = this.Height * ratio;

        this._offscreenSurface = CanvasKit.MakeRenderTarget(this._grContext, physicalWidth, physicalHeight);
        this._offscreenCanvas = this._offscreenSurface.getCanvas();
        this._offscreenCanvas.scale(ratio, ratio);

        this._onscreenSurface = CanvasKit.MakeOnScreenGLSurface(this._grContext, physicalWidth, physicalHeight, CanvasKit.ColorSpace.SRGB);
        this._onscreenCanvas = this._onscreenSurface.getCanvas();
    }

    private CreateInput() {
        let input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.width = input.style.height = input.style.padding = '0';
        input.type = 'text';
        input.style.border = 'none';
        input.style.zIndex = '3';

        document.body.appendChild(input);

        input.addEventListener('input', ev => {
            const inputEvent = ev as InputEvent;
            if (inputEvent.data && !inputEvent.isComposing) { //非IME输入
                this.OnTextInput(inputEvent.data);
            }
        });
        input.addEventListener('compositionend', ev => {
            // this._input.value = '';
            if (ev.data) { //IME输入
                this.OnTextInput(ev.data);
            }
        });

        this._htmlInput = input;
    }

    private BindWindowEvents() {
        window.onresize = ev => {
            console.log("Resize Window: ", this.Width, this.Height)

            this.UpdateCanvasSize();
            //TODO: *** reuse surface if can, or create larger surface
            this.CreateSurface();

            this.RootWidget.CachedAvailableWidth = this.Width;
            this.RootWidget.CachedAvailableHeight = this.Height;
            this.RootWidget.Invalidate(PixUI.InvalidAction.Relayout);
        };
        window.onmousemove = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const buttons = ConvertToButtons(ev);
            this.OnPointerMove(PixUI.PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.movementX, ev.movementY));
        };
        window.onmousedown = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const buttons = ConvertToButtons(ev);
            this.OnPointerDown(PixUI.PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.movementX, ev.movementY));
        };
        window.onmouseup = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const buttons = ConvertToButtons(ev);
            this.OnPointerUp(PixUI.PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.movementX, ev.movementY));
        };
        window.onmouseout = ev => {
            this.OnPointerMoveOutWindow();
        };
        window.oncontextmenu = ev => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        window.onkeydown = ev => {
            // console.log(`KeyDown: '${ev.key}' keyCode=${ev.code}`)
            this.OnKeyDown(PixUI.KeyEvent.UseDefault(ConvertToKeys(ev)));
            if (ev.code === 'Tab') {
                ev.preventDefault();
            }
        };
        window.onkeyup = ev => {
            this.OnKeyUp(PixUI.KeyEvent.UseDefault(ConvertToKeys(ev)));
            if (ev.code === 'Tab') {
                ev.preventDefault();
            }
        };
        
        window.onpopstate = (ev: PopStateEvent) => {
            console.log("location: " + document.location + ", state: " + JSON.stringify(ev.state));
            
            if (typeof ev.state === 'number')
            {
                this.RouteHistoryManager.Goto(ev.state);
            }
        };

        //注意onwheel事件附加在画布元素上
        this._htmlCanvas.onwheel = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            this.OnScroll(PixUI.ScrollEvent.Make(ev.x, ev.y, ev.deltaX, ev.deltaY));
        }
    }

    //region ====Overrides====

    GetOnscreenCanvas(): Canvas {
        return this._onscreenCanvas;
    }

    GetOffscreenCanvas(): Canvas {
        return this._offscreenCanvas;
    }

    get Height(): number {
        return window.innerHeight;
    }

    get Width(): number {
        return window.innerWidth;
    }

    get ScaleFactor(): number {
        return window.devicePixelRatio;
    }

    FlushOffscreenSurface() {
        this._offscreenSurface.flush();
    }

    DrawOffscreenSurface() {
        let snapshot = this._offscreenSurface.makeImageSnapshot();
        this._onscreenCanvas.drawImage(snapshot, 0, 0);
        snapshot.delete();
    }

    Present(): void {
        this._onscreenSurface.flush();
    }

    StartTextInput() {
        setTimeout(() => {
            this._htmlInput.focus({preventScroll: true});
        }, 0);
    }

    StopTextInput() {
        this._htmlInput.blur();
        this._htmlInput.value = '';
    }

    //endregion

}
