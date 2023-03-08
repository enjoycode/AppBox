import * as LiveChartsCore from '@/LiveChartsCore'

export class PanGestureEventArgs {
    public constructor(delta: LiveChartsCore.LvcPoint) {
        this.Delta = (delta).Clone();
        this.Handled = false;
    }

    public Delta: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();

    public Handled: boolean = false;
}
