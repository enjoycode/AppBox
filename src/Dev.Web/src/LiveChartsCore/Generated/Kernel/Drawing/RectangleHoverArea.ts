import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class RectangleHoverArea extends LiveChartsCore.HoverArea {
    public constructor() {
        super();
    }


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

    public DistanceTo(point: LiveChartsCore.LvcPoint): number {
        let cx = this.X + this.Width * 0.5;
        let cy = this.Y + this.Height * 0.5;

        return Math.sqrt(Math.pow(point.X - cx, 2) + Math.pow(point.Y - cy, 2));
    }

    public IsPointerOver(pointerLocation: LiveChartsCore.LvcPoint, strategy: LiveChartsCore.TooltipFindingStrategy): boolean {

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

    public SuggestTooltipPlacement(cartesianContext: LiveChartsCore.TooltipPlacementContext) {
        if (this.Y < cartesianContext.MostTop) cartesianContext.MostTop = this.Y;
        if (this.Y + this.Height > cartesianContext.MostBottom) cartesianContext.MostBottom = this.Y + this.Height;
        if (this.X + this.Width > cartesianContext.MostRight) cartesianContext.MostRight = this.X + this.Width;
        if (this.X < cartesianContext.MostLeft) cartesianContext.MostLeft = this.X;
    }
}
