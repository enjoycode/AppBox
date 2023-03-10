import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class RectangleHoverArea extends LiveChartsCore.HoverArea {
    public constructor() {
        super();
    }

    // /// <summary>
    // /// Initializes a new instance of the <see cref="RectangleHoverArea"/> class.
    // /// </summary>
    // /// <param name="x">The x.</param>
    // /// <param name="y">The y.</param>
    // /// <param name="width">The width.</param>
    // /// <param name="height">The height.</param>
    // public RectangleHoverArea(float x, float y, float width, float height)
    // {
    //     X = x;
    //     Y = y;
    //     Width = width;
    //     Height = height;
    // }

    public X: number = 0;

    public Y: number = 0;

    public Width: number = 0;

    public Height: number = 0;

    public SetDimensions(x: number, y: number, width: number, height: number): RectangleHoverArea {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
        return this;
    }

    DistanceTo(point: LiveChartsCore.LvcPoint): number {
        let cx = this.X + this.Width * 0.5;
        let cy = this.Y + this.Height * 0.5;

        return Math.sqrt(Math.pow(point.X - cx, 2) + Math.pow(point.Y - cy, 2));
    }

    IsPointerOver(pointerLocation: LiveChartsCore.LvcPoint, strategy: LiveChartsCore.TooltipFindingStrategy): boolean {
        // at least one pixel to fire the tooltip.
        let w = this.Width < 1 ? 1 : this.Width;
        let h = this.Height < 1 ? 1 : this.Height;

        let isInX = pointerLocation.X > this.X && pointerLocation.X < this.X + w;
        let isInY = pointerLocation.Y > this.Y && pointerLocation.Y < this.Y + h;

        switch (strategy) {
            case LiveChartsCore.TooltipFindingStrategy.CompareOnlyX:
            case LiveChartsCore.TooltipFindingStrategy.CompareOnlyXTakeClosest:
                return isInX;
            case LiveChartsCore.TooltipFindingStrategy.CompareOnlyY:
            case LiveChartsCore.TooltipFindingStrategy.CompareOnlyYTakeClosest:
                return isInY;
            case LiveChartsCore.TooltipFindingStrategy.CompareAll:
            case LiveChartsCore.TooltipFindingStrategy.CompareAllTakeClosest:
                return isInX && isInY;
            case LiveChartsCore.TooltipFindingStrategy.Automatic:
                throw new System.Exception(`The strategy ${strategy} is not supported.`);
            default:
                throw new System.NotImplementedException();
        }
    }

    SuggestTooltipPlacement(cartesianContext: LiveChartsCore.TooltipPlacementContext) {
        if (this.Y < cartesianContext.MostTop) cartesianContext.MostTop = this.Y;
        if (this.Y + this.Height > cartesianContext.MostBottom) cartesianContext.MostBottom = this.Y + this.Height;
        if (this.X + this.Width > cartesianContext.MostRight) cartesianContext.MostRight = this.X + this.Width;
        if (this.X < cartesianContext.MostLeft) cartesianContext.MostLeft = this.X;
    }
}
