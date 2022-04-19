import * as System from '@/System'
import * as PixUI from '@/PixUI'

export enum PointerButtons {
    None = 0x00000000,
    Left = 0x00100000,
    Right = 0x00200000,
    Middle = 0x00400000,
    XButton1 = 0x00800000,
    XButton2 = 0x01000000
}

export class PointerEvent extends PixUI.PropagateEvent {
    private static readonly Default: PointerEvent = new PointerEvent();

    #Buttons: PointerButtons = 0;
    public get Buttons() {
        return this.#Buttons;
    }

    private set Buttons(value) {
        this.#Buttons = value;
    }

    #X: number = 0;
    public get X() {
        return this.#X;
    }

    private set X(value) {
        this.#X = value;
    }

    #Y: number = 0;
    public get Y() {
        return this.#Y;
    }

    private set Y(value) {
        this.#Y = value;
    }

    #DeltaX: number = 0;
    public get DeltaX() {
        return this.#DeltaX;
    }

    private set DeltaX(value) {
        this.#DeltaX = value;
    }

    #DeltaY: number = 0;
    public get DeltaY() {
        return this.#DeltaY;
    }

    private set DeltaY(value) {
        this.#DeltaY = value;
    }

    private constructor() {
        super();
    }

    public static UseDefault(buttons: PointerButtons, x: number, y: number, dx: number, dy: number): PointerEvent {
        PointerEvent.Default.Buttons = buttons;
        PointerEvent.Default.X = x;
        PointerEvent.Default.Y = y;
        PointerEvent.Default.DeltaX = dx;
        PointerEvent.Default.DeltaY = dy;
        PointerEvent.Default.ResetHandled();
        return PointerEvent.Default;
    }

    public SetPoint(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    public static RemovePerspectiveTransform(transform: PixUI.Matrix4): PixUI.Matrix4 {
        let vector = new PixUI.Vector4(0, 0, 1, 0);
        transform.SetColumn(2, (vector).Clone());
        transform.SetRow(2, (vector).Clone());
        return transform;
    }

    public Init(props: Partial<PointerEvent>): PointerEvent {
        Object.assign(this, props);
        return this;
    }
}
