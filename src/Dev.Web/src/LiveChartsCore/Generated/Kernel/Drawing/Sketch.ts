import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Sketch<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public Width: number = 0;

    public Height: number = 0;

    public PaintSchedules: System.List<LiveChartsCore.PaintSchedule<TDrawingContext>> = new System.List();
}
