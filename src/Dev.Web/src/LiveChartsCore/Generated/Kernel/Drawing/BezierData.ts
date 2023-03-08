import * as LiveChartsCore from '@/LiveChartsCore'

export class BezierData {
    public constructor(chartPoint: LiveChartsCore.ChartPoint) {
        this.TargetPoint = chartPoint;
        this.X0 = this.Y0 = this.X1 = this.Y1 = this.X2 = this.Y2 = 0;
    }

    public TargetPoint: LiveChartsCore.ChartPoint;

    public X0: number = 0;

    public Y0: number = 0;

    public X1: number = 0;

    public Y1: number = 0;

    public X2: number = 0;

    public Y2: number = 0;
}

