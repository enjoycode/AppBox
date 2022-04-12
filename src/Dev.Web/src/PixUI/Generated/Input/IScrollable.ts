import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IScrollable {
    get ScrollOffsetX(): number;


    get ScrollOffsetY(): number;

    OnScroll(dx: number, dy: number): void;
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

    public OnScroll(dx: number, dy: number) {
        //TODO:暂时不允许负值
        if (this.Direction == ScrollDirection.Both || this.Direction == ScrollDirection.Horizontal) {
            this.OffsetX = Math.max(0, this.OffsetX + dx);
        }

        if (this.Direction == ScrollDirection.Both || this.Direction == ScrollDirection.Vertical) {
            this.OffsetY = Math.max(0, this.OffsetY + dy);
        }
    }

    public Init(props: Partial<ScrollController>): ScrollController {
        Object.assign(this, props);
        return this;
    }
}
