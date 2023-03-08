import * as LiveChartsCore from '@/LiveChartsCore'

export class SemicircleHoverArea extends LiveChartsCore.HoverArea {
    public CenterX: number = 0;

    public CenterY: number = 0;

    public StartAngle: number = 0;

    public EndAngle: number = 0;

    public Radius: number = 0;

    public SetDimensions(centerX: number, centerY: number, startAngle: number, endAngle: number, radius: number): SemicircleHoverArea {
        this.CenterX = centerX;
        this.CenterY = centerY;
        this.StartAngle = startAngle;
        this.EndAngle = endAngle;
        this.Radius = radius;
        return this;
    }

    public DistanceTo(point: LiveChartsCore.LvcPoint): number {
        let a = (this.StartAngle + this.EndAngle) * 0.5;
        let r = this.Radius * 0.5;

        a *= Math.PI / 180;

        let y = r * Math.cos(a);
        let x = r * Math.sin(a);

        return Math.sqrt(Math.pow(point.X - x, 2) + Math.pow(point.Y - y, 2));
    }

    public IsPointerOver(pointerLocation: LiveChartsCore.LvcPoint, strategy: LiveChartsCore.TooltipFindingStrategy): boolean {
        let startAngle = this.StartAngle;
        startAngle %= 360;
        if (startAngle < 0) startAngle += 360;


        let endAngle = this.EndAngle - 0.01;
        endAngle %= 360;
        if (endAngle < 0) endAngle += 360;

        let dx = this.CenterX - pointerLocation.X;
        let dy = this.CenterY - pointerLocation.Y;
        let beta = Math.atan(dy / dx) * (180 / Math.PI);

        if ((dx > 0 && dy < 0) || (dx > 0 && dy > 0)) beta += 180;
        if (dx < 0 && dy > 0) beta += 360;

        let r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (endAngle > startAngle) {
            return startAngle <= beta &&
                endAngle >= beta &&
                r < this.Radius;
        }


        if (beta < startAngle) beta += 360;

        return startAngle <= beta &&
            endAngle + 360 >= beta &&
            r < this.Radius;
    }

    public SuggestTooltipPlacement(context: LiveChartsCore.TooltipPlacementContext) {
        let angle = (this.StartAngle + this.EndAngle) / 2;
        context.PieX = this.CenterX + <number><unknown>Math.cos(angle * (Math.PI / 180)) * this.Radius;
        context.PieY = this.CenterY + <number><unknown>Math.sin(angle * (Math.PI / 180)) * this.Radius;
    }
}
