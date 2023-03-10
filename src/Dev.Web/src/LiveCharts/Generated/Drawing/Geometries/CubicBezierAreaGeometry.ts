import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class CubicBezierAreaGeometry extends LiveCharts.VectorGeometry<LiveChartsCore.CubicBezierSegment> {
    OnDrawSegment(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: LiveChartsCore.CubicBezierSegment) {
        path.cubicTo(segment.Xi, segment.Yi, segment.Xm, segment.Ym, segment.Xj, segment.Yj);
    }

    OnOpen(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: LiveChartsCore.CubicBezierSegment) {
        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed) {
            path.moveTo(segment.Xi, segment.Yi);
            return;
        }

        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
            path.moveTo(segment.Xi, this.Pivot);
            path.lineTo(segment.Xi, segment.Yi);
            return;
        }
    }

    OnClose(context: LiveCharts.SkiaDrawingContext, path: PixUI.Path, segment: LiveChartsCore.CubicBezierSegment) {
        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed) return;

        if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
            path.lineTo(segment.Xj, this.Pivot);
            path.close();
            return;
        }
    }
}
