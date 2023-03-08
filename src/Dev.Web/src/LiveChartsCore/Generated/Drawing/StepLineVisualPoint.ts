import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StepLineVisualPoint<TDrawingContext extends LiveChartsCore.DrawingContext, TVisual extends LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>> implements LiveChartsCore.IStepLineVisualChartPoint<TDrawingContext> {
    public constructor(visualFactory: System.Func1<TVisual>) {
        this.Geometry = visualFactory();
    }

    public Geometry: TVisual;

    public StepSegment: LiveChartsCore.StepLineSegment = new LiveChartsCore.StepLineSegment();

    public FillPath: Nullable<LiveChartsCore.IVectorGeometry<LiveChartsCore.StepLineSegment, TDrawingContext>>;

    public StrokePath: Nullable<LiveChartsCore.IVectorGeometry<LiveChartsCore.StepLineSegment, TDrawingContext>>;

    public get MainGeometry(): Nullable<LiveChartsCore.IGeometry<TDrawingContext>> {
        return this.Geometry?.MainGeometry;
    }


}
