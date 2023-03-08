import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IChartElement<TDrawingContext extends LiveChartsCore.DrawingContext> extends System.INotifyPropertyChanged {
    get Tag(): any;

    set Tag(value: any);

    Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>): void;

    RemoveOldPaints(chart: LiveChartsCore.IChartView1<TDrawingContext>): void;

    RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>): void;
}
