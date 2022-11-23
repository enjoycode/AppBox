import * as PixUI from '@/PixUI'
import * as System from '@/System'

export interface IClipper extends System.IDisposable {
    ApplyToCanvas(canvas: PixUI.Canvas): void;

    get IsEmpty(): boolean;


    Offset(dx: number, dy: number): void;

    GetPath(): PixUI.Path;

    GetRect(): PixUI.Rect;

    IntersectWith(to: IClipper): IClipper;
}

export class ClipperOfRect implements IClipper {
    public constructor(rect: PixUI.Rect, antiAlias: boolean = false) {
        this._area = (rect).Clone();
        this._antiAlias = antiAlias;
    }

    private _area: PixUI.Rect = PixUI.Rect.Empty.Clone();
    private readonly _antiAlias: boolean;

    public Dispose() {
    }

    public ApplyToCanvas(canvas: PixUI.Canvas) {
        canvas.clipRect(this._area, CanvasKit.ClipOp.Intersect, this._antiAlias);
    }

    public get IsEmpty(): boolean {
        return this._area.IsEmpty;
    }

    public Offset(dx: number, dy: number) {
        this._area.Offset(dx, dy);
    }

    public GetRect(): PixUI.Rect {
        return this._area;
    }

    public GetPath(): PixUI.Path {
        throw new System.NotSupportedException();
    }

    public IntersectWith(to: IClipper): IClipper {
        if (to instanceof ClipperOfRect) {
            this._area.IntersectTo(to.GetRect());
            return this;
        }
        if (to instanceof ClipperOfPath) {
            return to.IntersectWith(this);
        }

        throw new System.NotSupportedException();
    }
}

export class ClipperOfPath implements IClipper {
    public constructor(path: PixUI.Path, antiAlias: boolean = true) {
        this._area = path;
        this._antiAlias = antiAlias;
    }

    private readonly _area: PixUI.Path;
    private readonly _antiAlias: boolean;

    public Dispose() {
        this._area.delete();
    }

    public ApplyToCanvas(canvas: PixUI.Canvas) {
        canvas.clipPath(this._area, CanvasKit.ClipOp.Intersect, this._antiAlias);
    }

    public get IsEmpty(): boolean {
        return this._area.isEmpty();
    }

    public Offset(dx: number, dy: number) {
        this._area.offset(dx, dy);
    }

    public GetPath(): PixUI.Path {
        return this._area;
    }

    public GetRect(): PixUI.Rect {
        throw new System.NotSupportedException();
    }

    public IntersectWith(to: IClipper): IClipper {
        if (to instanceof ClipperOfRect) {
            let other = new CanvasKit.Path();
            other.addRect(to.GetRect());
            this._area.op(other, CanvasKit.PathOp.Intersect);
            other.delete();
            return this;
        }

        if (to instanceof ClipperOfPath) {
            this._area.op(to.GetPath(), CanvasKit.PathOp.Intersect);
            to.Dispose();
            return this;
        }

        throw new System.NotSupportedException();
    }
}
