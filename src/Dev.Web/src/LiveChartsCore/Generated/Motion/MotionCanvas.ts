import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class MotionCanvas<TDrawingContext extends LiveChartsCore.DrawingContext> implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;
    private readonly _stopwatch: System.Stopwatch = new System.Stopwatch();
    private _paintTasks: System.HashSet<LiveChartsCore.IPaint<TDrawingContext>> = new System.HashSet();
    private readonly _fpsStack: System.List<number> = new System.List();
    private _previousFrameTime: bigint = 0n;
    private _previousLogTime: bigint = 0n;
    private _sync: any = {};

    public constructor() {
        this._stopwatch.Start();
    }

    public DisableAnimations: boolean = false;

    public StartPoint: Nullable<LiveChartsCore.LvcPoint>;

    public readonly Invalidated = new System.Event<LiveChartsCore.MotionCanvas<TDrawingContext>>();

    public readonly Validated = new System.Event<LiveChartsCore.MotionCanvas<TDrawingContext>>();

    #IsValid: boolean = false;
    public get IsValid() {
        return this.#IsValid;
    }

    private set IsValid(value) {
        this.#IsValid = value;
    }

    public get Sync(): any {
        return this._sync;
    }

    public get Trackers(): System.HashSet<LiveChartsCore.IAnimatable> {
        return new System.HashSet<LiveChartsCore.IAnimatable>();
    }

    public DrawFrame(context: TDrawingContext) {
        {
            context.OnBegingDraw();

            let isValid = true;
            let frameTime = this._stopwatch.ElapsedMilliseconds;

            let toRemoveGeometries = new System.List<System.Tuple2<LiveChartsCore.IPaint<TDrawingContext>, LiveChartsCore.IDrawable<TDrawingContext>>>();

            for (const task of this._paintTasks.OrderBy(x => x.ZIndex)) {
                if (this.DisableAnimations) task.CompleteTransition(null);
                task.IsValid = true;
                task.CurrentTime = frameTime;
                task.InitializeTask(context);

                for (const geometry of task.GetGeometries(this)) {
                    if (geometry == null) continue;
                    if (this.DisableAnimations) geometry.CompleteTransition(null);

                    geometry.IsValid = true;
                    geometry.CurrentTime = frameTime;
                    if (!task.IsPaused) geometry.Draw(context);

                    isValid = isValid && geometry.IsValid;

                    if (geometry.IsValid && geometry.RemoveOnCompleted)
                        toRemoveGeometries.Add(
                            new System.Tuple2<LiveChartsCore.IPaint<TDrawingContext>, LiveChartsCore.IDrawable<TDrawingContext>>(task, geometry));
                }

                isValid = isValid && task.IsValid;

                if (task.RemoveOnCompleted && task.IsValid) this._paintTasks.Remove(task);
                task.Dispose();
            }

            for (const tracker of this.Trackers) {
                tracker.IsValid = true;
                tracker.CurrentTime = frameTime;
                isValid = isValid && tracker.IsValid;
            }

            for (const tuple of toRemoveGeometries) {
                tuple.Item1.RemoveGeometryFromPainTask(this, tuple.Item2);

                // if we removed at least one geometry, we need to redraw the control
                // to ensure it is not present in the next frame
                isValid = false;
            }


            this._previousFrameTime = frameTime;
            this.IsValid = isValid;

            context.OnEndDraw();
        }

        if (this.IsValid) this.Validated.Invoke(this);
    }

    public get DrawablesCount(): number {
        return this._paintTasks.length;
    }

    public Invalidate() {
        this.IsValid = false;
        this.Invalidated.Invoke(this);
    }

    public AddDrawableTask(task: LiveChartsCore.IPaint<TDrawingContext>) {
        this._paintTasks.Add(task);
    }

    public SetPaintTasks(tasks: System.HashSet<LiveChartsCore.IPaint<TDrawingContext>>) {
        this._paintTasks = tasks;
    }

    public RemovePaintTask(task: LiveChartsCore.IPaint<TDrawingContext>) {
        task.ReleaseCanvas(this);
        this._paintTasks.Remove(task);
    }

    public Clear() {
        for (const task of this._paintTasks)
            task.ReleaseCanvas(this);
        this._paintTasks.Clear();
        this.Invalidate();
    }

    public CountGeometries(): number {
        let count = 0;

        for (const task of this._paintTasks)
            for (const geometry of task.GetGeometries(this))
                count++;

        return count;
    }

    public Dispose() {
        for (const task of this._paintTasks)
            task.ReleaseCanvas(this);
        this._paintTasks.Clear();
        this.Trackers.Clear();
        this.IsValid = true;
    }
}
