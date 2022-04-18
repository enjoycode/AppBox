import * as PixUI from './';
import {Canvas, Surface} from "canvaskit-wasm";
import {Keys} from "./";

export default class WebWindow extends PixUI.UIWindow {
    private readonly _widgetsCanvasEl: HTMLCanvasElement;
    private readonly _overlayCanvasEl: HTMLCanvasElement;
    private readonly _widgetsSurface: Surface;
    private readonly _overlaySurface: Surface;
    private readonly _widgetsCanvas: Canvas;
    private readonly _overlayCanvas: Canvas;

    private _input: HTMLInputElement | null;

    public constructor(rootWidget: PixUI.Widget) {
        super(rootWidget);

        //创建canvas dom
        this._widgetsCanvasEl = document.createElement("canvas");
        WebWindow.SetCanvasEl(this._widgetsCanvasEl, '1');

        this._overlayCanvasEl = document.createElement("canvas");
        WebWindow.SetCanvasEl(this._overlayCanvasEl, '2');

        document.body.appendChild(this._widgetsCanvasEl);
        document.body.appendChild(this._overlayCanvasEl);

        //创建canvas surface
        //this._widgetsSurface = CanvasKit.MakeCanvasSurface(this._widgetsCanvasEl)!;
        // http://webgl.brown37.net/appendices/webgl_context_options.html
        this._widgetsSurface = CanvasKit.MakeWebGLCanvasSurface(this._widgetsCanvasEl, undefined, {
            preserveDrawingBuffer: 1
        })!;
        this._widgetsCanvas = this._widgetsSurface.getCanvas();
        this._widgetsCanvas.scale(window.devicePixelRatio, window.devicePixelRatio);

        this._overlaySurface = CanvasKit.MakeWebGLCanvasSurface(this._overlayCanvasEl, undefined, {
            preserveDrawingBuffer: 0 //TODO:好像不起作用了
        });
        this._overlayCanvas = this._overlaySurface.getCanvas();
        this._overlayCanvas.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.BindWindowEvents();

        //创建隐藏的Input
        this.CreateInput();
    }

    private static SetCanvasEl(canvasEl: HTMLCanvasElement, zIndex: string) {
        canvasEl.style.position = "absolute";
        canvasEl.style.width = window.innerWidth + "px";
        canvasEl.style.height = window.innerHeight + "px";
        canvasEl.style.zIndex = zIndex;
        canvasEl.width = window.innerWidth * window.devicePixelRatio;
        canvasEl.height = window.innerHeight * window.devicePixelRatio;
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

        this._input = input;
    }

    GetOverlayCanvas(): Canvas {
        return this._overlayCanvas;
    }

    GetWidgetsCanvas(): Canvas {
        return this._widgetsCanvas;
    }

    get Height(): number {
        return window.innerHeight;
    }

    get Width(): number {
        return window.innerWidth;
    }

    Present(): void {
        this._widgetsSurface.flush();
        this._overlaySurface.flush();
    }

    private BindWindowEvents() {
        window.onresize = ev => {
            console.log(ev); //TODO:
        };
        window.onmousemove = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const buttons = WebWindow.ConvertToButtons(ev);
            this.OnPointerMove(PixUI.PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.offsetX, ev.offsetY));
        };
        window.onmousedown = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const buttons = WebWindow.ConvertToButtons(ev);
            this.OnPointerDown(PixUI.PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.offsetX, ev.offsetY));
        };
        window.onmouseup = ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const buttons = WebWindow.ConvertToButtons(ev);
            this.OnPointerUp(PixUI.PointerEvent.UseDefault(buttons, ev.x, ev.y, ev.offsetX, ev.offsetY));
        };
        window.onkeydown = ev => {
            // console.log(`KeyDown: '${ev.key}' keyCode=${ev.code}`)
            this.OnKeyDown(PixUI.KeyEvent.UseDefault(WebWindow.ConvertToKeys(ev)));
        };
        window.onkeyup = ev => {
            this.OnKeyUp(PixUI.KeyEvent.UseDefault(WebWindow.ConvertToKeys(ev)));
        };
    }

    StartTextInput() {
        setTimeout(() => {
            this._input.focus({preventScroll: true});
        }, 0);
    }

    StopTextInput() {
        this._input.blur();
        this._input.value = '';
    }

    private static ConvertToButtons(ev: MouseEvent): PixUI.PointerButtons {
        switch (ev.buttons) {
            case 1:
                return PixUI.PointerButtons.Left;
            case 2:
                return PixUI.PointerButtons.Right;
            case 3:
                return PixUI.PointerButtons.Middle;
            default:
                return PixUI.PointerButtons.None;
        }
    }

    private static ConvertToKeys(ev: KeyboardEvent): PixUI.Keys {
        let keys = PixUI.Keys.None;
        //TODO: others
        switch (ev.code) {
            case 'Backspace':
                keys = PixUI.Keys.Back;
                break;
            case 'Tab':
                keys = PixUI.Keys.Tab;
                break;
            case 'Enter':
                keys = PixUI.Keys.Return;
                break;
            case 'ArrowLeft':
                keys = PixUI.Keys.Left;
                break;
            case 'ArrowRight':
                keys = PixUI.Keys.Right;
                break;
            case 'ArrowUp':
                keys = PixUI.Keys.Up;
                break;
            case 'ArrowDown':
                keys = PixUI.Keys.Down;
                break;
        }

        if (ev.shiftKey) keys |= PixUI.Keys.Shift;
        if (ev.ctrlKey) keys |= PixUI.Keys.Control;
        if (ev.altKey) keys |= PixUI.Keys.Alt;

        return keys;
    }

}
