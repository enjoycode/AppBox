import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class ChartElement<TDrawingContext extends LiveChartsCore.DrawingContext> implements LiveChartsCore.IChartElement<TDrawingContext> {
    public _isInternalSet: boolean = false;
    public _isThemeSet: boolean = false;
    public readonly _userSets: System.HashSet<string> = new System.HashSet();
    private readonly _deletingTasks: System.List<LiveChartsCore.IPaint<TDrawingContext>> = new System.List();

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    public Tag: any;

    public abstract Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>): void;

    public RemoveOldPaints(chart: LiveChartsCore.IChartView1<TDrawingContext>) {
        if (this._deletingTasks.length == 0) return;

        for (const item of this._deletingTasks) {
            chart.CoreCanvas.RemovePaintTask(item);
            item.Dispose();
        }

        this._deletingTasks.Clear();
    }

    public RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        for (const item of this.GetPaintTasks()) {
            if (item == null) continue;
            chart.Canvas.RemovePaintTask(item);
            item.ClearGeometriesFromPaintTask(chart.Canvas);
        }
    }

    public abstract GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[];

    protected SetPaintProperty(reference: System.Ref<Nullable<LiveChartsCore.IPaint<TDrawingContext>>>,
                               value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>,
                               isStroke: boolean = false,
                               propertyName: Nullable<string> = null) {
        if (propertyName == null) throw new System.ArgumentNullException("propertyName");
        if (!this.CanSetProperty(propertyName)) return;

        if (reference.Value != null) this._deletingTasks.Add(reference.Value);
        reference.Value = value;

        if (reference.Value != null) {
            reference.Value.IsStroke = isStroke;
            reference.Value.IsFill = !isStroke;
            if (!isStroke) reference.Value.StrokeThickness = 0;
        }

        this.OnPropertyChanged(propertyName);
    }

    protected SetProperty<T>(reference: System.Ref<T>,
                             value: T,
                             propertyName: Nullable<string> = null) {
        if (propertyName == null) throw new System.ArgumentNullException("propertyName");
        if (!this.CanSetProperty(propertyName)) return;

        reference.Value = value;
        this.OnPropertyChanged(propertyName);
    }

    protected CanSetProperty(propertyName: string): boolean {
        return !this._isInternalSet
            ||
            !this._userSets.Contains(propertyName);
    }

    protected ScheduleDeleteFor(paintTask: LiveChartsCore.IPaint<TDrawingContext>) {
        this._deletingTasks.Add(paintTask);
    }

    protected OnPaintChanged(propertyName: Nullable<string>) {
    }

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {

        if (this._isInternalSet) return;

        if (propertyName == null)
            throw new System.ArgumentNullException("propertyName");
        this._userSets.Add(propertyName);
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}
