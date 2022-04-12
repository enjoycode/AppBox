import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IDirtyArea {
    Merge(newArea: Nullable<IDirtyArea>): void;

    GetRect(): PixUI.Rect;

    ToChild(childX: number, childY: number): IDirtyArea;
}

/// <summary>
/// 重绘指定Rect的区域
/// </summary>
export class RepaintArea implements IDirtyArea {
    public readonly Rect: PixUI.Rect;

    public constructor(rect: PixUI.Rect) {
        this.Rect = rect;
    }

    public GetRect(): PixUI.Rect {
        return this.Rect;
    }

    public Merge(newArea: Nullable<IDirtyArea>) {
        //TODO:
    }

    public ToChild(childX: number, childY: number): IDirtyArea {
        let childRect = this.Rect;
        childRect.Offset(-childX, -childY);
        return new RepaintArea(childRect);
    }
}
