import * as PixUI from '@/PixUI'

export abstract class Tween<T> extends PixUI.Animatable<T> {
    protected readonly Begin: Nullable<T>;
    protected readonly End: Nullable<T>;

    public constructor(begin: Nullable<T> = null, end: Nullable<T> = null) {
        super();
        this.Begin = begin;
        this.End = end;
    }

    public abstract Lerp(t: number): T ;

    public Transform(t: number): T {
        if (t == 0.0) return this.Begin!;
        if (t == 1.0) return this.End!;
        return this.Lerp(t)!;
    }
}

export class FloatTween extends Tween<number> {
    public constructor(begin: number, end: number) {
        super(begin, end);
    }

    public Lerp(t: number): number {
        return <number><unknown>(this.Begin! + (this.End! - this.Begin!) * t);
    }

    public Init(props: Partial<FloatTween>): FloatTween {
        Object.assign(this, props);
        return this;
    }
}

export class ColorTween extends Tween<PixUI.Color> {
    public constructor(begin: PixUI.Color, end: PixUI.Color) {
        super(begin, end);
    }

    public Lerp(t: number): PixUI.Color {
        return PixUI.Color.Lerp(this.Begin, this.End, t)!;
    }
}

export class OffsetTween extends Tween<PixUI.Offset> {
    public constructor(begin: PixUI.Offset, end: PixUI.Offset) {
        super(begin, end);
    }

    public Lerp(t: number): PixUI.Offset {
        return PixUI.Offset.Lerp(this.Begin, this.End, t)!;
    }
}
