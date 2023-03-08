import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StackedColumnSeries<TModel, TVisual extends object & LiveChartsCore.IRoundedRectangleChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ColumnSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IStackedBarSeries<TDrawingContext> {
    private _stackGroup: number = 0;

    public constructor(visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>) {
        super(visualFactory, labelFactory, true);
    }

    public get StackGroup(): number {
        return this._stackGroup;
    }

    public set StackGroup(value: number) {
        this._stackGroup = value;
        this.OnPropertyChanged();
    }

    public GetStackGroup(): number {
        return this._stackGroup;
    }
}
