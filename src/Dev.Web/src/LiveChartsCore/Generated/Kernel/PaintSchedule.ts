import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PaintSchedule<TDrawingContext extends LiveChartsCore.DrawingContext> {
    // /// <summary>
    // /// Initializes a new instance of the <see cref="PaintSchedule{TDrawingContext}"/> class.
    // /// </summary>
    // /// <param name="task">The task.</param>
    // /// <param name="geometries">The geometries.</param>
    // public PaintSchedule(IPaint<TDrawingContext> task, HashSet<IDrawable<TDrawingContext>> geometries)
    // {
    //     PaintTask = task;
    //     Geometries = geometries;
    // }

    public constructor(task: LiveChartsCore.IPaint<TDrawingContext>, ...geometries: LiveChartsCore.IDrawable<TDrawingContext>[]) {
        this.PaintTask = task;
        this.Geometries = new System.HashSet<LiveChartsCore.IDrawable<TDrawingContext>>(geometries);
    }

    public PaintTask: LiveChartsCore.IPaint<TDrawingContext>;

    public Geometries: System.HashSet<LiveChartsCore.IDrawable<TDrawingContext>>;
}
