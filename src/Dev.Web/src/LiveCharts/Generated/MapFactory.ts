import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class MapFactory implements LiveChartsCore.IMapFactory<LiveCharts.SkiaDrawingContext> {
    private readonly _usedPathShapes: System.HashSet<LiveCharts.HeatPathShape> = new System.HashSet();
    private readonly _usedPaints: System.HashSet<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> = new System.HashSet();
    private readonly _usedLayers: System.HashSet<string> = new System.HashSet();
    private _mapView: Nullable<LiveChartsCore.IGeoMapView<LiveCharts.SkiaDrawingContext>>;

    public GenerateLands(context: LiveChartsCore.MapContext<LiveCharts.SkiaDrawingContext>) {
        let projector = context.Projector;

        let toRemoveLayers = new System.HashSet<string>(this._usedLayers);
        let toRemovePathShapes = new System.HashSet<LiveCharts.HeatPathShape>(this._usedPathShapes);
        let toRemovePaints = new System.HashSet<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>(this._usedPaints);

        let layersQuery = context.View.ActiveMap.Layers.Values
            .Where(x => x.IsVisible)
            .OrderByDescending(x => x.ProcessIndex, System.NumberComparer);

        this._mapView = context.View;

        for (const layer of layersQuery) {
            let stroke = layer.Stroke;
            let fill = layer.Fill;

            if (fill != null) {
                context.View.Canvas.AddDrawableTask(fill);
                this._usedPaints.Add(fill);
                toRemovePaints.Remove(fill);
            }
            if (stroke != null) {
                context.View.Canvas.AddDrawableTask(stroke);
                this._usedPaints.Add(stroke);
                toRemovePaints.Remove(stroke);
            }
            this._usedLayers.Add(layer.Name);
            toRemoveLayers.Remove(layer.Name);

            for (const landDefinition of layer.Lands.Values) {
                for (const landData of landDefinition.Data) {
                    let shape: LiveCharts.HeatPathShape;

                    if (landData.Shape == null) {
                        landData.Shape = shape = new LiveCharts.HeatPathShape().Init({IsClosed: true});
                        LiveChartsCore.Extensions.TransitionateProperties(shape
                            , "FillColor")
                            .WithAnimationBuilder(animation =>
                                animation
                                    .WithDuration(System.TimeSpan.FromMilliseconds(800))
                                    .WithEasingFunction(LiveChartsCore.EasingFunctions.ExponentialOut));
                    } else {
                        shape = <LiveCharts.HeatPathShape><unknown>landData.Shape;
                    }
                    this._usedPathShapes.Add(shape);
                    toRemovePathShapes.Remove(shape);

                    stroke?.AddGeometryToPaintTask(context.View.Canvas, shape);
                    fill?.AddGeometryToPaintTask(context.View.Canvas, shape);

                    shape.ClearCommands();

                    let isFirst = true;

                    for (const point of landData.Coordinates) {
                        let p = projector.ToMap(new Float64Array([point.X, point.Y]));

                        let x = p[0];
                        let y = p[1];

                        if (isFirst) {
                            shape.AddLast(new LiveCharts.MoveToPathCommand().Init({X: x, Y: y}));
                            isFirst = false;
                            continue;
                        }
                        shape.AddLast(new LiveCharts.LineSegment().Init({X: x, Y: y}));
                    }
                }
            }

            for (const shape of toRemovePathShapes) {
                stroke?.RemoveGeometryFromPainTask(context.View.Canvas, shape);
                fill?.RemoveGeometryFromPainTask(context.View.Canvas, shape);

                shape.ClearCommands();
                this._usedPathShapes.Remove(shape);
            }
        }

        for (const paint of toRemovePaints) {
            this._usedPaints.Remove(paint);
            context.View.Canvas.RemovePaintTask(paint);
        }

        for (const layerName of toRemoveLayers) {
            context.MapFile.Layers.Remove(layerName);
            this._usedLayers.Remove(layerName);
        }
    }

    public ViewTo(sender: LiveChartsCore.GeoMap<LiveCharts.SkiaDrawingContext>, command: any) {
    }

    public Pan(sender: LiveChartsCore.GeoMap<LiveCharts.SkiaDrawingContext>, delta: LiveChartsCore.LvcPoint) {
    }

    public Dispose() {
        if (this._mapView != null) {
            let layersQuery = this._mapView.ActiveMap.Layers.Values
                .Where(x => x.IsVisible)
                .OrderByDescending(x => x.ProcessIndex, System.NumberComparer);

            for (const layer of layersQuery) {
                let stroke = layer.Stroke;
                let fill = layer.Fill;

                for (const landDefinition of layer.Lands.Values) {
                    for (const landData of landDefinition.Data) {
                        let shape = <Nullable<LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>>><unknown>landData.Shape;
                        if (shape == null) continue;

                        stroke?.RemoveGeometryFromPainTask(this._mapView.Canvas, shape);
                        fill?.AddGeometryToPaintTask(this._mapView.Canvas, shape);

                        landData.Shape = null;
                    }
                }
                for (const paint of this._usedPaints) {
                    this._mapView.Canvas.RemovePaintTask(paint);
                    paint.ClearGeometriesFromPaintTask(this._mapView.Canvas);
                }

                this._mapView.Canvas.RemovePaintTask(stroke);
                this._mapView.Canvas.RemovePaintTask(fill);
            }
        }

        this._usedPathShapes.Clear();
        this._usedLayers.Clear();
        this._usedPaints.Clear();
    }
}
