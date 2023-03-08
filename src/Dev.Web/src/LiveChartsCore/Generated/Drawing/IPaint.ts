import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPaint<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IAnimatable, System.IDisposable {
    get IsStroke(): boolean;

    set IsStroke(value: boolean);

    get IsFill(): boolean;

    set IsFill(value: boolean);

    get FontFamily(): Nullable<string>;

    set FontFamily(value: Nullable<string>);

    get ZIndex(): number;

    set ZIndex(value: number);

    get StrokeThickness(): number;

    set StrokeThickness(value: number);

    get IsPaused(): boolean;

    set IsPaused(value: boolean);

    GetClipRectangle(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>): LiveChartsCore.LvcRectangle;

    SetClipRectangle(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>, value: LiveChartsCore.LvcRectangle): void;

    InitializeTask(context: TDrawingContext): void;

    GetGeometries(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>): System.IEnumerable<LiveChartsCore.IDrawable<TDrawingContext>>;

    SetGeometries(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>, geometries: System.HashSet<LiveChartsCore.IDrawable<TDrawingContext>>): void;

    AddGeometryToPaintTask(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>, geometry: LiveChartsCore.IDrawable<TDrawingContext>): void;

    RemoveGeometryFromPainTask(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>, geometry: LiveChartsCore.IDrawable<TDrawingContext>): void;

    ClearGeometriesFromPaintTask(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>): void;

    ReleaseCanvas(canvas: LiveChartsCore.MotionCanvas<TDrawingContext>): void;

    ApplyOpacityMask(context: TDrawingContext, geometry: LiveChartsCore.IPaintable<TDrawingContext>): void;

    RestoreOpacityMask(context: TDrawingContext, geometry: LiveChartsCore.IPaintable<TDrawingContext>): void;

    CloneTask(): IPaint<TDrawingContext>;
}
