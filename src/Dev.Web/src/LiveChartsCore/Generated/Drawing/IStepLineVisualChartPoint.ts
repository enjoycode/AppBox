import * as LiveChartsCore from '@/LiveChartsCore'

export interface IStepLineVisualChartPoint<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IVisualChartPoint<TDrawingContext> {
    // /// <summary>
    // /// Gets the geometry.
    // /// </summary>
    // /// <value>
    // /// The geometry.
    // /// </value>
    // ISizedGeometry<TDrawingContext> Geometry { get; }

    get StepSegment(): LiveChartsCore.StepLineSegment;

}
