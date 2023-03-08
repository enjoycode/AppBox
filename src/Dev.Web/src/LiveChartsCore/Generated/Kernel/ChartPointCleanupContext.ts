import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class ChartPointCleanupContext {
    private _toDeleteCount: number = 0;

    public static For(points: System.HashSet<LiveChartsCore.ChartPoint>): ChartPointCleanupContext {
        for (const point of points) point.RemoveOnCompleted = true;
        return new ChartPointCleanupContext().Init({_toDeleteCount: points.length});
    }

    public Clean(point: LiveChartsCore.ChartPoint) {
        if (!point.RemoveOnCompleted) return;

        this._toDeleteCount--;
        point.RemoveOnCompleted = false;
    }

    public CollectPoints(points: System.HashSet<LiveChartsCore.ChartPoint>,
                         chartView: LiveChartsCore.IChartView,
                         primaryScale: LiveChartsCore.Scaler,
                         secondaryScale: LiveChartsCore.Scaler,
                         disposeAction: System.Action3<LiveChartsCore.ChartPoint, LiveChartsCore.Scaler, LiveChartsCore.Scaler>) {
        if (this._toDeleteCount == 0) return;


        let toDeletePoints = points.Where(p => p.RemoveOnCompleted);

        for (const p of toDeletePoints) {
            if (p.Context.Chart != chartView) continue;
            disposeAction(p, primaryScale, secondaryScale);
            points.Remove(p);
        }
    }

    public CollectPointsForPolar(points: System.HashSet<LiveChartsCore.ChartPoint>,
                                 chartView: LiveChartsCore.IChartView,
                                 scale: LiveChartsCore.PolarScaler,
                                 disposeAction: System.Action2<LiveChartsCore.ChartPoint, LiveChartsCore.PolarScaler>) {
        if (this._toDeleteCount == 0) return;


        let toDeletePoints = points.Where(p => p.RemoveOnCompleted);

        for (const p of toDeletePoints) {
            if (p.Context.Chart != chartView) continue;
            disposeAction(p, scale);
            points.Remove(p);
        }
    }
}
