import * as LiveChartsCore from '@/LiveChartsCore'

export class RadialAxisVisualSeparator<TDrawingContext extends LiveChartsCore.DrawingContext> implements LiveChartsCore.IVisualSeparator<TDrawingContext> {
    public Value: number = 0;

    public Label: Nullable<LiveChartsCore.ILabelGeometry<TDrawingContext>>;

    public Circle: Nullable<LiveChartsCore.ISizedGeometry<TDrawingContext>>;

    public get Geometry(): Nullable<LiveChartsCore.IGeometry<TDrawingContext>> {
        return this.Circle;
    }
}
