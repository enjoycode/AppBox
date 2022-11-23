export class ScrollEvent {
    private static readonly Default: ScrollEvent = new ScrollEvent();

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

    #Dx: number = 0;
    public get Dx() {
        return this.#Dx;
    }

    private set Dx(value) {
        this.#Dx = value;
    }

    #Dy: number = 0;
    public get Dy() {
        return this.#Dy;
    }

    private set Dy(value) {
        this.#Dy = value;
    }

    private constructor() {
    }

    public static Make(x: number, y: number, dx: number, dy: number): ScrollEvent {
        ScrollEvent.Default.X = x;
        ScrollEvent.Default.Y = y;
        ScrollEvent.Default.Dx = dx;
        ScrollEvent.Default.Dy = dy;
        return ScrollEvent.Default;
    }
}
