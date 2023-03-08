import * as LiveChartsCore from '@/LiveChartsCore'

export class AxisVisualSeprator<TDrawingContext extends LiveChartsCore.DrawingContext> implements LiveChartsCore.IVisualSeparator<TDrawingContext> {
    public Value: number = 0;

    public Label: Nullable<LiveChartsCore.ILabelGeometry<TDrawingContext>>;

    public Separator: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>>;

    public Tick: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>>;

    public Subseparators: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>[]>;

    public Subticks: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>[]>;

    public get Geometry(): Nullable<LiveChartsCore.IGeometry<TDrawingContext>> {
        return this.Separator;
    }
}
