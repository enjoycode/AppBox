import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class HeatLandSeries<TDrawingContext extends LiveChartsCore.DrawingContext> implements LiveChartsCore.IGeoSeries1<TDrawingContext>, System.INotifyPropertyChanged {
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _heatPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _isHeatInCanvas: boolean = false;
    private _heatMap: LiveChartsCore.LvcColor[] = [];
    private _colorStops: Nullable<Float64Array>;
    private _lands: Nullable<System.IEnumerable<LiveChartsCore.IWeigthedMapLand>>;
    private _isVisible: boolean = false;
    private readonly _subscribedTo: System.HashSet<LiveChartsCore.GeoMap<TDrawingContext>> = new System.HashSet();
    private readonly _observer: LiveChartsCore.CollectionDeepObserver<LiveChartsCore.IWeigthedMapLand>;
    private readonly _everUsed: System.HashSet<LiveChartsCore.LandDefinition> = new System.HashSet();

    public constructor() {
        this._observer = new LiveChartsCore.CollectionDeepObserver<LiveChartsCore.IWeigthedMapLand>((sender, e) => this.NotifySubscribers(),
            (sender, e) => this.NotifySubscribers());
    }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    public Name: string = '';

    public get HeatMap(): LiveChartsCore.LvcColor[] {
        return this._heatMap;
    }

    public set HeatMap(value: LiveChartsCore.LvcColor[]) {
        this._heatMap = value;
        this.OnPropertyChanged();
    }

    public get ColorStops(): Nullable<Float64Array> {
        return this._colorStops;
    }

    public set ColorStops(value: Nullable<Float64Array>) {
        this._colorStops = value;
        this.OnPropertyChanged();
    }

    public get Lands(): Nullable<System.IEnumerable<LiveChartsCore.IWeigthedMapLand>> {
        return this._lands;
    }

    public set Lands(value: Nullable<System.IEnumerable<LiveChartsCore.IWeigthedMapLand>>) {
        this._observer?.Dispose(this._lands);
        this._observer?.Initialize(value);
        this._lands = value;
        this.OnPropertyChanged();
    }

    public get IsVisible(): boolean {
        return this._isVisible;
    }

    public set IsVisible(value: boolean) {
        this._isVisible = value;
        this.OnPropertyChanged();
    }

    public Measure(context: LiveChartsCore.MapContext<TDrawingContext>) {
        this._subscribedTo.Add(context.CoreMap);

        if (this._heatPaint == null) throw new System.Exception("Default paint not found");

        if (!this._isHeatInCanvas) {
            context.View.Canvas.AddDrawableTask(this._heatPaint);
            this._isHeatInCanvas = true;
        }

        let i = context.View.Fill?.ZIndex ?? 0;
        this._heatPaint.ZIndex = i + 1;

        let bounds = new LiveChartsCore.Bounds();
        if (this.Lands != null) {
            for (const shape of this.Lands) {
                bounds.AppendValue(shape.Value);
            }
        }

        let heatStops = LiveChartsCore.HeatFunctions.BuildColorStops(this.HeatMap, this.ColorStops);

        let toRemove = new System.HashSet<LiveChartsCore.LandDefinition>(this._everUsed);

        if (this.Lands != null) {
            for (const land of this.Lands) {
                let projector = LiveChartsCore.Maps.BuildProjector(
                    context.View.MapProjection, context.View.Width, context.View.Height);

                let heat = LiveChartsCore.HeatFunctions.InterpolateColor(<number><unknown>land.Value, bounds, this.HeatMap, heatStops);

                let mapLand = context.View.ActiveMap.FindLand(land.Name);
                if (mapLand == null) return;

                let shapesQuery = mapLand.Data
                    .Select(x => x.Shape)
                    .Where(x => x != null)
                    .Cast<LiveChartsCore.IHeatPathShape>();

                for (const pathShape of shapesQuery) {
                    pathShape.FillColor = (heat).Clone();
                }
                this._everUsed.Add(mapLand);
                toRemove.Remove(mapLand);
            }
        }

        this.ClearHeat(toRemove);
    }

    public Delete(context: LiveChartsCore.MapContext<TDrawingContext>) {
        this.ClearHeat(this._everUsed);
        this._subscribedTo.Remove(context.CoreMap);
    }

    protected IntitializeSeries(heatPaint: LiveChartsCore.IPaint<TDrawingContext>) {
        this._heatPaint = heatPaint;
    }

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }

    private NotifySubscribers() {
        for (const chart of this._subscribedTo) chart.Update();
    }

    private ClearHeat(toRemove: System.IEnumerable<LiveChartsCore.LandDefinition>) {
        for (const mapLand of toRemove) {
            let shapesQuery = mapLand.Data
                .Select(x => x.Shape)
                .Where(x => x != null)
                .Cast<LiveChartsCore.IHeatPathShape>();

            for (const pathShape of shapesQuery) {
                pathShape.FillColor = (LiveChartsCore.LvcColor.Empty).Clone();
            }
            this._everUsed.Remove(mapLand);
        }
    }
}
