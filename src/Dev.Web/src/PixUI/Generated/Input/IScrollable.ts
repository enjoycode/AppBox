import * as PixUI from '@/PixUI'

export interface IScrollable {
    get ScrollOffsetX(): number;


    get ScrollOffsetY(): number;


    OnScroll(dx: number, dy: number): PixUI.Offset;
}

export function IsInterfaceOfIScrollable(obj: any): obj is IScrollable {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_PixUI_IScrollable' in obj.constructor;
}

export enum ScrollDirection {
    Horizontal = 1,
    Vertical = 2,
    Both = ScrollDirection.Horizontal | ScrollDirection.Vertical
}

export class ScrollController {
    public readonly Direction: ScrollDirection;

    //TODO: ScrollPhysics & ScrollBehavior

    public OffsetX: number = 0;
    public OffsetY: number = 0;

    public constructor(direction: ScrollDirection) {
        this.Direction = direction;
    }

    public OnScroll(dx: number, dy: number, maxOffsetX: number, maxOffsetY: number): PixUI.Offset {
        let oldX = this.OffsetX;
        let oldY = this.OffsetY;

        //暂滚动不允许超出范围
        if (this.Direction == ScrollDirection.Both || this.Direction == ScrollDirection.Horizontal) {
            this.OffsetX = clamp(this.OffsetX + dx, 0, maxOffsetX);
        }

        if (this.Direction == ScrollDirection.Both || this.Direction == ScrollDirection.Vertical) {
            this.OffsetY = clamp(this.OffsetY + dy, 0, maxOffsetY);
        }

        return new PixUI.Offset(this.OffsetX - oldX, this.OffsetY - oldY);
    }

    public Init(props: Partial<ScrollController>): ScrollController {
        Object.assign(this, props);
        return this;
    }
}
