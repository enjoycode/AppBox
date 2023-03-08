import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StackedAreaSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext, TPathGeometry extends LiveChartsCore.IVectorGeometry<LiveChartsCore.CubicBezierSegment, TDrawingContext>, TVisualPoint extends LiveChartsCore.BezierVisualPoint<TDrawingContext, TVisual>> extends LiveChartsCore.LineSeries<TModel, TVisual, TLabel, TDrawingContext, TPathGeometry, TVisualPoint> {
    public constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>,
                       pathGeometryFactory: System.Func1<TPathGeometry>, visualPointFactory: System.Func1<TVisualPoint>) {
        super(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory, true);
        this.GeometryFill = null;
        this.GeometryStroke = null;
        this.GeometrySize = 0;
    }
}
