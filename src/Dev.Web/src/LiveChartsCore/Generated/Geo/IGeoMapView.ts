import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IGeoMapView<TDrawingContext extends LiveChartsCore.DrawingContext> {
    get ActiveMap(): LiveChartsCore.CoreMap<TDrawingContext>;

    set ActiveMap(value: LiveChartsCore.CoreMap<TDrawingContext>);

    get Canvas(): LiveChartsCore.MotionCanvas<TDrawingContext>;


    get Width(): number;


    get Height(): number;


    get Stroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Stroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get Fill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Fill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get AutoUpdateEnabled(): boolean;

    set AutoUpdateEnabled(value: boolean);

    get MapProjection(): LiveChartsCore.MapProjection;

    set MapProjection(value: LiveChartsCore.MapProjection);

    get DesignerMode(): boolean;


    get SyncContext(): any;

    set SyncContext(value: any);

    get ViewCommand(): any;

    set ViewCommand(value: any);

    InvokeOnUIThread(action: System.Action): void;

    get Series(): System.IEnumerable<LiveChartsCore.IGeoSeries>;

    set Series(value: System.IEnumerable<LiveChartsCore.IGeoSeries>);
}
