import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IDirtyArea {
    Merge(newArea: Nullable<IDirtyArea>): void;

    GetRect(): PixUI.Rect;

    IntersectsWith(child: PixUI.Widget): boolean;

    ToChild(child: PixUI.Widget): Nullable<IDirtyArea>;
}

export class RepaintArea implements IDirtyArea {
    private readonly _rect: PixUI.Rect;

    public constructor(rect: PixUI.Rect) {
        this._rect = (rect).Clone();
    }

    public GetRect(): PixUI.Rect {
        return this._rect;
    }

    public Merge(newArea: Nullable<IDirtyArea>) {
        //TODO:
    }

    public IntersectsWith(child: PixUI.Widget): boolean {
        return this._rect.IntersectsWith(child.X, child.Y, child.W, child.H);
    }

    public ToChild(child: PixUI.Widget): Nullable<IDirtyArea> {
        if (child.X == 0 && child.Y == 0) return this;

        let childRect = PixUI.Rect.FromLTWH(this._rect.Left - child.X, this._rect.Top - child.Y,
            this._rect.Width, this._rect.Height);
        return new RepaintArea((childRect).Clone());
    }

    toString(): string {
        return `RepaintArea[${this._rect}]`;
    }
}

export class RepaintChild implements IDirtyArea {
    private readonly _lastDirtyArea: Nullable<IDirtyArea>;
    private readonly _path: System.List<PixUI.Widget>;
    private _current: number = 0;

    public constructor(from: PixUI.Widget, to: PixUI.Widget, lastDirtyArea: Nullable<IDirtyArea>) {
        this._lastDirtyArea = lastDirtyArea;
        this._path = new System.List<PixUI.Widget>();
        let temp: PixUI.Widget = to;
        while (!(temp === from)) {
            this._path.Add(temp);
            temp = temp.Parent!;
        }
        this._current = this._path.length - 1;
    }

    public Merge(newArea: Nullable<IDirtyArea>) {
        throw new System.NotSupportedException();
    }

    public IntersectsWith(child: PixUI.Widget): boolean {
        if (this._current < 0) return false;
        let cur = this._path[this._current];
        return (cur === child);
    }

    public GetRect(): PixUI.Rect {
        let cur = this._path[this._current];
        return PixUI.Rect.FromLTWH(cur.X, cur.Y, cur.W, cur.H);
    }

    public ToChild(child: PixUI.Widget): Nullable<IDirtyArea> {
        //注意目前实现重用现有实例
        this._current--;
        if (this._current < 0)
            return this._lastDirtyArea;
        return this;
    }

    toString(): string {
        if (this._current < 0)
            return this._lastDirtyArea == null ? '' : this._lastDirtyArea.toString();

        let cur = this._path[this._current];
        return `RepaintChild[${cur}]`;
    }

}
