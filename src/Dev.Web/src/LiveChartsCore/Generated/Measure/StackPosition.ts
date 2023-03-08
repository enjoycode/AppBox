import * as LiveChartsCore from '@/LiveChartsCore'

export class StackPosition<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public Stacker: LiveChartsCore.Stacker<TDrawingContext> = new LiveChartsCore.Stacker();

    public Position: number = 0;

    public StackPoint(point: LiveChartsCore.ChartPoint): number {
        return this.Stacker.StackPoint(point, this.Position);
    }

    public GetStack(point: LiveChartsCore.ChartPoint): LiveChartsCore.StackedValue {
        return point.StackedValue = this.Stacker.GetStack(point, this.Position);
    }
}
