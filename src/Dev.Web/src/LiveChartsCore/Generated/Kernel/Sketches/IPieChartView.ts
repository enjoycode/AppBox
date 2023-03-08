import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPieChartView<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartView1<TDrawingContext> {
    get Core(): LiveChartsCore.PieChart<TDrawingContext>;


    get Series(): System.IEnumerable<LiveChartsCore.ISeries>;

    set Series(value: System.IEnumerable<LiveChartsCore.ISeries>);

    get InitialRotation(): number;

    set InitialRotation(value: number);

    get MaxAngle(): number;

    set MaxAngle(value: number);

    get Total(): Nullable<number>;

    set Total(value: Nullable<number>);

    get IsClockwise(): boolean;

    set IsClockwise(value: boolean);
}
