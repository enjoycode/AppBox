import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class StepLineAreaGeometry extends LiveCharts.VectorGeometry<LiveChartsCore.StepLineSegment> {
    private _isFirst: boolean = true;

    OnDrawSegment(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: LiveChartsCore.StepLineSegment) {
        if (this._isFirst) {
            this._isFirst = false;
            return;
        }

        path.lineTo(segment.Xj, segment.Yi);
        path.lineTo(segment.Xj, segment.Yj);
    }

    OnOpen(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: LiveChartsCore.StepLineSegment) {
        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed) {
            path.moveTo(segment.Xj, segment.Yj);
            return;
        }

        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
            path.moveTo(segment.Xj, this.Pivot);
            path.lineTo(segment.Xj, segment.Yj);
            return;
        }
    }

    OnClose(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: LiveChartsCore.StepLineSegment) {
        this._isFirst = true;

        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed) return;

        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
            path.lineTo(segment.Xj, this.Pivot);
            path.close();
            return;
        }
    }
}
