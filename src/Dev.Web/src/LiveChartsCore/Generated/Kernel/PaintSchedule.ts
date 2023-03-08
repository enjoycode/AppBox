import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PaintSchedule<TDrawingContext extends LiveChartsCore.DrawingContext> {


    public constructor(task: LiveChartsCore.IPaint<TDrawingContext>, ...geometries: LiveChartsCore.IDrawable<TDrawingContext>[]) {
        this.PaintTask = task;
        this.Geometries = new System.HashSet<LiveChartsCore.IDrawable<TDrawingContext>>(geometries);
    }

    public PaintTask: LiveChartsCore.IPaint<TDrawingContext>;

    public Geometries: System.HashSet<LiveChartsCore.IDrawable<TDrawingContext>>;
}
