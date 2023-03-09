import * as LiveChartsCore from '@/LiveChartsCore'

export class BezierVisualPoint<TDrawingContext extends LiveChartsCore.DrawingContext, TVisual extends LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>> implements LiveChartsCore.ICubicBezierVisualChartPoint<TDrawingContext> {
    protected constructor(geometry: TVisual) {
        this.Geometry = geometry;
    }

    public Geometry: TVisual;

    public Bezier: LiveChartsCore.CubicBezierSegment = new LiveChartsCore.CubicBezierSegment();

    public FillPath: Nullable<LiveChartsCore.IVectorGeometry<LiveChartsCore.CubicBezierSegment, TDrawingContext>>;

    public StrokePath: Nullable<LiveChartsCore.IVectorGeometry<LiveChartsCore.CubicBezierSegment, TDrawingContext>>;

    public get MainGeometry(): Nullable<LiveChartsCore.IGeometry<TDrawingContext>> {
        return this.Geometry?.MainGeometry;
    }

    //ISizedGeometry<TDrawingContext> ICubicBezierVisualChartPoint<TDrawingContext>.Geometry => Geometry;
}
