var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _Canvas, _Size, _Series, _Visual, _MouseRegion;
import * as System from "/System.js";
import * as PixUI from "/PixUI.js";
import * as LiveChartsCore from "/LiveChartsCore.js";
class DoubleDict {
  constructor() {
    __publicField(this, "_keys", new System.Dictionary());
    __publicField(this, "_values", new System.Dictionary());
  }
  Add(key, value) {
    this._keys.Add(key, value);
    this._values.Add(value, key);
  }
  Remove(key) {
    let r2 = this._values.Remove(this._keys.GetAt(key));
    let r1 = this._keys.Remove(key);
    return r1 && r2;
  }
  TryGetValue(key, value) {
    return this._keys.TryGetValue(key, value);
  }
  TryGetKey(key, value) {
    return this._values.TryGetValue(key, value);
  }
}
class SkiaDrawingContext extends LiveChartsCore.DrawingContext {
  constructor(motionCanvas, width, height, canvas, clearOnBegingDraw = true) {
    super();
    __publicField(this, "_clearOnBegingDraw");
    __publicField(this, "MotionCanvas");
    __publicField(this, "Width", 0);
    __publicField(this, "Height", 0);
    __publicField(this, "Canvas");
    __publicField(this, "PaintTask");
    __publicField(this, "Paint");
    __publicField(this, "Background", PixUI.Color.Empty);
    this.MotionCanvas = motionCanvas;
    this.Width = width;
    this.Height = height;
    this.Canvas = canvas;
    this.PaintTask = null;
    this.Paint = null;
    this._clearOnBegingDraw = clearOnBegingDraw;
  }
  OnBegingDraw() {
    if (System.OpInequality(this.Background, PixUI.Color.Empty)) {
      this.Canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.Width, this.Height), PixUI.PaintUtils.Shared(this.Background));
    }
    if (this.MotionCanvas.StartPoint == null || this.MotionCanvas.StartPoint.X == 0 && this.MotionCanvas.StartPoint.Y == 0)
      return;
    this.Canvas.translate(this.MotionCanvas.StartPoint.X, this.MotionCanvas.StartPoint.Y);
  }
  OnEndDraw() {
  }
}
class LineSeries extends LiveChartsCore.LineSeries {
  constructor(isStacked = false) {
    super(() => new CircleGeometry(), () => new LabelGeometry(), () => new CubicBezierAreaGeometry(), () => new BezierPoint(new CircleGeometry()), isStacked);
  }
}
class RowSeries extends LiveChartsCore.RowSeries {
  constructor() {
    super(() => new RoundedRectangleGeometry(), () => new LabelGeometry());
  }
}
class StepLineSeries extends LiveChartsCore.StepLineSeries {
  constructor() {
    super(() => new CircleGeometry(), () => new LabelGeometry(), () => new StepLineAreaGeometry(), () => new StepPoint(() => new CircleGeometry()));
  }
}
class HeatLandSeries extends LiveChartsCore.HeatLandSeries {
  constructor() {
    super();
    throw new System.NotImplementedException();
  }
}
class PieSeries extends LiveChartsCore.PieSeries {
  constructor(isGauge = false, isGaugeFill = false) {
    super(() => new DoughnutGeometry(), () => new LabelGeometry(), () => new CircleGeometry(), isGauge, isGaugeFill);
  }
}
class CandlesticksSeries extends LiveChartsCore.FinancialSeries {
  constructor() {
    super(() => new CandlestickGeometry(), () => new LabelGeometry(), () => new CircleGeometry());
  }
}
class HeatSeries extends LiveChartsCore.HeatSeries {
  constructor() {
    super(() => new ColoredRectangleGeometry(), () => new LabelGeometry());
  }
}
class ScatterSeries extends LiveChartsCore.ScatterSeries {
  constructor() {
    super(() => new CircleGeometry(), () => new LabelGeometry());
  }
}
class StackedAreaSeries extends LiveChartsCore.StackedAreaSeries {
  constructor() {
    super(() => new CircleGeometry(), () => new LabelGeometry(), () => new CubicBezierAreaGeometry(), () => new BezierPoint(new CircleGeometry()));
  }
}
class StackedRowSeries extends LiveChartsCore.StackedRowSeries {
  constructor() {
    super(() => new RoundedRectangleGeometry(), () => new LabelGeometry());
  }
}
class StackedColumnSeries extends LiveChartsCore.StackedColumnSeries {
  constructor() {
    super(() => new RoundedRectangleGeometry(), () => new LabelGeometry());
  }
}
class DrawingFluentExtensions {
  static Draw(canvas) {
    return new DrawingCanvas(canvas);
  }
}
class DrawingCanvas {
  constructor(canvas) {
    __publicField(this, "_selectedPaint");
    __privateAdd(this, _Canvas, void 0);
    this.Canvas = canvas;
  }
  get Canvas() {
    return __privateGet(this, _Canvas);
  }
  set Canvas(value) {
    __privateSet(this, _Canvas, value);
  }
  SelectPaint(paint) {
    this._selectedPaint = paint;
    this.Canvas.AddDrawableTask(this._selectedPaint);
    return this;
  }
  SelectColor(color, strokeWidth = null, isFill = null) {
    strokeWidth ?? (strokeWidth = 1);
    isFill ?? (isFill = false);
    let paint = SolidColorPaint.MakeByColorAndStroke(color, strokeWidth);
    paint.IsFill = isFill;
    return this.SelectPaint(paint);
  }
  SetClip(clipRectangle) {
    if (clipRectangle == null)
      return this;
    if (this._selectedPaint == null)
      throw new System.Exception("There is no paint selected, please select a paint (By calling a Select method) to add the geometry to.");
    this._selectedPaint.SetClipRectangle(this.Canvas, clipRectangle.Clone());
    return this;
  }
  Draw(drawable) {
    if (this._selectedPaint == null)
      throw new System.Exception("There is no paint selected, please select a paint (By calling a Select method) to add the geometry to.");
    this._selectedPaint.AddGeometryToPaintTask(this.Canvas, drawable);
    return this;
  }
}
_Canvas = new WeakMap();
class RectangularSection extends LiveChartsCore.Section2 {
  constructor() {
    super(() => new RectangleGeometry());
  }
}
class PolarAxis extends LiveChartsCore.PolarAxis {
  constructor() {
    super(() => new LabelGeometry(), () => new LineGeometry(), () => new CircleGeometry());
  }
}
class Axis extends LiveChartsCore.Axis {
  constructor() {
    super(() => new LabelGeometry(), () => new LineGeometry());
  }
}
class MapFactory {
  constructor() {
    __publicField(this, "_usedPathShapes", new System.HashSet());
    __publicField(this, "_usedPaints", new System.HashSet());
    __publicField(this, "_usedLayers", new System.HashSet());
    __publicField(this, "_mapView");
  }
  GenerateLands(context) {
    let projector = context.Projector;
    let toRemoveLayers = new System.HashSet(this._usedLayers);
    let toRemovePathShapes = new System.HashSet(this._usedPathShapes);
    let toRemovePaints = new System.HashSet(this._usedPaints);
    let layersQuery = context.View.ActiveMap.Layers.Values.Where((x) => x.IsVisible).OrderByDescending((x) => x.ProcessIndex);
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
          let shape;
          if (landData.Shape == null) {
            landData.Shape = shape = new HeatPathShape().Init({ IsClosed: true });
            LiveChartsCore.Extensions.TransitionateProperties(shape, "FillColor").WithAnimationBuilder((animation) => animation.WithDuration(System.TimeSpan.FromMilliseconds(800)).WithEasingFunction(LiveChartsCore.EasingFunctions.ExponentialOut));
          } else {
            shape = landData.Shape;
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
              shape.AddLast(new MoveToPathCommand().Init({ X: x, Y: y }));
              isFirst = false;
              continue;
            }
            shape.AddLast(new LineSegment().Init({ X: x, Y: y }));
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
  ViewTo(sender, command) {
  }
  Pan(sender, delta) {
  }
  Dispose() {
    if (this._mapView != null) {
      let layersQuery = this._mapView.ActiveMap.Layers.Values.Where((x) => x.IsVisible).OrderByDescending((x) => x.ProcessIndex);
      for (const layer of layersQuery) {
        let stroke = layer.Stroke;
        let fill = layer.Fill;
        for (const landDefinition of layer.Lands.Values) {
          for (const landData of landDefinition.Data) {
            let shape = landData.Shape;
            if (shape == null)
              continue;
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
class SkiaSharpProvider extends LiveChartsCore.ChartEngine {
  GetDefaultMapFactory() {
    return new MapFactory();
  }
  GetDefaultCartesianAxis() {
    return new Axis();
  }
  GetDefaultPolarAxis() {
    return new PolarAxis();
  }
  GetSolidColorPaint(color) {
    return new SolidColorPaint().Init({ Color: new PixUI.Color(color.R, color.G, color.B, color.A) });
  }
}
class DrawMarginFrame extends LiveChartsCore.DrawMarginFrame2 {
  constructor() {
    super(() => new RectangleGeometry());
  }
}
const _LiveChartsSkiaSharp = class {
  static get DefaultPlatformBuilder() {
    return (settings) => ThemesExtensions.AddLightTheme(_LiveChartsSkiaSharp.AddSkiaSharp(settings));
  }
  static UseDefaults(settings) {
    return ThemesExtensions.AddLightTheme(_LiveChartsSkiaSharp.AddSkiaSharp(settings));
  }
  static AddSkiaSharp(settings) {
    return settings.HasProvider(new SkiaSharpProvider());
  }
  static WithGlobalSKTypeface(settings, typeface) {
    if (!LiveChartsCore.LiveCharts.IsConfigured)
      LiveChartsCore.LiveCharts.Configure(_LiveChartsSkiaSharp.DefaultPlatformBuilder);
    _LiveChartsSkiaSharp.DefaultSKTypeface = typeface;
    return settings;
  }
  static AsSKColor(color, alphaOverrides = null) {
    return new PixUI.Color(color.R, color.G, color.B, alphaOverrides ?? color.A);
  }
  static WithOpacity(color, opacity) {
    return LiveChartsCore.LvcColor.FromColorWithAlpha(opacity, color.Clone());
  }
  static AsLvcColor(color) {
    return new LiveChartsCore.LvcColor(color.Red, color.Green, color.Blue, color.Alpha);
  }
  static AsLiveChartsPieSeries(source, buider = null) {
    buider ?? (buider = (instance, series) => {
    });
    return new System.ObservableCollection(source.Select((instance) => {
      let series = new PieSeries().Init({ Values: new System.ObservableCollection().Init([instance]) });
      buider(instance, series);
      return series;
    }).ToArray());
  }
  static GetDistanceTo(target, location) {
    let dataCoordinates = LiveChartsCore.LvcPointD.Empty.Clone();
    let x = 0;
    let y = 0;
    if (LiveChartsCore.IsInterfaceOfICartesianChartView(target.Context)) {
      const cartesianChart = target.Context;
      dataCoordinates = cartesianChart.ScalePixelsToData(new LiveChartsCore.LvcPointD(location.X, location.Y));
      let cartesianSeries = target.Context.Series;
      if ((target.Context.Series.SeriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) {
        let primaryAxis = cartesianChart.Core.YAxes[cartesianSeries.ScalesYAt];
        let secondaryAxis = cartesianChart.Core.XAxes[cartesianSeries.ScalesXAt];
        let drawLocation = cartesianChart.Core.DrawMarginLocation.Clone();
        let drawMarginSize = cartesianChart.Core.DrawMarginSize.Clone();
        let secondaryScale = LiveChartsCore.Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), primaryAxis);
        let primaryScale = LiveChartsCore.Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), secondaryAxis);
        x = secondaryScale.ToPixels(target.SecondaryValue);
        y = primaryScale.ToPixels(target.PrimaryValue);
      } else {
        let primaryAxis = cartesianChart.Core.YAxes[cartesianSeries.ScalesXAt];
        let secondaryAxis = cartesianChart.Core.XAxes[cartesianSeries.ScalesYAt];
        let drawLocation = cartesianChart.Core.DrawMarginLocation.Clone();
        let drawMarginSize = cartesianChart.Core.DrawMarginSize.Clone();
        let secondaryScale = LiveChartsCore.Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), secondaryAxis);
        let primaryScale = LiveChartsCore.Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), primaryAxis);
        x = secondaryScale.ToPixels(target.SecondaryValue);
        y = primaryScale.ToPixels(target.PrimaryValue);
      }
    } else if (LiveChartsCore.IsInterfaceOfIPolarChartView(target.Context)) {
      const polarChart = target.Context;
      dataCoordinates = polarChart.ScalePixelsToData(new LiveChartsCore.LvcPointD(location.X, location.Y));
      let polarSeries = target.Context.Series;
      let angleAxis = polarChart.Core.AngleAxes[polarSeries.ScalesAngleAt];
      let radiusAxis = polarChart.Core.RadiusAxes[polarSeries.ScalesRadiusAt];
      let drawLocation = polarChart.Core.DrawMarginLocation.Clone();
      let drawMarginSize = polarChart.Core.DrawMarginSize.Clone();
      let scaler = new LiveChartsCore.PolarScaler(drawLocation.Clone(), drawMarginSize.Clone(), angleAxis, radiusAxis, polarChart.Core.InnerRadius, polarChart.Core.InitialRotation, polarChart.Core.TotalAnge);
      let scaled = scaler.ToPixelsFromCharPoint(target);
      x = scaled.X;
      y = scaled.Y;
    } else {
      throw new System.NotImplementedException();
    }
    let dx = dataCoordinates.X - x;
    let dy = dataCoordinates.Y - y;
    let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    return distance;
  }
};
let LiveChartsSkiaSharp = _LiveChartsSkiaSharp;
__publicField(LiveChartsSkiaSharp, "DefaultSKTypeface");
class BaseGeometryVisual extends LiveChartsCore.VisualElement {
  constructor() {
    super(...arguments);
    __publicField(this, "_width", 0);
    __publicField(this, "_height", 0);
    __publicField(this, "_fill");
    __publicField(this, "_stroke");
    __publicField(this, "SizeUnit", LiveChartsCore.MeasureUnit.Pixels);
  }
  get Width() {
    return this._width;
  }
  set Width(value) {
    this._width = value;
    this.OnPropertyChanged("Width");
  }
  get Height() {
    return this._height;
  }
  set Height(value) {
    this._height = value;
    this.OnPropertyChanged("Height");
  }
  get Fill() {
    return this._fill;
  }
  set Fill(value) {
    this.SetPaintProperty(new System.Ref(() => this._fill, ($v) => this._fill = $v), value);
  }
  get Stroke() {
    return this._stroke;
  }
  set Stroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._stroke, ($v) => this._stroke = $v), value, true, "Stroke");
  }
  GetPaintTasks() {
    return [this._fill, this._stroke];
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged(propertyName);
  }
}
class LabelVisual extends LiveChartsCore.VisualElement {
  constructor() {
    super(...arguments);
    __publicField(this, "_labelGeometry");
    __publicField(this, "_paint");
    __publicField(this, "_isVirtual", false);
    __publicField(this, "_text", "");
    __publicField(this, "_textSize", 12);
    __publicField(this, "_verticalAlignment", LiveChartsCore.Align.Middle);
    __publicField(this, "_horizontalAlignment", LiveChartsCore.Align.Middle);
    __publicField(this, "_backgroundColor", LiveChartsCore.LvcColor.Empty.Clone());
    __publicField(this, "_padding", LiveChartsCore.Padding.All(0));
    __publicField(this, "_rotation", 0);
    __publicField(this, "_lineHeight", 1.75);
    __publicField(this, "_translate", new LiveChartsCore.LvcPoint().Clone());
    __publicField(this, "_actualSize", new LiveChartsCore.LvcSize().Clone());
    __publicField(this, "_targetPosition", new LiveChartsCore.LvcPoint().Clone());
  }
  get Paint() {
    return this._paint;
  }
  set Paint(value) {
    this.SetPaintProperty(new System.Ref(() => this._paint, ($v) => this._paint = $v), value);
  }
  get Text() {
    return this._text;
  }
  set Text(value) {
    this._text = value;
    this.OnPropertyChanged("Text");
  }
  get TextSize() {
    return this._textSize;
  }
  set TextSize(value) {
    this._textSize = value;
    this.OnPropertyChanged("TextSize");
  }
  get Rotation() {
    return this._rotation;
  }
  set Rotation(value) {
    this._rotation = value;
    this.OnPropertyChanged("Rotation");
  }
  get Translate() {
    return this._translate;
  }
  set Translate(value) {
    this._translate = value.Clone();
    this.OnPropertyChanged("Translate");
  }
  get VerticalAlignment() {
    return this._verticalAlignment;
  }
  set VerticalAlignment(value) {
    this._verticalAlignment = value;
    this.OnPropertyChanged("VerticalAlignment");
  }
  get HorizontalAlignment() {
    return this._horizontalAlignment;
  }
  set HorizontalAlignment(value) {
    this._horizontalAlignment = value;
    this.OnPropertyChanged("HorizontalAlignment");
  }
  get BackgroundColor() {
    return this._backgroundColor;
  }
  set BackgroundColor(value) {
    this._backgroundColor = value.Clone();
    this.OnPropertyChanged("BackgroundColor");
  }
  get Padding() {
    return this._padding;
  }
  set Padding(value) {
    this._padding = value;
    this.OnPropertyChanged("Padding");
  }
  get LineHeight() {
    return this._lineHeight;
  }
  set LineHeight(value) {
    this._lineHeight = value;
    this.OnPropertyChanged("LineHeight");
  }
  GetPaintTasks() {
    return [this._paint];
  }
  AlignToTopLeftCorner() {
    this.VerticalAlignment = LiveChartsCore.Align.Start;
    this.HorizontalAlignment = LiveChartsCore.Align.Start;
  }
  OnInvalidated(chart, primaryScaler, secondaryScaler) {
    let x = this.X;
    let y = this.Y;
    if (this.LocationUnit == LiveChartsCore.MeasureUnit.ChartValues) {
      if (primaryScaler == null || secondaryScaler == null)
        throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);
      x = secondaryScaler.ToPixels(x);
      y = primaryScaler.ToPixels(y);
    }
    this._targetPosition = new LiveChartsCore.LvcPoint(this.X + this._xc, this.Y + this._yc).Clone();
    this.Measure(chart, primaryScaler, secondaryScaler);
    if (this._labelGeometry == null) {
      let cp = this.GetPositionRelativeToParent();
      this._labelGeometry = new LabelGeometry().Init({
        Text: this.Text,
        TextSize: this.TextSize,
        X: cp.X,
        Y: cp.Y,
        RotateTransform: this.Rotation,
        TranslateTransform: this.Translate.Clone(),
        VerticalAlign: this.VerticalAlignment,
        HorizontalAlign: this.HorizontalAlignment,
        Background: this.BackgroundColor.Clone(),
        Padding: this.Padding
      });
      LiveChartsCore.Extensions.TransitionateProperties(this._labelGeometry).WithAnimationFromChart(chart).CompleteCurrentTransitions();
    }
    this._labelGeometry.Text = this.Text;
    this._labelGeometry.TextSize = this.TextSize;
    this._labelGeometry.X = x + this._xc;
    this._labelGeometry.Y = y + this._yc;
    this._labelGeometry.RotateTransform = this.Rotation;
    this._labelGeometry.TranslateTransform = this.Translate.Clone();
    this._labelGeometry.VerticalAlign = this.VerticalAlignment;
    this._labelGeometry.HorizontalAlign = this.HorizontalAlignment;
    this._labelGeometry.Background = this.BackgroundColor.Clone();
    this._labelGeometry.Padding = this.Padding;
    this._labelGeometry.LineHeight = this.LineHeight;
    let drawing = DrawingFluentExtensions.Draw(chart.Canvas);
    if (this.Paint != null)
      drawing.SelectPaint(this.Paint).Draw(this._labelGeometry);
  }
  Measure(chart, primaryScaler, secondaryScaler) {
    let l = this._labelGeometry ?? new LabelGeometry().Init({
      Text: this.Text,
      TextSize: this.TextSize,
      RotateTransform: this.Rotation,
      TranslateTransform: this.Translate.Clone(),
      VerticalAlign: this.VerticalAlignment,
      HorizontalAlign: this.HorizontalAlignment,
      Background: this.BackgroundColor.Clone(),
      Padding: this.Padding
    });
    return this._actualSize = (this._paint == null ? new LiveChartsCore.LvcSize() : l.Measure(this._paint)).Clone();
  }
  GetTargetSize() {
    return this._actualSize;
  }
  GetTargetLocation() {
    let x = this._targetPosition.X;
    let y = this._targetPosition.Y;
    x += this.Translate.X;
    y += this.Translate.Y;
    let size = this.GetTargetSize();
    if (this.HorizontalAlignment == LiveChartsCore.Align.Middle)
      x -= size.Width * 0.5;
    if (this.HorizontalAlignment == LiveChartsCore.Align.End)
      x -= size.Width;
    if (this.VerticalAlignment == LiveChartsCore.Align.Middle)
      y -= size.Height * 0.5;
    if (this.VerticalAlignment == LiveChartsCore.Align.End)
      y -= size.Height;
    return new LiveChartsCore.LvcPoint(x, y);
  }
}
class GeometryVisual extends BaseGeometryVisual {
  constructor(geometryFactory) {
    super();
    __publicField(this, "_geometry");
    __publicField(this, "_actualSize", new LiveChartsCore.LvcSize().Clone());
    __publicField(this, "_targetLocation", new LiveChartsCore.LvcPoint().Clone());
    __publicField(this, "_geometryFactory");
    __publicField(this, "GeometryIntialized", new System.Event());
    this._geometryFactory = geometryFactory;
  }
  Measure(chart, primaryScaler, secondaryScaler) {
    let w = this.Width;
    let h = this.Height;
    if (this.SizeUnit == LiveChartsCore.MeasureUnit.ChartValues) {
      if (primaryScaler == null || secondaryScaler == null)
        throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);
      w = secondaryScaler.MeasureInPixels(w);
      h = primaryScaler.MeasureInPixels(h);
    }
    return this._actualSize = new LiveChartsCore.LvcSize(w, h);
  }
  GetTargetSize() {
    return this._actualSize;
  }
  OnInvalidated(chart, primaryScaler, secondaryScaler) {
    let x = this.X;
    let y = this.Y;
    if (this.LocationUnit == LiveChartsCore.MeasureUnit.ChartValues) {
      if (primaryScaler == null || secondaryScaler == null)
        throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);
      x = secondaryScaler.ToPixels(x);
      y = primaryScaler.ToPixels(y);
    }
    this._targetLocation = new LiveChartsCore.LvcPoint(this.X + this._xc, this.Y + this._yc).Clone();
    this.Measure(chart, primaryScaler, secondaryScaler);
    if (this._geometry == null) {
      let cp = this.GetPositionRelativeToParent();
      this._geometry = this._geometryFactory();
      this._geometry.X = cp.X;
      this._geometry.Y = cp.Y;
      this._geometry.Width = this._actualSize.Width;
      this._geometry.Height = this._actualSize.Height;
      this.GeometryIntialized.Invoke(this._geometry);
      LiveChartsCore.Extensions.TransitionateProperties(this._geometry).WithAnimationFromChart(chart).CompleteCurrentTransitions();
    }
    this._geometry.X = x + this._xc;
    this._geometry.Y = y + this._yc;
    this._geometry.Width = this._actualSize.Width;
    this._geometry.Height = this._actualSize.Height;
    let drawing = DrawingFluentExtensions.Draw(chart.Canvas);
    if (this.Fill != null)
      drawing.SelectPaint(this.Fill).Draw(this._geometry);
    if (this.Stroke != null)
      drawing.SelectPaint(this.Stroke).Draw(this._geometry);
  }
  GetTargetLocation() {
    return this._targetLocation;
  }
}
class VariableGeometryVisual extends BaseGeometryVisual {
  constructor(geometry) {
    super();
    __publicField(this, "_geometry");
    __publicField(this, "_isInitialized", false);
    __publicField(this, "_actualSize", new LiveChartsCore.LvcSize().Clone());
    __publicField(this, "_targetPosition", new LiveChartsCore.LvcPoint().Clone());
    __publicField(this, "GeometryIntialized", new System.Event());
    this._geometry = geometry;
  }
  get Geometry() {
    return this._geometry;
  }
  set Geometry(value) {
    if (this._geometry == value)
      return;
    this._geometry = value;
    this._isInitialized = false;
    this.OnPropertyChanged("Geometry");
  }
  Measure(chart, primaryScaler, secondaryScaler) {
    let w = this.Width;
    let h = this.Height;
    if (this.SizeUnit == LiveChartsCore.MeasureUnit.ChartValues) {
      if (primaryScaler == null || secondaryScaler == null)
        throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);
      w = secondaryScaler.MeasureInPixels(w);
      h = primaryScaler.MeasureInPixels(h);
    }
    return this._actualSize = new LiveChartsCore.LvcSize(w, h);
  }
  GetTargetSize() {
    return this._actualSize;
  }
  OnInvalidated(chart, primaryScaler, secondaryScaler) {
    let x = this.X;
    let y = this.Y;
    if (this.LocationUnit == LiveChartsCore.MeasureUnit.ChartValues) {
      if (primaryScaler == null || secondaryScaler == null)
        throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);
      x = secondaryScaler.ToPixels(x);
      y = primaryScaler.ToPixels(y);
    }
    this._targetPosition = new LiveChartsCore.LvcPoint(this.X + this._xc, this.Y + this._yc).Clone();
    this.Measure(chart, primaryScaler, secondaryScaler);
    if (!this._isInitialized) {
      let cp = this.GetPositionRelativeToParent();
      this.Geometry.X = cp.X;
      this.Geometry.Y = cp.Y;
      this.Geometry.Width = this._actualSize.Width;
      this.Geometry.Height = this._actualSize.Height;
      this.GeometryIntialized.Invoke(this.Geometry);
      LiveChartsCore.Extensions.TransitionateProperties(this.Geometry).WithAnimationFromChart(chart).CompleteCurrentTransitions();
      this._isInitialized = true;
    }
    this.Geometry.X = x + this._xc;
    this.Geometry.Y = y + this._yc;
    this.Geometry.Width = this._actualSize.Width;
    this.Geometry.Height = this._actualSize.Height;
    let drawing = DrawingFluentExtensions.Draw(chart.Canvas);
    if (this.Fill != null)
      drawing.SelectPaint(this.Fill).Draw(this.Geometry);
    if (this.Stroke != null)
      drawing.SelectPaint(this.Stroke).Draw(this.Geometry);
  }
  GetTargetLocation() {
    return this._targetPosition;
  }
}
class VisualElementsExtensions {
  static AsDrawnControl(sketch, baseZIndex = 10050) {
    let relativePanel = new LiveChartsCore.RelativePanel().Init({
      Size: new LiveChartsCore.LvcSize(sketch.Width, sketch.Height)
    });
    for (const schedule of sketch.PaintSchedules) {
      for (const g of schedule.Geometries) {
        let sizedGeometry = g;
        let vgv = new VariableGeometryVisual(sizedGeometry).Init({
          Width: sizedGeometry.Width,
          Height: sizedGeometry.Height
        });
        schedule.PaintTask.ZIndex = schedule.PaintTask.ZIndex + 1 + baseZIndex;
        if (schedule.PaintTask.IsFill)
          vgv.Fill = schedule.PaintTask;
        if (schedule.PaintTask.IsStroke)
          vgv.Stroke = schedule.PaintTask;
        relativePanel.Children.Add(vgv);
      }
    }
    return relativePanel;
  }
}
class StackedStepAreaSeries extends LiveChartsCore.StackedStepAreaSeries {
  constructor() {
    super(() => new CircleGeometry(), () => new LabelGeometry(), () => new StepLineAreaGeometry(), () => new StepPoint(() => new CircleGeometry()));
  }
}
class ColumnSeries extends LiveChartsCore.ColumnSeries {
  constructor() {
    super(() => new RoundedRectangleGeometry(), () => new LabelGeometry());
  }
}
class ThemesExtensions {
  static AddLightTheme(settings, additionalStyles = null) {
    return settings.HasTheme((theme) => {
      LiveChartsCore.LiveCharts.DefaultSettings.WithAnimationsSpeed(System.TimeSpan.FromMilliseconds(800)).WithEasingFunction(LiveChartsCore.EasingFunctions.ExponentialOut);
      let colors = LiveChartsCore.ColorPalletes.MaterialDesign500;
      LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeFillSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPolarLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPieSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForScatterSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForFinancialSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForHeatSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForAxes(theme, (axis) => {
        axis.TextSize = 16;
        axis.ShowSeparatorLines = true;
        axis.NamePaint = new SolidColorPaint().Init({ Color: new PixUI.Color(35, 35, 35) });
        axis.LabelsPaint = new SolidColorPaint().Init({ Color: new PixUI.Color(70, 70, 70) });
        if (LiveChartsCore.IsInterfaceOfICartesianAxis(axis)) {
          const cartesian = axis;
          axis.SeparatorsPaint = cartesian.Orientation == LiveChartsCore.AxisOrientation.X ? null : new SolidColorPaint().Init({ Color: new PixUI.Color(235, 235, 235) });
          cartesian.Padding = LiveChartsCore.Padding.All(12);
        } else {
          axis.SeparatorsPaint = new SolidColorPaint().Init({ Color: new PixUI.Color(235, 235, 235) });
        }
      }), (lineSeries) => {
        let color = ThemesExtensions.GetThemedColor(lineSeries, colors);
        lineSeries.Name = `Series #${lineSeries.SeriesId + 1}`;
        lineSeries.GeometrySize = 12;
        lineSeries.GeometryStroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        lineSeries.GeometryFill = SolidColorPaint.MakeByColor(new PixUI.Color(250, 250, 250));
        lineSeries.Stroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        lineSeries.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(50));
      }), (steplineSeries) => {
        let color = ThemesExtensions.GetThemedColor(steplineSeries, colors);
        steplineSeries.Name = `Series #${steplineSeries.SeriesId + 1}`;
        steplineSeries.GeometrySize = 12;
        steplineSeries.GeometryStroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        steplineSeries.GeometryFill = SolidColorPaint.MakeByColor(new PixUI.Color(250, 250, 250));
        steplineSeries.Stroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        steplineSeries.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(50));
      }), (stackedLine) => {
        let color = ThemesExtensions.GetThemedColor(stackedLine, colors);
        stackedLine.Name = `Series #${stackedLine.SeriesId + 1}`;
        stackedLine.GeometrySize = 0;
        stackedLine.GeometryStroke = null;
        stackedLine.GeometryFill = null;
        stackedLine.Stroke = null;
        stackedLine.Fill = SolidColorPaint.MakeByColor(color);
      }), (barSeries) => {
        let color = ThemesExtensions.GetThemedColor(barSeries, colors);
        barSeries.Name = `Series #${barSeries.SeriesId + 1}`;
        barSeries.Stroke = null;
        barSeries.Fill = SolidColorPaint.MakeByColor(color);
        barSeries.Rx = 4;
        barSeries.Ry = 4;
      }), (stackedBarSeries) => {
        let color = ThemesExtensions.GetThemedColor(stackedBarSeries, colors);
        stackedBarSeries.Name = `Series #${stackedBarSeries.SeriesId + 1}`;
        stackedBarSeries.Stroke = null;
        stackedBarSeries.Fill = SolidColorPaint.MakeByColor(color);
        stackedBarSeries.Rx = 0;
        stackedBarSeries.Ry = 0;
      }), (stackedStep) => {
        let color = ThemesExtensions.GetThemedColor(stackedStep, colors);
        stackedStep.Name = `Series #${stackedStep.SeriesId + 1}`;
        stackedStep.GeometrySize = 0;
        stackedStep.GeometryStroke = null;
        stackedStep.GeometryFill = null;
        stackedStep.Stroke = null;
        stackedStep.Fill = SolidColorPaint.MakeByColor(color);
      }), (heatSeries) => {
      }), (financialSeries) => {
        financialSeries.Name = `Series #${financialSeries.SeriesId + 1}`;
        financialSeries.UpFill = SolidColorPaint.MakeByColor(new PixUI.Color(139, 195, 74, 255));
        financialSeries.UpStroke = SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(139, 195, 74, 255), 3);
        financialSeries.DownFill = SolidColorPaint.MakeByColor(new PixUI.Color(239, 83, 80, 255));
        financialSeries.DownStroke = SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(239, 83, 80, 255), 3);
      }), (scatterSeries) => {
        let color = ThemesExtensions.GetThemedColor(scatterSeries, colors);
        scatterSeries.Name = `Series #${scatterSeries.SeriesId + 1}`;
        scatterSeries.Stroke = null;
        scatterSeries.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(200));
      }), (pieSeries) => {
        let color = ThemesExtensions.GetThemedColor(pieSeries, colors);
        pieSeries.Name = `Series #${pieSeries.SeriesId + 1}`;
        pieSeries.Stroke = null;
        pieSeries.Fill = SolidColorPaint.MakeByColor(color);
      }), (polarLine) => {
        let color = ThemesExtensions.GetThemedColor(polarLine, colors);
        polarLine.Name = `Series #${polarLine.SeriesId + 1}`;
        polarLine.GeometrySize = 12;
        polarLine.GeometryStroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        polarLine.GeometryFill = SolidColorPaint.MakeByColor(new PixUI.Color(250, 250, 250));
        polarLine.Stroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        polarLine.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(50));
      }), (gaugeSeries) => {
        let color = ThemesExtensions.GetThemedColor(gaugeSeries, colors);
        gaugeSeries.Name = `Series #${gaugeSeries.SeriesId + 1}`;
        gaugeSeries.Stroke = null;
        gaugeSeries.Fill = SolidColorPaint.MakeByColor(color);
        gaugeSeries.DataLabelsPosition = LiveChartsCore.PolarLabelsPosition.ChartCenter;
        gaugeSeries.DataLabelsPaint = SolidColorPaint.MakeByColor(new PixUI.Color(70, 70, 70));
      }), (gaugeFill) => {
        gaugeFill.Fill = SolidColorPaint.MakeByColor(new PixUI.Color(30, 30, 30, 10));
      });
      additionalStyles?.call(this, theme);
    });
  }
  static AddDarkTheme(settings, additionalStyles = null) {
    return settings.HasTheme((theme) => {
      LiveChartsCore.LiveCharts.DefaultSettings.WithAnimationsSpeed(System.TimeSpan.FromMilliseconds(800)).WithEasingFunction(LiveChartsCore.EasingFunctions.ExponentialOut).WithTooltipBackgroundPaint(SolidColorPaint.MakeByColor(new PixUI.Color(45, 45, 45))).WithTooltipTextPaint(SolidColorPaint.MakeByColor(new PixUI.Color(245, 245, 245)));
      let colors = LiveChartsCore.ColorPalletes.MaterialDesign200;
      LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeFillSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPolarLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForFinancialSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForHeatSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPieSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForAxes(theme, (axis) => {
        axis.TextSize = 16;
        axis.ShowSeparatorLines = true;
        axis.NamePaint = SolidColorPaint.MakeByColor(new PixUI.Color(235, 235, 235));
        axis.LabelsPaint = SolidColorPaint.MakeByColor(new PixUI.Color(200, 200, 200));
        if (LiveChartsCore.IsInterfaceOfICartesianAxis(axis)) {
          const cartesian = axis;
          axis.SeparatorsPaint = cartesian.Orientation == LiveChartsCore.AxisOrientation.X ? null : SolidColorPaint.MakeByColor(new PixUI.Color(90, 90, 90));
          cartesian.Padding = LiveChartsCore.Padding.All(12);
        } else {
          axis.SeparatorsPaint = SolidColorPaint.MakeByColor(new PixUI.Color(90, 90, 90));
        }
      }), (lineSeries) => {
        let color = ThemesExtensions.GetThemedColor(lineSeries, colors);
        lineSeries.Name = `Series #${lineSeries.SeriesId + 1}`;
        lineSeries.GeometrySize = 12;
        lineSeries.GeometryStroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        lineSeries.GeometryFill = SolidColorPaint.MakeByColor(new PixUI.Color(30, 30, 30));
        lineSeries.Stroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        lineSeries.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(50));
      }), (steplineSeries) => {
        let color = ThemesExtensions.GetThemedColor(steplineSeries, colors);
        steplineSeries.Name = `Series #${steplineSeries.SeriesId + 1}`;
        steplineSeries.GeometrySize = 12;
        steplineSeries.GeometryStroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        steplineSeries.GeometryFill = SolidColorPaint.MakeByColor(new PixUI.Color(30, 30, 30));
        steplineSeries.Stroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        steplineSeries.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(50));
      }), (stackedLine) => {
        let color = ThemesExtensions.GetThemedColor(stackedLine, colors);
        stackedLine.Name = `Series #${stackedLine.SeriesId + 1}`;
        stackedLine.GeometrySize = 0;
        stackedLine.GeometryStroke = null;
        stackedLine.GeometryFill = null;
        stackedLine.Stroke = null;
        stackedLine.Fill = SolidColorPaint.MakeByColor(color);
      }), (barSeries) => {
        let color = ThemesExtensions.GetThemedColor(barSeries, colors);
        barSeries.Name = `Series #${barSeries.SeriesId + 1}`;
        barSeries.Stroke = null;
        barSeries.Fill = SolidColorPaint.MakeByColor(color);
        barSeries.Rx = 4;
        barSeries.Ry = 4;
      }), (stackedBarSeries) => {
        let color = ThemesExtensions.GetThemedColor(stackedBarSeries, colors);
        stackedBarSeries.Name = `Series #${stackedBarSeries.SeriesId + 1}`;
        stackedBarSeries.Stroke = null;
        stackedBarSeries.Fill = SolidColorPaint.MakeByColor(color);
        stackedBarSeries.Rx = 0;
        stackedBarSeries.Ry = 0;
      }), (pieSeries) => {
        let color = ThemesExtensions.GetThemedColor(pieSeries, colors);
        pieSeries.Name = `Series #${pieSeries.SeriesId + 1}`;
        pieSeries.Stroke = null;
        pieSeries.Fill = SolidColorPaint.MakeByColor(color);
      }), (stackedStep) => {
        let color = ThemesExtensions.GetThemedColor(stackedStep, colors);
        stackedStep.Name = `Series #${stackedStep.SeriesId + 1}`;
        stackedStep.GeometrySize = 0;
        stackedStep.GeometryStroke = null;
        stackedStep.GeometryFill = null;
        stackedStep.Stroke = null;
        stackedStep.Fill = SolidColorPaint.MakeByColor(color);
      }), (heatSeries) => {
      }), (financialSeries) => {
        financialSeries.Name = `Series #${financialSeries.SeriesId + 1}`;
        financialSeries.UpFill = SolidColorPaint.MakeByColor(new PixUI.Color(139, 195, 74, 255));
        financialSeries.UpStroke = SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(139, 195, 74, 255), 3);
        financialSeries.DownFill = SolidColorPaint.MakeByColor(new PixUI.Color(239, 83, 80, 255));
        financialSeries.DownStroke = SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(239, 83, 80, 255), 3);
      }), (polarLine) => {
        let color = ThemesExtensions.GetThemedColor(polarLine, colors);
        polarLine.Name = `Series #${polarLine.SeriesId + 1}`;
        polarLine.GeometrySize = 12;
        polarLine.GeometryStroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        polarLine.GeometryFill = SolidColorPaint.MakeByColor(new PixUI.Color(0));
        polarLine.Stroke = SolidColorPaint.MakeByColorAndStroke(color, 4);
        polarLine.Fill = SolidColorPaint.MakeByColor(color.WithAlpha(50));
      }), (gaugeSeries) => {
        let color = ThemesExtensions.GetThemedColor(gaugeSeries, colors);
        gaugeSeries.Name = `Series #${gaugeSeries.SeriesId + 1}`;
        gaugeSeries.Stroke = null;
        gaugeSeries.Fill = SolidColorPaint.MakeByColor(color);
        gaugeSeries.DataLabelsPaint = SolidColorPaint.MakeByColor(new PixUI.Color(200, 200, 200));
      }), (gaugeFill) => {
        gaugeFill.Fill = SolidColorPaint.MakeByColor(new PixUI.Color(255, 255, 255, 30));
      });
      additionalStyles?.call(this, theme);
    });
  }
  static GetThemedColor(series, colors) {
    return LiveChartsSkiaSharp.AsSKColor(colors[series.SeriesId % colors.length]);
  }
}
class PolarLineSeries extends LiveChartsCore.PolarLineSeries {
  constructor() {
    super(() => new CircleGeometry(), () => new LabelGeometry(), () => new CubicBezierAreaGeometry(), () => new BezierPoint(new CircleGeometry()));
  }
}
class GaugeBuilder {
  constructor() {
    __publicField(this, "_keyValuePairs", new System.Dictionary());
    __publicField(this, "_tuples", new System.List());
    __publicField(this, "_builtSeries");
    __publicField(this, "_radialAlign", null);
    __publicField(this, "_innerRadius", null);
    __publicField(this, "_offsetRadius", null);
    __publicField(this, "_backgroundInnerRadius", null);
    __publicField(this, "_backgroundOffsetRadius", null);
    __publicField(this, "_backgroundCornerRadius", null);
    __publicField(this, "_cornerRadius", null);
    __publicField(this, "_background", null);
    __publicField(this, "_labelsSize", null);
    __publicField(this, "_labelsPosition", null);
    __publicField(this, "_backgroundMaxRadialColumnWidth", null);
    __publicField(this, "_maxColumnWidth", null);
    __publicField(this, "_labelFormatter", (point) => point.PrimaryValue.toString());
  }
  get InnerRadius() {
    return this._innerRadius;
  }
  set InnerRadius(value) {
    this._innerRadius = value;
    this.OnPopertyChanged();
  }
  WithInnerRadius(value) {
    this.InnerRadius = value;
    return this;
  }
  get OffsetRadius() {
    return this._offsetRadius;
  }
  set OffsetRadius(value) {
    this._offsetRadius = value;
    this.OnPopertyChanged();
  }
  WithOffsetRadius(value) {
    this.OffsetRadius = value;
    return this;
  }
  get MaxColumnWidth() {
    return this._maxColumnWidth;
  }
  set MaxColumnWidth(value) {
    this._maxColumnWidth = value;
    this.OnPopertyChanged();
  }
  WithMaxColumnWidth(value) {
    this.MaxColumnWidth = value;
    return this;
  }
  get CornerRadius() {
    return this._cornerRadius;
  }
  set CornerRadius(value) {
    this._cornerRadius = value;
    this.OnPopertyChanged();
  }
  WithCornerRadius(value) {
    this.CornerRadius = value;
    return this;
  }
  get RadialAlign() {
    return this._radialAlign;
  }
  set RadialAlign(value) {
    this._radialAlign = value;
    this.OnPopertyChanged();
  }
  WithRadialAlign(value) {
    this.RadialAlign = value;
    return this;
  }
  get BackgroundInnerRadius() {
    return this._backgroundInnerRadius;
  }
  set BackgroundInnerRadius(value) {
    this._backgroundInnerRadius = value;
    this.OnPopertyChanged();
  }
  WithBackgroundInnerRadius(value) {
    this.BackgroundInnerRadius = value;
    return this;
  }
  get BackgroundOffsetRadius() {
    return this._backgroundOffsetRadius;
  }
  set BackgroundOffsetRadius(value) {
    this._backgroundOffsetRadius = value;
    this.OnPopertyChanged();
  }
  WithBackgroundOffsetRadius(value) {
    this.BackgroundOffsetRadius = value;
    return this;
  }
  get BackgroundMaxRadialColumnWidth() {
    return this._backgroundMaxRadialColumnWidth;
  }
  set BackgroundMaxRadialColumnWidth(value) {
    this._backgroundMaxRadialColumnWidth = value;
    this.OnPopertyChanged();
  }
  WithBackgroundMaxRadialColumnWidth(value) {
    this.BackgroundMaxRadialColumnWidth = value;
    return this;
  }
  get BackgroundCornerRadius() {
    return this._backgroundCornerRadius;
  }
  set BackgroundCornerRadius(value) {
    this._backgroundCornerRadius = value;
    this.OnPopertyChanged();
  }
  WithBackgroundCornerRadius(value) {
    this.BackgroundMaxRadialColumnWidth = value;
    return this;
  }
  get Background() {
    return this._background;
  }
  set Background(value) {
    this._background = value;
    this.OnPopertyChanged();
  }
  WithBackground(value) {
    this.Background = value;
    return this;
  }
  get LabelsSize() {
    return this._labelsSize;
  }
  set LabelsSize(value) {
    this._labelsSize = value;
    this.OnPopertyChanged();
  }
  WithLabelsSize(value) {
    this.LabelsSize = value;
    return this;
  }
  get LabelsPosition() {
    return this._labelsPosition;
  }
  set LabelsPosition(value) {
    this._labelsPosition = value;
    this.OnPopertyChanged();
  }
  WithLabelsPosition(value) {
    this.LabelsPosition = value;
    return this;
  }
  get LabelFormatter() {
    return this._labelFormatter;
  }
  set LabelFormatter(value) {
    this._labelFormatter = value;
    this.OnPopertyChanged();
  }
  WithLabelFormatter(value) {
    this.LabelFormatter = value;
    return this;
  }
  AddValue1(value, seriesName, seriesPaint, labelsPaint = null) {
    this._tuples.Add(new System.Tuple4(value, seriesName, seriesPaint, labelsPaint));
    return this;
  }
  AddValue2(value, seriesName, seriesColor, labelsColor = null) {
    labelsColor ?? (labelsColor = new PixUI.Color(35, 35, 35));
    return this.AddValue1(value, seriesName, new SolidColorPaint().Init({ Color: seriesColor }), new SolidColorPaint().Init({ Color: labelsColor }));
  }
  AddValue3(value, seriesName, seriesColor, labelsColor = null) {
    return this.AddValue2(new LiveChartsCore.ObservableValue(value), seriesName, seriesColor, labelsColor);
  }
  AddValue4(value) {
    return this.AddValue1(value, null, null, null);
  }
  AddValue5(value) {
    return this.AddValue4(new LiveChartsCore.ObservableValue(value));
  }
  AddValue6(value, seriesName) {
    return this.AddValue1(value, seriesName, null, null);
  }
  AddValue7(value, seriesName) {
    return this.AddValue6(new LiveChartsCore.ObservableValue(value), seriesName);
  }
  BuildSeries() {
    let series = new System.List();
    let i = 0;
    for (const item of this._tuples) {
      let list = new System.List();
      while (list.length < this._tuples.length - 1) {
        list.Add(new LiveChartsCore.ObservableValue(null));
      }
      list.Insert(i, item.Item1);
      let sf = new PieSeries(true).Init({
        ZIndex: i + 1,
        Values: list,
        Name: item.Item2,
        HoverPushout: 0
      });
      if (item.Item3 != null)
        sf.Fill = item.Item3;
      if (item.Item4 != null)
        sf.DataLabelsPaint = item.Item4;
      if (this.LabelFormatter != null)
        sf.DataLabelsFormatter = this.LabelFormatter;
      sf.Stroke;
      this.ApplyStyles(sf);
      series.Add(sf);
      this._keyValuePairs.Add(sf, item);
      i++;
    }
    let fillSeriesValues = new System.List();
    while (fillSeriesValues.length < this._tuples.length)
      fillSeriesValues.Add(new LiveChartsCore.ObservableValue(0));
    let s = new PieSeries(true, true).Init({
      ZIndex: -1,
      IsFillSeries: true,
      Values: fillSeriesValues
    });
    this.ApplyStyles(s);
    series.Add(s);
    this._builtSeries = series;
    return series;
  }
  ApplyStyles(series) {
    if ((series.SeriesProperties & LiveChartsCore.SeriesProperties.GaugeFill) == LiveChartsCore.SeriesProperties.GaugeFill) {
      this.ApplyStylesToFill(series);
      return;
    }
    this.ApplyStylesToSeries(series);
  }
  ApplyStylesToFill(series) {
    if (this.Background != null)
      series.Fill = this.Background;
    if (this.BackgroundInnerRadius != null)
      series.InnerRadius = this.BackgroundInnerRadius;
    if (this.BackgroundOffsetRadius != null) {
      series.RelativeOuterRadius = this.BackgroundOffsetRadius;
      series.RelativeInnerRadius = this.BackgroundOffsetRadius;
    }
    if (this.BackgroundMaxRadialColumnWidth != null)
      series.MaxRadialColumnWidth = this.BackgroundMaxRadialColumnWidth;
    if (this.RadialAlign != null)
      series.RadialAlign = this.RadialAlign;
  }
  ApplyStylesToSeries(series) {
    let t;
    if (this._keyValuePairs.TryGetValue(series, new System.Out(() => t, ($v) => t = $v))) {
      if (t.Item3 != null)
        series.Fill = t.Item3;
    }
    if (this.LabelsSize != null)
      series.DataLabelsSize = this.LabelsSize;
    if (this.LabelsPosition != null)
      series.DataLabelsPosition = this.LabelsPosition;
    if (this.InnerRadius != null)
      series.InnerRadius = this.InnerRadius;
    if (this.OffsetRadius != null) {
      series.RelativeInnerRadius = this.OffsetRadius;
      series.RelativeOuterRadius = this.OffsetRadius;
    }
    if (this.MaxColumnWidth != null)
      series.MaxRadialColumnWidth = this.MaxColumnWidth;
    if (this.RadialAlign != null)
      series.RadialAlign = this.RadialAlign;
    series.DataLabelsFormatter = this.LabelFormatter;
  }
  OnPopertyChanged() {
    if (this._builtSeries == null)
      return;
    for (const item of this._builtSeries) {
      this.ApplyStyles(item);
    }
  }
}
class SKMatrixMotionProperty extends LiveChartsCore.MotionProperty {
  constructor(propertyName, matrix) {
    super(propertyName);
    this.fromValue = matrix.Clone();
    this.toValue = matrix.Clone();
  }
  OnGetMovement(progress) {
    return new PixUI.Matrix4(this.fromValue.M0 + progress * (this.toValue.M0 - this.fromValue.M0), this.fromValue.M1 + progress * (this.toValue.M1 - this.fromValue.M1), this.fromValue.M2 + progress * (this.toValue.M2 - this.fromValue.M2), this.fromValue.M3 + progress * (this.toValue.M3 - this.fromValue.M3), this.fromValue.M4 + progress * (this.toValue.M4 - this.fromValue.M4), this.fromValue.M5 + progress * (this.toValue.M5 - this.fromValue.M5), this.fromValue.M6 + progress * (this.toValue.M6 - this.fromValue.M6), this.fromValue.M7 + progress * (this.toValue.M7 - this.fromValue.M7), this.fromValue.M8 + progress * (this.toValue.M8 - this.fromValue.M8), this.fromValue.M9 + progress * (this.toValue.M9 - this.fromValue.M9), this.fromValue.M10 + progress * (this.toValue.M10 - this.fromValue.M10), this.fromValue.M11 + progress * (this.toValue.M11 - this.fromValue.M11), this.fromValue.M12 + progress * (this.toValue.M12 - this.fromValue.M12), this.fromValue.M13 + progress * (this.toValue.M13 - this.fromValue.M13), this.fromValue.M14 + progress * (this.toValue.M14 - this.fromValue.M14), this.fromValue.M15 + progress * (this.toValue.M15 - this.fromValue.M15));
  }
}
class Paint extends LiveChartsCore.Animatable {
  constructor() {
    super();
    __publicField(this, "_strokeMiterTransition");
    __publicField(this, "_geometriesByCanvas", new System.Dictionary());
    __publicField(this, "_clipRectangles", new System.Dictionary());
    __publicField(this, "_matchesChar", null);
    __publicField(this, "_skiaPaint");
    __publicField(this, "_strokeWidthTransition");
    __publicField(this, "_fontFamily");
    __publicField(this, "ZIndex", 0);
    __publicField(this, "Style", CanvasKit.PaintStyle.Fill);
    __publicField(this, "IsStroke", false);
    __publicField(this, "IsFill", false);
    __publicField(this, "SKFontStyle");
    __publicField(this, "SKTypeface");
    __publicField(this, "IsAntialias", true);
    __publicField(this, "StrokeCap", CanvasKit.StrokeCap.Butt);
    __publicField(this, "StrokeJoin", CanvasKit.StrokeJoin.Miter);
    __publicField(this, "Color", PixUI.Color.Empty.Clone());
    __publicField(this, "IsPaused", false);
    __publicField(this, "PathEffect");
    __publicField(this, "ImageFilter");
    this._strokeWidthTransition = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StrokeThickness", 0));
    this._strokeMiterTransition = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StrokeMiter", 0));
  }
  get StrokeThickness() {
    return this._strokeWidthTransition.GetMovement(this);
  }
  set StrokeThickness(value) {
    this._strokeWidthTransition.SetMovement(value, this);
  }
  get FontFamily() {
    return this._fontFamily;
  }
  set FontFamily(value) {
    this._fontFamily = value;
  }
  get HasCustomFont() {
    return LiveChartsSkiaSharp.DefaultSKTypeface != null || this.FontFamily != null || this.SKTypeface != null || this.SKFontStyle != null;
  }
  get StrokeMiter() {
    return this._strokeMiterTransition.GetMovement(this);
  }
  set StrokeMiter(value) {
    this._strokeMiterTransition.SetMovement(value, this);
  }
  GetGeometries(canvas) {
    const _$generator = function* (canvas2) {
      let enumerable = this.GetGeometriesByCanvas(canvas2);
      if (enumerable == null)
        return;
      for (const item of enumerable) {
        yield item;
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(canvas));
  }
  SetGeometries(canvas, geometries) {
    this._geometriesByCanvas.SetAt(canvas.Sync, geometries);
    this.IsValid = false;
  }
  AddGeometryToPaintTask(canvas, geometry) {
    let g = this.GetGeometriesByCanvas(canvas);
    if (g == null) {
      g = new System.HashSet();
      this._geometriesByCanvas.SetAt(canvas.Sync, g);
    }
    g.Add(geometry);
    this.IsValid = false;
  }
  RemoveGeometryFromPainTask(canvas, geometry) {
    this.GetGeometriesByCanvas(canvas)?.Remove(geometry);
    this.IsValid = false;
  }
  ClearGeometriesFromPaintTask(canvas) {
    this.GetGeometriesByCanvas(canvas)?.Clear();
    this.IsValid = false;
  }
  ReleaseCanvas(canvas) {
    this._geometriesByCanvas.Remove(canvas);
  }
  GetClipRectangle(canvas) {
    let clip;
    return this._clipRectangles.TryGetValue(canvas.Sync, new System.Out(() => clip, ($v) => clip = $v)) ? clip : LiveChartsCore.LvcRectangle.Empty;
  }
  SetClipRectangle(canvas, value) {
    this._clipRectangles.SetAt(canvas.Sync, value);
  }
  Dispose() {
    this._skiaPaint?.delete();
    this._skiaPaint = null;
  }
  GetSKTypeface() {
    return null;
  }
  GetGeometriesByCanvas(canvas) {
    let geometries;
    return this._geometriesByCanvas.TryGetValue(canvas.Sync, new System.Out(() => geometries, ($v) => geometries = $v)) ? geometries : null;
  }
}
const _LinearGradientPaint = class extends Paint {
  constructor(gradientStops, startPoint, endPoint, colorPos = null, tileMode = CanvasKit.TileMode.Repeat) {
    super();
    __publicField(this, "_gradientStops");
    __publicField(this, "_startPoint");
    __publicField(this, "_endPoint");
    __publicField(this, "_colorPos");
    __publicField(this, "_tileMode");
    __publicField(this, "_drawingContext");
    this._gradientStops = gradientStops;
    this._startPoint = startPoint.Clone();
    this._endPoint = endPoint.Clone();
    this._colorPos = colorPos;
    this._tileMode = tileMode;
  }
  CloneTask() {
    return new _LinearGradientPaint(this._gradientStops, this._startPoint.Clone(), this._endPoint.Clone(), this._colorPos, this._tileMode).Init({
      Style: this.Style,
      IsStroke: this.IsStroke,
      IsFill: this.IsFill,
      Color: this.Color,
      IsAntialias: this.IsAntialias,
      StrokeThickness: this.StrokeThickness,
      StrokeCap: this.StrokeCap,
      StrokeJoin: this.StrokeJoin,
      StrokeMiter: this.StrokeMiter,
      FontFamily: this.FontFamily,
      SKFontStyle: this.SKFontStyle,
      SKTypeface: this.SKTypeface,
      PathEffect: this.PathEffect?.Clone(),
      ImageFilter: this.ImageFilter?.Clone()
    });
  }
  ApplyOpacityMask(context, geometry) {
    throw new System.NotImplementedException();
  }
  RestoreOpacityMask(context, geometry) {
    throw new System.NotImplementedException();
  }
  InitializeTask(drawingContext) {
    this._skiaPaint ?? (this._skiaPaint = new CanvasKit.Paint());
    let size = this.GetDrawRectangleSize(drawingContext);
    let xf = size.Left;
    let xt = xf + size.Width;
    let yf = size.Top;
    let yt = yf + size.Height;
    let start = new PixUI.Point(xf + (xt - xf) * this._startPoint.X, yf + (yt - yf) * this._startPoint.Y);
    let end = new PixUI.Point(xf + (xt - xf) * this._endPoint.X, yf + (yt - yf) * this._endPoint.Y);
    this._skiaPaint.setShader(CanvasKit.Shader.MakeLinearGradient(start.Clone(), end.Clone(), this._gradientStops, this._colorPos == null ? null : Array.from(this._colorPos), this._tileMode));
    this._skiaPaint.setAntiAlias(this.IsAntialias);
    this._skiaPaint.setStyle(CanvasKit.PaintStyle.Stroke);
    this._skiaPaint.setStrokeWidth(this.StrokeThickness);
    this._skiaPaint.setStrokeCap(this.StrokeCap);
    this._skiaPaint.setStrokeJoin(this.StrokeJoin);
    this._skiaPaint.setStrokeMiter(this.StrokeMiter);
    this._skiaPaint.setStyle(this.IsStroke ? CanvasKit.PaintStyle.Stroke : CanvasKit.PaintStyle.Fill);
    if (this.PathEffect != null) {
      this.PathEffect.CreateEffect(drawingContext);
      this._skiaPaint.setPathEffect(this.PathEffect.SKPathEffect);
    }
    if (this.ImageFilter != null) {
      this.ImageFilter.CreateFilter(drawingContext);
      this._skiaPaint.setImageFilter(this.ImageFilter.SKImageFilter);
    }
    let clip = this.GetClipRectangle(drawingContext.MotionCanvas);
    if (System.OpInequality(clip, LiveChartsCore.LvcRectangle.Empty)) {
      drawingContext.Canvas.save();
      drawingContext.Canvas.clipRect(PixUI.Rect.FromLTWH(clip.X, clip.Y, clip.Width, clip.Height), CanvasKit.ClipOp.Intersect, true);
      this._drawingContext = drawingContext;
    }
    drawingContext.Paint = this._skiaPaint;
    drawingContext.PaintTask = this;
  }
  Dispose() {
    this.PathEffect?.Dispose();
    this.ImageFilter?.Dispose();
    if (this._drawingContext != null && System.OpInequality(this.GetClipRectangle(this._drawingContext.MotionCanvas), LiveChartsCore.LvcRectangle.Empty)) {
      this._drawingContext.Canvas.restore();
      this._drawingContext = null;
    }
    super.Dispose();
  }
  GetDrawRectangleSize(drawingContext) {
    let clip = this.GetClipRectangle(drawingContext.MotionCanvas);
    return System.OpEquality(clip, LiveChartsCore.LvcRectangle.Empty) ? new PixUI.Rect(0, 0, drawingContext.Width, drawingContext.Width) : new PixUI.Rect(clip.X, clip.Y, clip.X + clip.Width, clip.Y + clip.Height);
  }
};
let LinearGradientPaint = _LinearGradientPaint;
__publicField(LinearGradientPaint, "s_defaultStartPoint", new PixUI.Point(0, 0.5).Clone());
__publicField(LinearGradientPaint, "s_defaultEndPoint", new PixUI.Point(1, 0.5).Clone());
class SolidColorPaint extends Paint {
  constructor() {
    super();
    __publicField(this, "_drawingContext");
  }
  static MakeByColor(color) {
    return new SolidColorPaint().Init({ Color: color });
  }
  static MakeByColorAndStroke(color, strokeWidth) {
    let p = new SolidColorPaint();
    p._strokeWidthTransition = p.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StrokeThickness", strokeWidth));
    p.Color = color;
    return p;
  }
  CloneTask() {
    let clone = new SolidColorPaint().Init({
      Style: this.Style,
      IsStroke: this.IsStroke,
      IsFill: this.IsFill,
      Color: this.Color,
      IsAntialias: this.IsAntialias,
      StrokeThickness: this.StrokeThickness,
      StrokeCap: this.StrokeCap,
      StrokeJoin: this.StrokeJoin,
      StrokeMiter: this.StrokeMiter,
      FontFamily: this.FontFamily,
      SKFontStyle: this.SKFontStyle,
      SKTypeface: this.SKTypeface,
      PathEffect: this.PathEffect?.Clone(),
      ImageFilter: this.ImageFilter?.Clone()
    });
    return clone;
  }
  InitializeTask(drawingContext) {
    this._skiaPaint ?? (this._skiaPaint = new CanvasKit.Paint());
    this._skiaPaint.setColor(this.Color);
    this._skiaPaint.setAntiAlias(this.IsAntialias);
    this._skiaPaint.setStyle(this.IsStroke ? CanvasKit.PaintStyle.Stroke : CanvasKit.PaintStyle.Fill);
    this._skiaPaint.setStrokeCap(this.StrokeCap);
    this._skiaPaint.setStrokeJoin(this.StrokeJoin);
    this._skiaPaint.setStrokeMiter(this.StrokeMiter);
    this._skiaPaint.setStrokeWidth(this.StrokeThickness);
    this._skiaPaint.setStyle(this.IsStroke ? CanvasKit.PaintStyle.Stroke : CanvasKit.PaintStyle.Fill);
    if (this.PathEffect != null) {
      this.PathEffect.CreateEffect(drawingContext);
      this._skiaPaint.setPathEffect(this.PathEffect.SKPathEffect);
    }
    if (this.ImageFilter != null) {
      this.ImageFilter.CreateFilter(drawingContext);
      this._skiaPaint.setImageFilter(this.ImageFilter.SKImageFilter);
    }
    let clip = this.GetClipRectangle(drawingContext.MotionCanvas);
    if (System.OpInequality(clip, LiveChartsCore.LvcRectangle.Empty)) {
      drawingContext.Canvas.save();
      drawingContext.Canvas.clipRect(PixUI.Rect.FromLTWH(clip.X, clip.Y, clip.Width, clip.Height), CanvasKit.ClipOp.Intersect, true);
      this._drawingContext = drawingContext;
    }
    drawingContext.Paint = this._skiaPaint;
    drawingContext.PaintTask = this;
  }
  ApplyOpacityMask(context, geometry) {
    if (context.PaintTask == null || context.Paint == null)
      return;
    let baseColor = context.PaintTask.Color;
    context.Paint.setColor(new PixUI.Color(baseColor.Red, baseColor.Green, baseColor.Blue, Math.floor(255 * geometry.Opacity) & 255));
  }
  RestoreOpacityMask(context, geometry) {
    if (context.PaintTask == null || context.Paint == null)
      return;
    let baseColor = context.PaintTask.Color;
    context.Paint.setColor(baseColor);
  }
  Dispose() {
    this.PathEffect?.Dispose();
    this.ImageFilter?.Dispose();
    if (this._drawingContext != null && System.OpInequality(this.GetClipRectangle(this._drawingContext.MotionCanvas), LiveChartsCore.LvcRectangle.Empty)) {
      this._drawingContext.Canvas.restore();
      this._drawingContext = null;
    }
    super.Dispose();
  }
}
class PaintTask extends Paint {
}
class RadialGradientPaint extends Paint {
  constructor(gradientStops, center = null, radius = 0.5, colorPos = null, tileMode = CanvasKit.TileMode.Repeat) {
    super();
    __publicField(this, "_drawingContext");
    __publicField(this, "_gradientStops");
    __publicField(this, "_center");
    __publicField(this, "_radius");
    __publicField(this, "_colorPos");
    __publicField(this, "_tileMode");
    this._gradientStops = gradientStops;
    if (center == null)
      this._center = new PixUI.Point(0.5, 0.5);
    this._radius = radius;
    this._colorPos = colorPos;
    this._tileMode = tileMode;
  }
  CloneTask() {
    return new RadialGradientPaint(this._gradientStops, this._center.Clone(), this._radius, this._colorPos, this._tileMode).Init({
      Style: this.Style,
      IsStroke: this.IsStroke,
      IsFill: this.IsFill,
      Color: this.Color,
      IsAntialias: this.IsAntialias,
      StrokeThickness: this.StrokeThickness,
      StrokeCap: this.StrokeCap,
      StrokeJoin: this.StrokeJoin,
      StrokeMiter: this.StrokeMiter,
      FontFamily: this.FontFamily,
      SKFontStyle: this.SKFontStyle,
      SKTypeface: this.SKTypeface,
      PathEffect: this.PathEffect?.Clone(),
      ImageFilter: this.ImageFilter?.Clone()
    });
  }
  InitializeTask(drawingContext) {
    this._skiaPaint ?? (this._skiaPaint = new CanvasKit.Paint());
    let size = this.GetDrawRectangleSize(drawingContext);
    let center = new PixUI.Point(size.Left + this._center.X * size.Width, size.Top + this._center.Y * size.Height);
    let r = size.Left + size.Width > size.Top + size.Height ? size.Top + size.Height : size.Left + size.Width;
    r *= this._radius;
    this._skiaPaint.setShader(CanvasKit.Shader.MakeRadialGradient(center.Clone(), r, this._gradientStops, this._colorPos == null ? null : Array.from(this._colorPos), this._tileMode));
    this._skiaPaint.setAntiAlias(this.IsAntialias);
    this._skiaPaint.setStyle(CanvasKit.PaintStyle.Stroke);
    this._skiaPaint.setStrokeWidth(this.StrokeThickness);
    this._skiaPaint.setStrokeCap(this.StrokeCap);
    this._skiaPaint.setStrokeJoin(this.StrokeJoin);
    this._skiaPaint.setStrokeMiter(this.StrokeMiter);
    this._skiaPaint.setStyle(this.IsStroke ? CanvasKit.PaintStyle.Stroke : CanvasKit.PaintStyle.Fill);
    if (this.PathEffect != null) {
      this.PathEffect.CreateEffect(drawingContext);
      this._skiaPaint.setPathEffect(this.PathEffect.SKPathEffect);
    }
    if (this.ImageFilter != null) {
      this.ImageFilter.CreateFilter(drawingContext);
      this._skiaPaint.setImageFilter(this.ImageFilter.SKImageFilter);
    }
    let clip = this.GetClipRectangle(drawingContext.MotionCanvas);
    if (System.OpInequality(clip, LiveChartsCore.LvcRectangle.Empty)) {
      drawingContext.Canvas.save();
      drawingContext.Canvas.clipRect(PixUI.Rect.FromLTWH(clip.X, clip.Y, clip.Width, clip.Height), CanvasKit.ClipOp.Intersect, true);
      this._drawingContext = drawingContext;
    }
    drawingContext.Paint = this._skiaPaint;
    drawingContext.PaintTask = this;
  }
  RestoreOpacityMask(context, geometry) {
    throw new System.NotImplementedException();
  }
  ApplyOpacityMask(context, geometry) {
    throw new System.NotImplementedException();
  }
  Dispose() {
    this.PathEffect?.Dispose();
    this.ImageFilter?.Dispose();
    if (this._drawingContext != null && System.OpInequality(this.GetClipRectangle(this._drawingContext.MotionCanvas), LiveChartsCore.LvcRectangle.Empty)) {
      this._drawingContext.Canvas.restore();
      this._drawingContext = null;
    }
    super.Dispose();
  }
  GetDrawRectangleSize(drawingContext) {
    let clip = this.GetClipRectangle(drawingContext.MotionCanvas);
    return System.OpEquality(clip, LiveChartsCore.LvcRectangle.Empty) ? new PixUI.Rect(0, 0, drawingContext.Width, drawingContext.Width) : new PixUI.Rect(clip.X, clip.Y, clip.Width, clip.Height);
  }
}
const _SKDefaultLegend = class {
  constructor() {
    __publicField(this, "_orientation", LiveChartsCore.ContainerOrientation.Vertical);
    __publicField(this, "_stackPanel");
    __publicField(this, "_activeSeries", new DoubleDict());
    __publicField(this, "_toRemoveSeries", new System.List());
    __publicField(this, "_backgroundPaint");
    __publicField(this, "Size", LiveChartsCore.LvcSize.Empty.Clone());
    __publicField(this, "FontPaint");
    __publicField(this, "TextSize", 15);
    this.FontPaint = new SolidColorPaint().Init({ Color: new PixUI.Color(30, 30, 30, 255) });
  }
  get BackgroundPaint() {
    return this._backgroundPaint;
  }
  set BackgroundPaint(value) {
    this._backgroundPaint = value;
    if (value != null) {
      value.IsFill = true;
    }
  }
  Draw(chart) {
    if (chart.Legend == null || chart.LegendPosition == LiveChartsCore.LegendPosition.Hidden)
      return;
    this.Measure(chart);
    if (this._stackPanel == null)
      return;
    if (this.BackgroundPaint != null)
      this.BackgroundPaint.ZIndex = _SKDefaultLegend.s_zIndex;
    if (this.FontPaint != null)
      this.FontPaint.ZIndex = _SKDefaultLegend.s_zIndex + 1;
    let actualChartSize = chart.ControlSize.Clone();
    let iDontKnowWhyThis = 17;
    if (chart.LegendPosition == LiveChartsCore.LegendPosition.Top) {
      chart.Canvas.StartPoint = new LiveChartsCore.LvcPoint(0, this.Size.Height);
      this._stackPanel.X = actualChartSize.Width * 0.5 - this.Size.Width * 0.5;
      this._stackPanel.Y = -this.Size.Height;
    }
    if (chart.LegendPosition == LiveChartsCore.LegendPosition.Bottom) {
      this._stackPanel.X = actualChartSize.Width * 0.5 - this.Size.Width * 0.5;
      this._stackPanel.Y = actualChartSize.Height;
    }
    if (chart.LegendPosition == LiveChartsCore.LegendPosition.Left) {
      chart.Canvas.StartPoint = new LiveChartsCore.LvcPoint(this.Size.Width, 0);
      this._stackPanel.X = -this.Size.Width;
      this._stackPanel.Y = actualChartSize.Height * 0.5 - this.Size.Height * 0.5;
    }
    if (chart.LegendPosition == LiveChartsCore.LegendPosition.Right) {
      this._stackPanel.X = actualChartSize.Width - iDontKnowWhyThis;
      this._stackPanel.Y = actualChartSize.Height * 0.5 - this.Size.Height * 0.5;
    }
    chart.AddVisual(this._stackPanel);
    for (const visual of this._toRemoveSeries) {
      let series;
      this._stackPanel.Children.Remove(visual);
      chart.RemoveVisual(visual);
      if (this._activeSeries.TryGetKey(visual, new System.Out(() => series, ($v) => series = $v)))
        this._activeSeries.Remove(series);
    }
  }
  BuildLayout(chart) {
    if (chart.View.LegendBackgroundPaint != null)
      this.BackgroundPaint = chart.View.LegendBackgroundPaint;
    if (chart.View.LegendTextPaint != null)
      this.FontPaint = chart.View.LegendTextPaint;
    if (chart.View.LegendTextSize != null)
      this.TextSize = chart.View.LegendTextSize;
    this._orientation = chart.LegendPosition == LiveChartsCore.LegendPosition.Left || chart.LegendPosition == LiveChartsCore.LegendPosition.Right ? LiveChartsCore.ContainerOrientation.Vertical : LiveChartsCore.ContainerOrientation.Horizontal;
    this._stackPanel ?? (this._stackPanel = new LiveChartsCore.StackPanel(() => new RoundedRectangleGeometry()).Init({
      Padding: LiveChartsCore.Padding.All(0),
      HorizontalAlignment: LiveChartsCore.Align.Start,
      VerticalAlignment: LiveChartsCore.Align.Middle
    }));
    this._stackPanel.Orientation = this._orientation;
    this._stackPanel.BackgroundPaint = this.BackgroundPaint;
    this._toRemoveSeries = new System.List(this._stackPanel.Children);
    for (const series of chart.ChartSeries) {
      if (!series.IsVisibleAtLegend)
        continue;
      let seriesMiniatureVisual = this.GetSeriesVisual(series);
      this._toRemoveSeries.Remove(seriesMiniatureVisual);
    }
  }
  Measure(chart) {
    let skiaChart = chart;
    this.BuildLayout(skiaChart);
    if (this._stackPanel == null)
      return;
    this.Size = this._stackPanel.Measure(skiaChart, null, null);
  }
  GetSeriesVisual(series) {
    let seriesPanel;
    if (this._activeSeries.TryGetValue(series, new System.Out(() => seriesPanel, ($v) => seriesPanel = $v)))
      return seriesPanel;
    let sketch = series.GetMiniatresSketch();
    let relativePanel = VisualElementsExtensions.AsDrawnControl(sketch);
    let sp = new LiveChartsCore.StackPanel(() => new RoundedRectangleGeometry()).Init({
      Padding: new LiveChartsCore.Padding(15, 4, 15, 4),
      VerticalAlignment: LiveChartsCore.Align.Middle,
      HorizontalAlignment: LiveChartsCore.Align.Middle
    });
    sp.Children.Add(relativePanel);
    sp.Children.Add(new LabelVisual().Init({
      Text: series.Name ?? "",
      Paint: this.FontPaint,
      TextSize: this.TextSize,
      Padding: new LiveChartsCore.Padding(8, 0, 0, 0),
      VerticalAlignment: LiveChartsCore.Align.Start,
      HorizontalAlignment: LiveChartsCore.Align.Start
    }));
    this._stackPanel?.Children.Add(sp);
    this._activeSeries.Add(series, sp);
    return sp;
  }
};
let SKDefaultLegend = _SKDefaultLegend;
__publicField(SKDefaultLegend, "$meta_LiveChartsCore_IImageControl", true);
__publicField(SKDefaultLegend, "s_zIndex", 10050);
const _SKDefaultTooltip = class {
  constructor() {
    __publicField(this, "_chart");
    __publicField(this, "_backgroundPaint");
    __publicField(this, "_stackPanel");
    __publicField(this, "_seriesVisualsMap", new System.Dictionary());
    __privateAdd(this, _Size, LiveChartsCore.LvcSize.Empty.Clone());
    __publicField(this, "FontPaint");
    __publicField(this, "TextSize", 16);
    this.FontPaint = new SolidColorPaint().Init({ Color: new PixUI.Color(28, 49, 58) });
    this.BackgroundPaint = new SolidColorPaint().Init({
      Color: new PixUI.Color(240, 240, 240),
      ImageFilter: new DropShadow(2, 2, 2, 2, new PixUI.Color(30, 30, 30, 60))
    });
  }
  get Size() {
    return __privateGet(this, _Size);
  }
  set Size(value) {
    __privateSet(this, _Size, value);
  }
  get BackgroundPaint() {
    return this._backgroundPaint;
  }
  set BackgroundPaint(value) {
    this._backgroundPaint = value;
    if (value != null) {
      value.IsFill = true;
    }
  }
  Show(foundPoints, chart) {
    this._chart = chart;
    if (chart.View.TooltipBackgroundPaint != null)
      this.BackgroundPaint = chart.View.TooltipBackgroundPaint;
    if (chart.View.TooltipTextPaint != null)
      this.FontPaint = chart.View.TooltipTextPaint;
    if (chart.View.TooltipTextSize != null)
      this.TextSize = chart.View.TooltipTextSize;
    if (this.BackgroundPaint != null)
      this.BackgroundPaint.ZIndex = _SKDefaultTooltip.s_zIndex;
    if (this.FontPaint != null)
      this.FontPaint.ZIndex = _SKDefaultTooltip.s_zIndex + 1;
    let sp = this._stackPanel ?? (this._stackPanel = new LiveChartsCore.StackPanel(() => new RoundedRectangleGeometry()).Init({
      Padding: new LiveChartsCore.Padding(12, 8, 12, 8),
      Orientation: LiveChartsCore.ContainerOrientation.Vertical,
      HorizontalAlignment: LiveChartsCore.Align.Start,
      VerticalAlignment: LiveChartsCore.Align.Middle,
      BackgroundPaint: this.BackgroundPaint
    }));
    let toRemoveSeries = new System.List(this._seriesVisualsMap.Values);
    for (const point of foundPoints) {
      let seriesMiniatureVisual = this.GetSeriesVisual(point);
      toRemoveSeries.Remove(seriesMiniatureVisual);
    }
    this.Measure(chart);
    let location = LiveChartsCore.Extensions.GetTooltipLocation(foundPoints, this.Size.Clone(), chart);
    this._stackPanel.X = location.X;
    this._stackPanel.Y = location.Y;
    for (const seriesVisual of toRemoveSeries) {
      this._stackPanel.Children.Remove(seriesVisual.Visual);
      chart.RemoveVisual(seriesVisual.Visual);
      this._seriesVisualsMap.Remove(seriesVisual.Series);
    }
    chart.AddVisual(sp);
  }
  Hide() {
    if (this._chart == null || this._stackPanel == null)
      return;
    this._chart.RemoveVisual(this._stackPanel);
  }
  Measure(chart) {
    if (this._stackPanel == null)
      return;
    this.Size = this._stackPanel.Measure(chart, null, null);
  }
  GetSeriesVisual(point) {
    let visual;
    if (this._seriesVisualsMap.TryGetValue(point.Context.Series, new System.Out(() => visual, ($v) => visual = $v))) {
      if (this._chart == null)
        return visual;
      visual.LabelVisual.Text = point.AsTooltipString;
      visual.LabelVisual.Invalidate(this._chart);
      return visual;
    }
    let sketch = point.Context.Series.GetMiniatresSketch();
    let relativePanel = VisualElementsExtensions.AsDrawnControl(sketch);
    let label = new LabelVisual().Init({
      Text: point.AsTooltipString,
      Paint: this.FontPaint,
      TextSize: this.TextSize,
      Padding: new LiveChartsCore.Padding(8, 0, 0, 0),
      VerticalAlignment: LiveChartsCore.Align.Start,
      HorizontalAlignment: LiveChartsCore.Align.Start
    });
    let sp = new LiveChartsCore.StackPanel(() => new RoundedRectangleGeometry()).Init({
      Padding: new LiveChartsCore.Padding(0, 4, 0, 4),
      VerticalAlignment: LiveChartsCore.Align.Middle,
      HorizontalAlignment: LiveChartsCore.Align.Middle
    });
    sp.Children.Add(relativePanel);
    sp.Children.Add(label);
    this._stackPanel?.Children.Add(sp);
    let seriesVisual = new SeriesVisual(point.Context.Series, sp, label);
    this._seriesVisualsMap.Add(point.Context.Series, seriesVisual);
    return seriesVisual;
  }
};
let SKDefaultTooltip = _SKDefaultTooltip;
_Size = new WeakMap();
__publicField(SKDefaultTooltip, "$meta_LiveChartsCore_IImageControl", true);
__publicField(SKDefaultTooltip, "s_zIndex", 10050);
class SeriesVisual {
  constructor(series, stackPanel, label) {
    __privateAdd(this, _Series, void 0);
    __privateAdd(this, _Visual, void 0);
    __publicField(this, "LabelVisual");
    this.Series = series;
    this.Visual = stackPanel;
    this.LabelVisual = label;
  }
  get Series() {
    return __privateGet(this, _Series);
  }
  set Series(value) {
    __privateSet(this, _Series, value);
  }
  get Visual() {
    return __privateGet(this, _Visual);
  }
  set Visual(value) {
    __privateSet(this, _Visual, value);
  }
}
_Series = new WeakMap();
_Visual = new WeakMap();
class Drawable extends LiveChartsCore.Animatable {
}
class BezierPoint extends LiveChartsCore.BezierVisualPoint {
  constructor(geometry) {
    super(geometry);
  }
}
class StepPoint extends LiveChartsCore.StepLineVisualPoint {
  constructor(visualFactory) {
    super(visualFactory);
  }
}
class PathCommand extends LiveChartsCore.Animatable {
  constructor() {
    super(...arguments);
    __publicField(this, "Id", 0);
  }
}
class LineSegment extends PathCommand {
  constructor() {
    super();
    __publicField(this, "_xProperty");
    __publicField(this, "_yProperty");
    this._xProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X", 0));
    this._yProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y", 0));
  }
  get X() {
    return this._xProperty.GetMovement(this);
  }
  set X(value) {
    this._xProperty.SetMovement(value, this);
  }
  get Y() {
    return this._yProperty.GetMovement(this);
  }
  set Y(value) {
    this._yProperty.SetMovement(value, this);
  }
  Execute(path, currentTime, pathGeometry) {
    this.CurrentTime = currentTime;
    path.lineTo(this.X, this.Y);
  }
}
class MoveToPathCommand extends PathCommand {
  constructor() {
    super();
    __publicField(this, "_xProperty");
    __publicField(this, "_yProperty");
    this._xProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X", 0));
    this._yProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y", 0));
  }
  get X() {
    return this._xProperty.GetMovement(this);
  }
  set X(value) {
    this._xProperty.SetMovement(value, this);
  }
  get Y() {
    return this._yProperty.GetMovement(this);
  }
  set Y(value) {
    this._yProperty.SetMovement(value, this);
  }
  Execute(path, currentTime, pathGeometry) {
    path.moveTo(this.X, this.Y);
  }
}
class Geometry extends Drawable {
  constructor(hasGeometryTransform = false) {
    super();
    __publicField(this, "_hasGeometryTransform", false);
    __publicField(this, "_opacityProperty");
    __publicField(this, "_xProperty");
    __publicField(this, "_yProperty");
    __publicField(this, "_rotationProperty");
    __publicField(this, "_transformOriginProperty");
    __publicField(this, "_scaleProperty");
    __publicField(this, "_skewProperty");
    __publicField(this, "_translateProperty");
    __publicField(this, "_transformProperty");
    __publicField(this, "_hasTransform", false);
    __publicField(this, "_hasRotation", false);
    __publicField(this, "_hasScale", false);
    __publicField(this, "_hasSkew", false);
    __publicField(this, "_hasTranslate", false);
    __publicField(this, "Stroke");
    __publicField(this, "Fill");
    this._hasGeometryTransform = hasGeometryTransform;
    this._xProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X", 0));
    this._yProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y", 0));
    this._opacityProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Opacity", 1));
    this._transformOriginProperty = this.RegisterMotionProperty(new LiveChartsCore.PointMotionProperty("TransformOrigin", new LiveChartsCore.LvcPoint(0.5, 0.5)));
    this._translateProperty = this.RegisterMotionProperty(new LiveChartsCore.PointMotionProperty("TranslateTransform", new LiveChartsCore.LvcPoint(0, 0)));
    this._rotationProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("RotateTransform", 0));
    this._scaleProperty = this.RegisterMotionProperty(new LiveChartsCore.PointMotionProperty("ScaleTransform", new LiveChartsCore.LvcPoint(1, 1)));
    this._skewProperty = this.RegisterMotionProperty(new LiveChartsCore.PointMotionProperty("SkewTransform", new LiveChartsCore.LvcPoint(1, 1)));
    this._transformProperty = this.RegisterMotionProperty(new SKMatrixMotionProperty("Transform", PixUI.Matrix4.CreateIdentity()));
  }
  get HasTransform() {
    return this._hasGeometryTransform || this._hasTranslate || this._hasRotation || this._hasScale || this._hasSkew || this._hasTransform;
  }
  get X() {
    return this._xProperty.GetMovement(this);
  }
  set X(value) {
    this._xProperty.SetMovement(value, this);
  }
  get Y() {
    return this._yProperty.GetMovement(this);
  }
  set Y(value) {
    this._yProperty.SetMovement(value, this);
  }
  get TransformOrigin() {
    return this._transformOriginProperty.GetMovement(this);
  }
  set TransformOrigin(value) {
    this._transformOriginProperty.SetMovement(value.Clone(), this);
  }
  get TranslateTransform() {
    return this._translateProperty.GetMovement(this);
  }
  set TranslateTransform(value) {
    this._translateProperty.SetMovement(value.Clone(), this);
    this._hasTranslate = value.X != 0 || value.Y != 0;
  }
  get RotateTransform() {
    return this._rotationProperty.GetMovement(this);
  }
  set RotateTransform(value) {
    this._rotationProperty.SetMovement(value, this);
    this._hasRotation = value != 0;
  }
  get ScaleTransform() {
    return this._scaleProperty.GetMovement(this);
  }
  set ScaleTransform(value) {
    this._scaleProperty.SetMovement(value.Clone(), this);
    this._hasScale = value.X != 1 || value.Y != 1;
  }
  get SkewTransform() {
    return this._skewProperty.GetMovement(this);
  }
  set SkewTransform(value) {
    this._skewProperty.SetMovement(value.Clone(), this);
    this._hasSkew = value.X != 0 || value.Y != 0;
  }
  get Transform() {
    return this._transformProperty.GetMovement(this);
  }
  set Transform(value) {
    this._transformProperty.SetMovement(value.Clone(), this);
    this._hasTransform = !value.IsIdentity;
  }
  get Opacity() {
    return this._opacityProperty.GetMovement(this);
  }
  set Opacity(value) {
    this._opacityProperty.SetMovement(value, this);
  }
  get MainGeometry() {
    return this.GetHighlitableGeometry();
  }
  Draw(context) {
    if (this.HasTransform) {
      context.Canvas.save();
      let m = this.OnMeasure(context.PaintTask);
      let o = this.TransformOrigin.Clone();
      let p = new PixUI.Point(this.X, this.Y);
      let xo = m.Width * o.X;
      let yo = m.Height * o.Y;
      if (this._hasGeometryTransform) {
        this.ApplyCustomGeometryTransform(context);
      }
      if (this._hasRotation) {
        context.Canvas.translate(p.X + xo, p.Y + yo);
        context.Canvas.rotate(this.RotateTransform, 0, 0);
        context.Canvas.translate(-p.X - xo, -p.Y - yo);
      }
      if (this._hasTranslate) {
        let translate = this.TranslateTransform.Clone();
        context.Canvas.translate(translate.X, translate.Y);
      }
      if (this._hasScale) {
        let scale = this.ScaleTransform.Clone();
        context.Canvas.translate(p.X + xo, p.Y + yo);
        context.Canvas.scale(scale.X, scale.Y);
        context.Canvas.translate(-p.X - xo, -p.Y - yo);
      }
      if (this._hasSkew) {
        let skew = this.SkewTransform.Clone();
        context.Canvas.translate(p.X + xo, p.Y + yo);
        context.Canvas.skew(skew.X, skew.Y);
        context.Canvas.translate(-p.X - xo, -p.Y - yo);
      }
      if (this._hasTransform) {
        let transform = this.Transform.Clone();
        context.Canvas.concat(transform.TransponseTo());
      }
    }
    let originalStroke = null;
    if (context.PaintTask.IsStroke && this.Stroke != null) {
      this.Stroke.IsStroke = true;
      originalStroke = context.Paint;
      this.Stroke.InitializeTask(context);
    }
    let originalFill = null;
    if (!context.PaintTask.IsStroke && this.Fill != null) {
      this.Fill.IsStroke = false;
      originalFill = context.Paint;
      this.Fill.InitializeTask(context);
    }
    if (this.Opacity != 1)
      context.PaintTask.ApplyOpacityMask(context, this);
    this.OnDraw(context, context.Paint);
    if (this.Opacity != 1)
      context.PaintTask.RestoreOpacityMask(context, this);
    if (context.PaintTask.IsStroke && this.Stroke != null) {
      this.Stroke.Dispose();
      if (originalStroke != null)
        context.Paint = originalStroke;
    }
    if (!context.PaintTask.IsStroke && this.Fill != null) {
      this.Fill.Dispose();
      if (originalFill != null)
        context.Paint = originalFill;
    }
    if (this.HasTransform)
      context.Canvas.restore();
  }
  Measure(drawableTask) {
    let measure = this.OnMeasure(drawableTask);
    let r = this.RotateTransform;
    if (Math.abs(r) > 0) {
      let toRadias = Math.PI / 180;
      r %= 360;
      if (r < 0)
        r += 360;
      if (r > 180)
        r = 360 - r;
      if (r > 90 && r <= 180)
        r = 180 - r;
      let rRadians = r * toRadias;
      let w = Math.cos(rRadians) * measure.Width + Math.sin(rRadians) * measure.Height;
      let h = Math.sin(rRadians) * measure.Width + Math.cos(rRadians) * measure.Height;
      measure = new LiveChartsCore.LvcSize(w, h);
    }
    return measure;
  }
  GetHighlitableGeometry() {
    return this;
  }
  ApplyCustomGeometryTransform(context) {
  }
}
class VectorGeometry extends Drawable {
  constructor() {
    super();
    __publicField(this, "_pivotProperty");
    __publicField(this, "ClosingMethod", 0);
    this._pivotProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Pivot", 0));
  }
  get Commands() {
    return new System.LinkedList();
  }
  get FirstCommand() {
    return this.Commands.First;
  }
  get LastCommand() {
    return this.Commands.Last;
  }
  get CountCommands() {
    return this.Commands.length;
  }
  get Pivot() {
    return this._pivotProperty.GetMovement(this);
  }
  set Pivot(value) {
    this._pivotProperty.SetMovement(value, this);
  }
  AddLast(command) {
    this.IsValid = false;
    return this.Commands.AddLast(command);
  }
  AddFirst(command) {
    this.IsValid = false;
    return this.Commands.AddFirst(command);
  }
  AddAfter(node, command) {
    this.IsValid = false;
    return this.Commands.AddAfter(node, command);
  }
  AddBefore(node, command) {
    this.IsValid = false;
    return this.Commands.AddBefore(node, command);
  }
  ContainsCommand(segment) {
    return this.Commands.Contains(segment);
  }
  RemoveCommand(node) {
    this.IsValid = false;
    this.Commands.Remove(node);
  }
  ClearCommands() {
    this.IsValid = false;
    this.Commands.Clear();
  }
  CompleteTransition(...propertyName) {
    for (const segment of this.Commands) {
      segment.CompleteTransition(...propertyName);
    }
    super.CompleteTransition(...propertyName);
  }
  Draw(context) {
    if (this.Commands.length == 0)
      return;
    let toRemoveSegments = new System.List();
    let path = new CanvasKit.Path();
    let isValid = true;
    let currentTime = this.CurrentTime;
    let isFirst = true;
    let last = null;
    for (const segment of this.Commands) {
      segment.IsValid = true;
      segment.CurrentTime = currentTime;
      if (isFirst) {
        isFirst = false;
        this.OnOpen(context, path, segment);
      }
      this.OnDrawSegment(context, path, segment);
      isValid = isValid && segment.IsValid;
      if (segment.IsValid && segment.RemoveOnCompleted)
        toRemoveSegments.Add(segment);
      last = segment;
    }
    for (const segment of toRemoveSegments) {
      this.Commands.Remove(segment);
      isValid = false;
    }
    if (last != null)
      this.OnClose(context, path, last);
    context.Canvas.drawPath(path, context.Paint);
    if (!isValid)
      this.IsValid = false;
    path.delete();
  }
  OnOpen(context, path, segment) {
  }
  OnClose(context, path, segment) {
  }
  OnDrawSegment(context, path, segment) {
  }
}
class SizedGeometry extends Geometry {
  constructor() {
    super();
    __publicField(this, "widthProperty");
    __publicField(this, "heightProperty");
    __publicField(this, "matchDimensions", false);
    this.widthProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Width", 0));
    this.heightProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Height", 0));
  }
  get Width() {
    return this.widthProperty.GetMovement(this);
  }
  set Width(value) {
    this.widthProperty.SetMovement(value, this);
  }
  get Height() {
    return this.matchDimensions ? this.widthProperty.GetMovement(this) : this.heightProperty.GetMovement(this);
  }
  set Height(value) {
    if (this.matchDimensions) {
      this.widthProperty.SetMovement(value, this);
      return;
    }
    this.heightProperty.SetMovement(value, this);
  }
  OnMeasure(paint) {
    return new LiveChartsCore.LvcSize(this.Width, this.Height);
  }
}
class CubicBezierAreaGeometry extends VectorGeometry {
  OnDrawSegment(context, path, segment) {
    path.cubicTo(segment.Xi, segment.Yi, segment.Xm, segment.Ym, segment.Xj, segment.Yj);
  }
  OnOpen(context, path, segment) {
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed) {
      path.moveTo(segment.Xi, segment.Yi);
      return;
    }
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
      path.moveTo(segment.Xi, this.Pivot);
      path.lineTo(segment.Xi, segment.Yi);
      return;
    }
  }
  OnClose(context, path, segment) {
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed)
      return;
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
      path.lineTo(segment.Xj, this.Pivot);
      path.close();
      return;
    }
  }
}
class HeatLand {
  constructor() {
    __publicField(this, "_value", 0);
    __publicField(this, "PropertyChanged", new System.Event());
    __publicField(this, "Name", "");
  }
  get Value() {
    return this._value;
  }
  set Value(value) {
    this._value = value;
    this.OnPropertyChanged("Value");
  }
  OnPropertyChanged(propertyName = null) {
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
class LabelGeometry extends Geometry {
  constructor() {
    super(true);
    __publicField(this, "_textSizeProperty");
    __publicField(this, "_backgroundProperty");
    __publicField(this, "VerticalAlign", LiveChartsCore.Align.Middle);
    __publicField(this, "HorizontalAlign", LiveChartsCore.Align.Middle);
    __publicField(this, "Text", "");
    __publicField(this, "Padding", new LiveChartsCore.Padding(0, 0, 0, 0));
    __publicField(this, "LineHeight", 1.75);
    this._textSizeProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("TextSize", 11));
    this._backgroundProperty = this.RegisterMotionProperty(new LiveChartsCore.ColorMotionProperty("Background", LiveChartsCore.LvcColor.Empty.Clone()));
    this.TransformOrigin = new LiveChartsCore.LvcPoint(0, 0);
  }
  get TextSize() {
    return this._textSizeProperty.GetMovement(this);
  }
  set TextSize(value) {
    this._textSizeProperty.SetMovement(value, this);
  }
  get Background() {
    return this._backgroundProperty.GetMovement(this);
  }
  set Background(value) {
    this._backgroundProperty.SetMovement(value.Clone(), this);
  }
  OnDraw(context, paint) {
    let size = this.OnMeasure(context.PaintTask);
    let bg = this.Background.Clone();
    if (System.OpInequality(bg, LiveChartsCore.LvcColor.Empty)) {
      let bgPaint = new CanvasKit.Paint();
      let p = this.Padding;
      context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X - p.Left, this.Y - size.Height + p.Bottom, size.Width, size.Height), bgPaint);
      bgPaint.delete();
    }
    let lines = this.GetLines(this.Text);
    let linesCount = lines.length;
    let lineNumber = 0;
    let lhd = (this.GetActualLineHeight(paint) - this.GetRawLineHeight(paint)) * 0.5;
    for (const line of lines) {
      let ph = ++lineNumber / linesCount * size.Height;
      let yLine = ph - size.Height;
      this.DrawLine(line, yLine - lhd, context, paint);
    }
  }
  OnMeasure(drawable) {
    let p = new CanvasKit.Paint();
    let bounds = this.MeasureLines(p);
    p.delete();
    return new LiveChartsCore.LvcSize(bounds.Width + this.Padding.Left + this.Padding.Right, bounds.Height + this.Padding.Top + this.Padding.Bottom);
  }
  ApplyCustomGeometryTransform(context) {
    let size = this.MeasureLines(context.Paint);
    let toRadians = Math.PI / 180;
    let p = this.Padding;
    let w = 0.5;
    let h = 0.5;
    switch (this.VerticalAlign) {
      case LiveChartsCore.Align.Start:
        h = 1 * size.Height + p.Top;
        break;
      case LiveChartsCore.Align.Middle:
        h = 0.5 * (size.Height + p.Top - p.Bottom);
        break;
      case LiveChartsCore.Align.End:
        h = 0 * size.Height - p.Bottom;
        break;
    }
    switch (this.HorizontalAlign) {
      case LiveChartsCore.Align.Start:
        w = 0 * size.Width - p.Left;
        break;
      case LiveChartsCore.Align.Middle:
        w = 0.5 * (size.Width - p.Left + p.Right);
        break;
      case LiveChartsCore.Align.End:
        w = 1 * size.Width + p.Right;
        break;
    }
    let rotation = this.RotateTransform;
    rotation = rotation * toRadians;
    let xp = -Math.cos(rotation) * w + -Math.sin(rotation) * h;
    let yp = -Math.sin(rotation) * w + Math.cos(rotation) * h;
    context.Canvas.translate(xp, yp);
  }
  DrawLine(content, yLine, context, paint) {
    let para = PixUI.TextPainter.BuildParagraph(content, Number.POSITIVE_INFINITY, this.TextSize, paint.getColor());
    context.Canvas.drawParagraph(para, this.X, this.Y + yLine - this.TextSize);
    para.delete();
  }
  MeasureLines(paint) {
    let w = 0;
    let h = 0;
    for (const line of this.GetLines(this.Text)) {
      let para = PixUI.TextPainter.BuildParagraph(line, Number.POSITIVE_INFINITY, this.TextSize, paint.getColor(), null, 1, true);
      h += para.getHeight() * this.LineHeight;
      if (para.getLongestLine() > w)
        w = para.getLongestLine();
      para.delete();
    }
    return new LiveChartsCore.LvcSize(w, h);
  }
  GetActualLineHeight(paint) {
    return this.TextSize * this.LineHeight;
  }
  GetRawLineHeight(paint) {
    return this.TextSize;
  }
  GetLines(multiLineText) {
    return System.IsNullOrEmpty(multiLineText) ? [] : multiLineText.split(String.fromCharCode(10));
  }
}
__publicField(LabelGeometry, "$meta_LiveChartsCore_ILabelGeometry", true);
class StepLineAreaGeometry extends VectorGeometry {
  constructor() {
    super(...arguments);
    __publicField(this, "_isFirst", true);
  }
  OnDrawSegment(context, path, segment) {
    if (this._isFirst) {
      this._isFirst = false;
      return;
    }
    path.lineTo(segment.Xj, segment.Yi);
    path.lineTo(segment.Xj, segment.Yj);
  }
  OnOpen(context, path, segment) {
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed) {
      path.moveTo(segment.Xj, segment.Yj);
      return;
    }
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
      path.moveTo(segment.Xj, this.Pivot);
      path.lineTo(segment.Xj, segment.Yj);
      return;
    }
  }
  OnClose(context, path, segment) {
    this._isFirst = true;
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.NotClosed)
      return;
    if (this.ClosingMethod == LiveChartsCore.VectorClosingMethod.CloseToPivot) {
      path.lineTo(segment.Xj, this.Pivot);
      path.close();
      return;
    }
  }
}
class SVGPathGeometry extends SizedGeometry {
  constructor(svgPath) {
    super();
    __publicField(this, "_svg", "");
    __publicField(this, "_svgPath");
    __publicField(this, "FitToSize", false);
    this._svgPath = svgPath;
  }
  get SVG() {
    return this._svg;
  }
  set SVG(value) {
    this._svg = value;
    this.OnSVGPropertyChanged();
  }
  OnDraw(context, paint) {
    if (this._svgPath == null)
      throw new System.Exception(`${"SVG"} property is null and there is not a defined path to draw.`);
    context.Canvas.save();
    let canvas = context.Canvas;
    let bounds = PixUI.Rect.FromFloat32Array(this._svgPath.getBounds());
    if (this.FitToSize) {
      canvas.translate(this.X + this.Width / 2, this.Y + this.Height / 2);
      canvas.scale(this.Width / (bounds.Width + paint.getStrokeWidth()), this.Height / (bounds.Height + paint.getStrokeWidth()));
      canvas.translate(-bounds.MidX, -bounds.MidY);
    } else {
      let maxB = bounds.Width < bounds.Height ? bounds.Height : bounds.Width;
      canvas.translate(this.X + this.Width / 2, this.Y + this.Height / 2);
      canvas.scale(this.Width / (maxB + paint.getStrokeWidth()), this.Height / (maxB + paint.getStrokeWidth()));
      canvas.translate(-bounds.MidX, -bounds.MidY);
    }
    canvas.drawPath(this._svgPath, paint);
    context.Canvas.restore();
  }
  OnSVGPropertyChanged() {
    throw new System.NotImplementedException();
  }
}
class RoundedRectangleGeometry extends SizedGeometry {
  constructor() {
    super();
    __publicField(this, "_rx");
    __publicField(this, "_ry");
    this._rx = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Rx", 8));
    this._ry = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Ry", 8));
  }
  get Rx() {
    return this._rx.GetMovement(this);
  }
  set Rx(value) {
    this._rx.SetMovement(value, this);
  }
  get Ry() {
    return this._ry.GetMovement(this);
  }
  set Ry(value) {
    this._ry.SetMovement(value, this);
  }
  OnDraw(context, paint) {
    let rrect = PixUI.RRect.FromRectAndRadius(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), this.Rx, this.Ry);
    context.Canvas.drawRRect(rrect, paint);
  }
}
__publicField(RoundedRectangleGeometry, "$meta_LiveChartsCore_IRoundedRectangleChartPoint", true);
class LineGeometry extends Geometry {
  constructor() {
    super();
    __publicField(this, "_x1");
    __publicField(this, "_y1");
    this._x1 = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X1", 0));
    this._y1 = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y1", 0));
  }
  get X1() {
    return this._x1.GetMovement(this);
  }
  set X1(value) {
    this._x1.SetMovement(value, this);
  }
  get Y1() {
    return this._y1.GetMovement(this);
  }
  set Y1(value) {
    this._y1.SetMovement(value, this);
  }
  OnDraw(context, paint) {
    context.Canvas.drawLine(this.X, this.Y, this.X1, this.Y1, paint);
  }
  OnMeasure(drawable) {
    return new LiveChartsCore.LvcSize(Math.abs(this.X1 - this.X), Math.abs(this.Y1 - this.Y));
  }
}
class CandlestickGeometry extends Geometry {
  constructor() {
    super();
    __publicField(this, "_wProperty");
    __publicField(this, "_oProperty");
    __publicField(this, "_cProperty");
    __publicField(this, "_lProperty");
    this._wProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Width", 0));
    this._oProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Open", 0));
    this._cProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Close", 0));
    this._lProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Low", 0));
  }
  get Width() {
    return this._wProperty.GetMovement(this);
  }
  set Width(value) {
    this._wProperty.SetMovement(value, this);
  }
  get Open() {
    return this._oProperty.GetMovement(this);
  }
  set Open(value) {
    this._oProperty.SetMovement(value, this);
  }
  get Close() {
    return this._cProperty.GetMovement(this);
  }
  set Close(value) {
    this._cProperty.SetMovement(value, this);
  }
  get Low() {
    return this._lProperty.GetMovement(this);
  }
  set Low(value) {
    this._lProperty.SetMovement(value, this);
  }
  OnDraw(context, paint) {
    let w = this.Width;
    let cx = this.X + w * 0.5;
    let h = this.Y;
    let o = this.Open;
    let c = this.Close;
    let l = this.Low;
    let yi = 0;
    let yj = 0;
    if (o > c) {
      yi = c;
      yj = o;
    } else {
      yi = o;
      yj = c;
    }
    context.Canvas.drawLine(cx, h, cx, yi, paint);
    context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, yi, w, Math.abs(o - c)), paint);
    context.Canvas.drawLine(cx, yj, cx, l, paint);
  }
  OnMeasure(paintTaks) {
    return new LiveChartsCore.LvcSize(this.Width, Math.abs(this.Low - this.Y));
  }
}
class PathGeometry extends Drawable {
  constructor() {
    super(...arguments);
    __publicField(this, "_commands", new System.LinkedList());
    __publicField(this, "IsClosed", false);
  }
  get FirstCommand() {
    return this._commands.First;
  }
  get LastCommand() {
    return this._commands.Last;
  }
  get CountCommands() {
    return this._commands.length;
  }
  Draw(context) {
    if (this._commands.length == 0)
      return;
    let toRemoveSegments = new System.List();
    let path = new CanvasKit.Path();
    let isValid = true;
    for (const segment of this._commands) {
      segment.IsValid = true;
      segment.Execute(path, this.CurrentTime, this);
      isValid = isValid && segment.IsValid;
      if (segment.IsValid && segment.RemoveOnCompleted)
        toRemoveSegments.Add(segment);
    }
    for (const segment of toRemoveSegments) {
      this._commands.Remove(segment);
      isValid = false;
    }
    if (this.IsClosed)
      path.close();
    context.Canvas.drawPath(path, context.Paint);
    if (!isValid)
      this.IsValid = false;
    path.delete();
  }
  AddLast(command) {
    this.IsValid = false;
    return this._commands.AddLast(command);
  }
  AddFirst(command) {
    this.IsValid = false;
    return this._commands.AddFirst(command);
  }
  AddAfter(node, command) {
    this.IsValid = false;
    return this._commands.AddAfter(node, command);
  }
  AddBefore(node, command) {
    this.IsValid = false;
    return this._commands.AddBefore(node, command);
  }
  ContainsCommand(segment) {
    return this._commands.Contains(segment);
  }
  RemoveCommand(command) {
    this.IsValid = false;
    return this._commands.Remove(command);
  }
  ClearCommands() {
    this._commands.Clear();
  }
  CompleteTransition(...propertyName) {
    for (const segment of this._commands) {
      segment.CompleteTransition(...propertyName);
    }
    super.CompleteTransition(...propertyName);
  }
}
class HeatPathShape extends PathGeometry {
  constructor() {
    super();
    __publicField(this, "_fillProperty");
    this._fillProperty = this.RegisterMotionProperty(new LiveChartsCore.ColorMotionProperty("FillColor", LiveChartsCore.LvcColor.Empty.Clone()));
  }
  get FillColor() {
    return this._fillProperty.GetMovement(this);
  }
  set FillColor(value) {
    this._fillProperty.SetMovement(value.Clone(), this);
  }
  Draw(context) {
    if (this._commands.length == 0)
      return;
    let toRemoveSegments = new System.List();
    let path = new CanvasKit.Path();
    let isValid = true;
    for (const segment of this._commands) {
      segment.IsValid = true;
      segment.Execute(path, this.CurrentTime, this);
      isValid = isValid && segment.IsValid;
      if (segment.IsValid && segment.RemoveOnCompleted)
        toRemoveSegments.Add(segment);
    }
    for (const segment of toRemoveSegments) {
      this._commands.Remove(segment);
      isValid = false;
    }
    if (this.IsClosed)
      path.close();
    let originalColor = context.Paint.getColor();
    let fill = this.FillColor.Clone();
    if (System.OpInequality(fill, LiveChartsCore.LvcColor.Empty)) {
      context.Paint.setColor(LiveChartsSkiaSharp.AsSKColor(fill));
      context.Paint.setStyle(CanvasKit.PaintStyle.Fill);
    }
    context.Canvas.drawPath(path, context.Paint);
    if (System.OpInequality(fill, LiveChartsCore.LvcColor.Empty)) {
      context.Paint.setColor(originalColor);
    }
    if (!isValid)
      this.IsValid = false;
    path.delete();
  }
  CompleteTransition(...propertyName) {
    for (const item of this._commands) {
      item.CompleteTransition(...propertyName);
    }
    super.CompleteTransition(...propertyName);
  }
}
const _DoughnutGeometry = class extends Geometry {
  constructor() {
    super();
    __publicField(this, "_cxProperty");
    __publicField(this, "_cyProperty");
    __publicField(this, "_wProperty");
    __publicField(this, "_hProperty");
    __publicField(this, "_startProperty");
    __publicField(this, "_sweepProperty");
    __publicField(this, "_pushoutProperty");
    __publicField(this, "_innerRadiusProperty");
    __publicField(this, "_cornerRadiusProperty");
    __publicField(this, "InvertedCornerRadius", false);
    this._cxProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("CenterX"));
    this._cyProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("CenterY"));
    this._wProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Width"));
    this._hProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Height"));
    this._startProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StartAngle"));
    this._sweepProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("SweepAngle"));
    this._pushoutProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("PushOut"));
    this._innerRadiusProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("InnerRadius"));
    this._cornerRadiusProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("CornerRadius"));
  }
  get CenterX() {
    return this._cxProperty.GetMovement(this);
  }
  set CenterX(value) {
    this._cxProperty.SetMovement(value, this);
  }
  get CenterY() {
    return this._cyProperty.GetMovement(this);
  }
  set CenterY(value) {
    this._cyProperty.SetMovement(value, this);
  }
  get Width() {
    return this._wProperty.GetMovement(this);
  }
  set Width(value) {
    this._wProperty.SetMovement(value, this);
  }
  get Height() {
    return this._hProperty.GetMovement(this);
  }
  set Height(value) {
    this._hProperty.SetMovement(value, this);
  }
  get StartAngle() {
    return this._startProperty.GetMovement(this);
  }
  set StartAngle(value) {
    this._startProperty.SetMovement(value, this);
  }
  get SweepAngle() {
    return this._sweepProperty.GetMovement(this);
  }
  set SweepAngle(value) {
    this._sweepProperty.SetMovement(value, this);
  }
  get PushOut() {
    return this._pushoutProperty.GetMovement(this);
  }
  set PushOut(value) {
    this._pushoutProperty.SetMovement(value, this);
  }
  get InnerRadius() {
    return this._innerRadiusProperty.GetMovement(this);
  }
  set InnerRadius(value) {
    this._innerRadiusProperty.SetMovement(value, this);
  }
  get CornerRadius() {
    return this._cornerRadiusProperty.GetMovement(this);
  }
  set CornerRadius(value) {
    this._cornerRadiusProperty.SetMovement(value, this);
  }
  OnMeasure(paint) {
    return new LiveChartsCore.LvcSize(this.Width, this.Height);
  }
  OnDraw(context, paint) {
    if (_DoughnutGeometry.AlternativeDraw != null) {
      _DoughnutGeometry.AlternativeDraw(this, context, paint);
      return;
    }
    if (this.CornerRadius > 0)
      throw new System.NotImplementedException(`${"CornerRadius"} is not implemented.`);
    let path = new CanvasKit.Path();
    let cx = this.CenterX;
    let cy = this.CenterY;
    let wedge = this.InnerRadius;
    let r = this.Width * 0.5;
    let startAngle = this.StartAngle;
    let sweepAngle = this.SweepAngle;
    let toRadians = Math.PI / 180;
    let pushout = this.PushOut;
    path.moveTo(cx + Math.cos(startAngle * toRadians) * wedge, cy + Math.sin(startAngle * toRadians) * wedge);
    path.lineTo(cx + Math.cos(startAngle * toRadians) * r, cy + Math.sin(startAngle * toRadians) * r);
    path.arcToOval(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), startAngle, sweepAngle, false);
    path.lineTo(cx + Math.cos((sweepAngle + startAngle) * toRadians) * wedge, cy + Math.sin((sweepAngle + startAngle) * toRadians) * wedge);
    path.arcToRotated(wedge, wedge, 0, sweepAngle > 180 ? false : true, true, cx + Math.cos(startAngle * toRadians) * wedge, cy + Math.sin(startAngle * toRadians) * wedge);
    path.close();
    if (pushout > 0) {
      let pushoutAngle = startAngle + 0.5 * sweepAngle;
      let x = pushout * Math.cos(pushoutAngle * toRadians);
      let y = pushout * Math.sin(pushoutAngle * toRadians);
      context.Canvas.save();
      context.Canvas.translate(x, y);
    }
    context.Canvas.drawPath(path, context.Paint);
    if (pushout > 0)
      context.Canvas.restore();
    path.delete();
  }
};
let DoughnutGeometry = _DoughnutGeometry;
__publicField(DoughnutGeometry, "AlternativeDraw");
class RectangleGeometry extends SizedGeometry {
  constructor() {
    super();
  }
  OnDraw(context, paint) {
    context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), paint);
  }
}
class OvalGeometry extends SizedGeometry {
  constructor() {
    super();
  }
  OnDraw(context, paint) {
    let rx = this.Width / 2;
    let ry = this.Height / 2;
    context.Canvas.drawOval(new PixUI.Rect(this.X + rx, this.Y + ry, rx, ry), paint);
  }
}
class ColoredRectangleGeometry extends SizedGeometry {
  constructor() {
    super();
    __publicField(this, "_colorProperty");
    this._colorProperty = this.RegisterMotionProperty(new LiveChartsCore.ColorMotionProperty("Color"));
  }
  get Color() {
    return this._colorProperty.GetMovement(this);
  }
  set Color(value) {
    this._colorProperty.SetMovement(value.Clone(), this);
  }
  OnDraw(context, paint) {
    let c = this.Color.Clone();
    paint.setColor(new PixUI.Color(c.R, c.G, c.B, c.A));
    context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), paint);
  }
}
class CircleGeometry extends SizedGeometry {
  constructor() {
    super();
    this.matchDimensions = true;
  }
  OnDraw(context, paint) {
    let rx = this.Width / 2;
    context.Canvas.drawCircle(this.X + rx, this.Y + rx, rx, paint);
  }
}
class SquareGeometry extends SizedGeometry {
  constructor() {
    super();
    this.matchDimensions = true;
  }
  OnDraw(context, paint) {
    context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), paint);
  }
}
class ImageFilter {
  constructor() {
    __publicField(this, "SKImageFilter");
  }
  Dispose() {
    if (this.SKImageFilter == null)
      return;
    this.SKImageFilter.delete();
    this.SKImageFilter = null;
  }
}
__publicField(ImageFilter, "$meta_System_IDisposable", true);
class ImageFiltersMergeOperation extends ImageFilter {
  constructor(imageFilters) {
    super();
    __publicField(this, "_filters");
    this._filters = imageFilters;
  }
  Clone() {
    return new ImageFiltersMergeOperation(this._filters);
  }
  CreateFilter(drawingContext) {
    throw new System.NotImplementedException();
  }
  Dispose() {
    for (const item of this._filters) {
      item.Dispose();
    }
  }
}
class DropShadow extends ImageFilter {
  constructor(dx, dy, sigmaX, sigmaY, color, input = null) {
    super();
    __publicField(this, "_dx");
    __publicField(this, "_dy");
    __publicField(this, "_sigmaX");
    __publicField(this, "_sigmaY");
    __publicField(this, "_color");
    __publicField(this, "_filter", null);
    this._dx = dx;
    this._dy = dy;
    this._sigmaX = sigmaX;
    this._sigmaY = sigmaY;
    this._color = color;
    this._filter = input;
  }
  Clone() {
    return new DropShadow(this._dx, this._dy, this._sigmaX, this._sigmaY, this._color, this._filter);
  }
  CreateFilter(drawingContext) {
    this.SKImageFilter = CanvasKit.ImageFilter.MakeDropShadow(this._dx, this._dy, this._sigmaX, this._sigmaY, this._color, this._filter);
  }
}
class Blur extends ImageFilter {
  constructor(sigmaX, sigmaY, input = null) {
    super();
    __publicField(this, "_sigmaX");
    __publicField(this, "_sigmaY");
    __publicField(this, "_filter", null);
    this._sigmaX = sigmaX;
    this._sigmaY = sigmaY;
    this._filter = input;
  }
  Clone() {
    return new Blur(this._sigmaX, this._sigmaY, this._filter);
  }
  CreateFilter(drawingContext) {
    this.SKImageFilter = CanvasKit.ImageFilter.MakeBlur(this._sigmaX, this._sigmaY, CanvasKit.TileMode.Decal, this._filter);
  }
}
class PathEffect {
  constructor() {
    __publicField(this, "SKPathEffect");
  }
  Dispose() {
    if (this.SKPathEffect == null)
      return;
    this.SKPathEffect.delete();
    this.SKPathEffect = null;
  }
}
__publicField(PathEffect, "$meta_System_IDisposable", true);
class DashEffect extends PathEffect {
  constructor(dashArray, phase = 0) {
    super();
    __publicField(this, "_dashArray");
    __publicField(this, "_phase", 0);
    this._dashArray = dashArray;
    this._phase = phase;
  }
  Clone() {
    return new DashEffect(this._dashArray, this._phase);
  }
  CreateEffect(drawingContext) {
    this.SKPathEffect = CanvasKit.PathEffect.MakeDash(Array.from(this._dashArray), this._phase);
  }
}
class ChartView extends PixUI.Widget {
  constructor(tooltip, legend) {
    super();
    __publicField(this, "core");
    __publicField(this, "legend", new SKDefaultLegend());
    __publicField(this, "tooltip", new SKDefaultTooltip());
    __publicField(this, "_legendPosition", LiveChartsCore.LiveCharts.DefaultSettings.LegendPosition);
    __publicField(this, "_drawMargin", null);
    __publicField(this, "_tooltipPosition", LiveChartsCore.LiveCharts.DefaultSettings.TooltipPosition);
    __publicField(this, "_title");
    __publicField(this, "_visualsObserver");
    __publicField(this, "_visuals", new System.List());
    __publicField(this, "_legendTextPaint", LiveChartsCore.LiveCharts.DefaultSettings.LegendTextPaint);
    __publicField(this, "_legendBackgroundPaint", LiveChartsCore.LiveCharts.DefaultSettings.LegendBackgroundPaint);
    __publicField(this, "_legendTextSize", LiveChartsCore.LiveCharts.DefaultSettings.LegendTextSize);
    __publicField(this, "_tooltipTextPaint", LiveChartsCore.LiveCharts.DefaultSettings.TooltipTextPaint);
    __publicField(this, "_tooltipBackgroundPaint", LiveChartsCore.LiveCharts.DefaultSettings.TooltipBackgroundPaint);
    __publicField(this, "_tooltipTextSize", LiveChartsCore.LiveCharts.DefaultSettings.TooltipTextSize);
    __publicField(this, "BackColor", new LiveChartsCore.LvcColor(255, 255, 255));
    __publicField(this, "AnimationsSpeed", LiveChartsCore.LiveCharts.DefaultSettings.AnimationsSpeed);
    __publicField(this, "EasingFunction", LiveChartsCore.LiveCharts.DefaultSettings.EasingFunction);
    __publicField(this, "UpdaterThrottler", LiveChartsCore.LiveCharts.DefaultSettings.UpdateThrottlingTimeout);
    __publicField(this, "DataPointerDown", new System.Event());
    __publicField(this, "ChartPointPointerDown", new System.Event());
    __publicField(this, "Measuring", new System.Event());
    __publicField(this, "UpdateStarted", new System.Event());
    __publicField(this, "UpdateFinished", new System.Event());
    __publicField(this, "VisualElementsPointerDown", new System.Event());
    __publicField(this, "AutoUpdateEnabled", true);
    __publicField(this, "_isDrawingLoopRunning", false);
    __publicField(this, "_paintTasksSchedule", new System.List());
    __publicField(this, "MaxFps", 65);
    __privateAdd(this, _MouseRegion, void 0);
    if (tooltip != null)
      this.tooltip = tooltip;
    if (legend != null)
      this.legend = legend;
    if (!LiveChartsCore.LiveCharts.IsConfigured)
      LiveChartsCore.LiveCharts.Configure((config) => LiveChartsSkiaSharp.UseDefaults(config));
    this.InitializeCore();
    this._visualsObserver = new LiveChartsCore.CollectionDeepObserver((s, e) => this.OnPropertyChanged(), (s, e) => this.OnPropertyChanged(), true);
    if (this.core == null)
      throw new System.Exception("Core not found!");
    this.MouseRegion = new PixUI.MouseRegion();
    this.MouseRegion.PointerMove.Add((e) => this.core?.InvokePointerMove(new LiveChartsCore.LvcPoint(e.X, e.Y)));
    this.MouseRegion.HoverChanged.Add((hover) => {
      if (!hover)
        this.core?.InvokePointerLeft();
    });
  }
  get CoreChart() {
    return this.core;
  }
  get DesignerMode() {
    return false;
  }
  get ControlSize() {
    return this.LegendPosition == LiveChartsCore.LegendPosition.Hidden ? new LiveChartsCore.LvcSize().Init({ Width: this.W, Height: this.H }) : new LiveChartsCore.LvcSize().Init({ Width: this.W, Height: this.H });
  }
  get DrawMargin() {
    return this._drawMargin;
  }
  set DrawMargin(value) {
    this._drawMargin = value;
    this.OnPropertyChanged();
  }
  get LegendPosition() {
    return this._legendPosition;
  }
  set LegendPosition(value) {
    this._legendPosition = value;
    this.OnPropertyChanged();
  }
  get TooltipPosition() {
    return this._tooltipPosition;
  }
  set TooltipPosition(value) {
    this._tooltipPosition = value;
    this.OnPropertyChanged();
  }
  OnDataPointerDown(points, pointer) {
    throw new System.NotImplementedException();
  }
  InvokeOnUIThread(action) {
    if (!this.IsMounted)
      return;
    PixUI.UIApplication.Current.BeginInvoke(action);
  }
  get LegendTextPaint() {
    return this._legendTextPaint;
  }
  set LegendTextPaint(value) {
    this._legendTextPaint = value;
    this.OnPropertyChanged();
  }
  get LegendBackgroundPaint() {
    return this._legendBackgroundPaint;
  }
  set LegendBackgroundPaint(value) {
    this._legendBackgroundPaint = value;
    this.OnPropertyChanged();
  }
  get LegendTextSize() {
    return this._legendTextSize;
  }
  set LegendTextSize(value) {
    this._legendTextSize = value;
    this.OnPropertyChanged();
  }
  get TooltipTextPaint() {
    return this._tooltipTextPaint;
  }
  set TooltipTextPaint(value) {
    this._tooltipTextPaint = value;
    this.OnPropertyChanged();
  }
  get TooltipBackgroundPaint() {
    return this._tooltipBackgroundPaint;
  }
  set TooltipBackgroundPaint(value) {
    this._tooltipBackgroundPaint = value;
    this.OnPropertyChanged();
  }
  get TooltipTextSize() {
    return this._tooltipTextSize;
  }
  set TooltipTextSize(value) {
    this._tooltipTextSize = value;
    this.OnPropertyChanged();
  }
  get Title() {
    return this._title;
  }
  set Title(value) {
    this._title = value;
    this.OnPropertyChanged();
  }
  get CoreCanvas() {
    return this.CanvasCore;
  }
  get Legend() {
    return this.legend;
  }
  set Legend(value) {
    this.legend = value;
  }
  get Tooltip() {
    return this.tooltip;
  }
  set Tooltip(value) {
    this.tooltip = value;
  }
  get VisualElements() {
    return this._visuals;
  }
  set VisualElements(value) {
    this._visualsObserver?.Dispose(this._visuals);
    this._visualsObserver?.Initialize(value);
    this._visuals = value;
    this.OnPropertyChanged();
  }
  ShowTooltip(points) {
    if (this.tooltip == null || this.core == null)
      return;
    this.tooltip.Show(points, this.core);
  }
  HideTooltip() {
    if (this.tooltip == null || this.core == null)
      return;
    this.core.ClearTooltipData();
    this.tooltip.Hide();
  }
  OnVisualElementPointerDown(visualElements, pointer) {
    throw new System.NotImplementedException();
  }
  get PaintTasks() {
    return this._paintTasksSchedule;
  }
  set PaintTasks(value) {
    this._paintTasksSchedule = value;
    this.OnPaintTasksChanged();
  }
  get CanvasCore() {
    return new LiveChartsCore.MotionCanvas();
  }
  CanvasCore_Invalidated(sender) {
    this.RunDrawingLoop();
  }
  async RunDrawingLoop() {
    if (this._isDrawingLoopRunning)
      return;
    this._isDrawingLoopRunning = true;
    let ts = System.TimeSpan.FromSeconds(1 / this.MaxFps);
    while (!this.CanvasCore.IsValid) {
      this.Invalidate(PixUI.InvalidAction.Repaint);
      await new Promise(($resolve) => setTimeout(() => $resolve(), Math.floor(ts.TotalMilliseconds) & 4294967295));
    }
    this._isDrawingLoopRunning = false;
  }
  OnPaintTasksChanged() {
    let tasks = new System.HashSet();
    for (const item of this._paintTasksSchedule) {
      item.PaintTask.SetGeometries(this.CanvasCore, item.Geometries);
      tasks.Add(item.PaintTask);
    }
    this.CanvasCore.SetPaintTasks(tasks);
  }
  get MouseRegion() {
    return __privateGet(this, _MouseRegion);
  }
  set MouseRegion(value) {
    __privateSet(this, _MouseRegion, value);
  }
  OnMounted() {
    super.OnMounted();
    this.core?.Load();
    this.CanvasCore.Invalidated.Add(this.CanvasCore_Invalidated, this);
  }
  OnUnmounted() {
    super.OnUnmounted();
    this.CanvasCore.Invalidated.Remove(this.CanvasCore_Invalidated, this);
    this.CanvasCore.Dispose();
    if (System.IsInterfaceOfIDisposable(this.tooltip)) {
      const disposableTooltip = this.tooltip;
      disposableTooltip.Dispose();
    }
    this.core?.Unload();
    this.OnUnloading();
  }
  Layout(availableWidth, availableHeight) {
    let width = this.CacheAndCheckAssignWidth(availableWidth);
    let height = this.CacheAndCheckAssignHeight(availableHeight);
    this.SetSize(width, height);
  }
  Paint(canvas, area = null) {
    canvas.save();
    canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);
    let drawCtx = new SkiaDrawingContext(this.CanvasCore, Math.floor(this.W) & 4294967295, Math.floor(this.H) & 4294967295, canvas);
    drawCtx.Background = LiveChartsSkiaSharp.AsSKColor(this.BackColor);
    this.CanvasCore.DrawFrame(drawCtx);
    canvas.restore();
  }
  OnUnloading() {
  }
  OnPropertyChanged() {
    if (this.core == null || this.DesignerMode)
      return;
    this.core.Update();
  }
}
_MouseRegion = new WeakMap();
__publicField(ChartView, "$meta_PixUI_IMouseRegion", true);
class PieChart extends ChartView {
  constructor(tooltip = null, legend = null) {
    super(tooltip, legend);
    __publicField(this, "_seriesObserver");
    __publicField(this, "_series", new System.List());
    __publicField(this, "_isClockwise", true);
    __publicField(this, "_initialRotation", 0);
    __publicField(this, "_maxAngle", 360);
    __publicField(this, "_total");
    this._seriesObserver = new LiveChartsCore.CollectionDeepObserver((s, e) => this.OnPropertyChanged(), (s, e) => this.OnPropertyChanged(), true);
    this.Series = new System.ObservableCollection();
    this.VisualElements = new System.ObservableCollection();
  }
  InitializeCore() {
    this.core = new LiveChartsCore.PieChart(this, (config) => LiveChartsSkiaSharp.UseDefaults(config), this.CanvasCore, true);
    if (this.DesignerMode)
      return;
    this.core.Update();
  }
  GetPointsAt(point, strategy = LiveChartsCore.TooltipFindingStrategy.Automatic) {
    let cc = this.core;
    if (strategy == LiveChartsCore.TooltipFindingStrategy.Automatic)
      strategy = LiveChartsCore.Extensions.GetTooltipFindingStrategy(cc.Series);
    return cc.Series.SelectMany((series) => series.FindHitPoints(cc, point.Clone(), strategy));
  }
  GetVisualsAt(point) {
    let cc = this.core;
    return cc.VisualElements.SelectMany((visual) => visual.IsHitBy(this.core, point.Clone()));
  }
  get Core() {
    return this.core;
  }
  get Series() {
    return this._series;
  }
  set Series(value) {
    this._seriesObserver?.Dispose(this._series);
    this._seriesObserver?.Initialize(value);
    this._series = value;
    this.OnPropertyChanged();
  }
  get InitialRotation() {
    return this._initialRotation;
  }
  set InitialRotation(value) {
    this._initialRotation = value;
    this.OnPropertyChanged();
  }
  get MaxAngle() {
    return this._maxAngle;
  }
  set MaxAngle(value) {
    this._maxAngle = value;
    this.OnPropertyChanged();
  }
  get Total() {
    return this._total;
  }
  set Total(value) {
    this._total = value;
    this.OnPropertyChanged();
  }
  get IsClockwise() {
    return this._isClockwise;
  }
  set IsClockwise(value) {
    this._isClockwise = value;
    this.OnPropertyChanged();
  }
}
class CartesianChart extends ChartView {
  constructor(tooltip = null, legend = null) {
    super(tooltip, legend);
    __publicField(this, "_seriesObserver");
    __publicField(this, "_xObserver");
    __publicField(this, "_yObserver");
    __publicField(this, "_sectionsObserver");
    __publicField(this, "_series", new System.List());
    __publicField(this, "_xAxes", new System.List().Init([new Axis()]));
    __publicField(this, "_yAxes", new System.List().Init([new Axis()]));
    __publicField(this, "_sections", new System.List());
    __publicField(this, "_drawMarginFrame");
    __publicField(this, "_tooltipFindingStrategy", LiveChartsCore.LiveCharts.DefaultSettings.TooltipFindingStrategy);
    __publicField(this, "ZoomMode", LiveChartsCore.LiveCharts.DefaultSettings.ZoomMode);
    __publicField(this, "ZoomingSpeed", LiveChartsCore.LiveCharts.DefaultSettings.ZoomSpeed);
    this._seriesObserver = new LiveChartsCore.CollectionDeepObserver(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this), true);
    this._xObserver = new LiveChartsCore.CollectionDeepObserver(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this), true);
    this._yObserver = new LiveChartsCore.CollectionDeepObserver(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this), true);
    this._sectionsObserver = new LiveChartsCore.CollectionDeepObserver(this.OnDeepCollectionChanged.bind(this), this.OnDeepCollectionPropertyChanged.bind(this), true);
    this.XAxes = new System.List().Init([
      new Axis()
    ]);
    this.YAxes = new System.List().Init([
      new Axis()
    ]);
    this.Series = new System.ObservableCollection();
    this.VisualElements = new System.ObservableCollection();
  }
  InitializeCore() {
    let zoomingSection = new RectangleGeometry();
    let zoomingSectionPaint = new SolidColorPaint().Init({
      IsFill: true,
      Color: new PixUI.Color(33, 150, 243, 50),
      ZIndex: 2147483647
    });
    zoomingSectionPaint.AddGeometryToPaintTask(this.CanvasCore, zoomingSection);
    this.CanvasCore.AddDrawableTask(zoomingSectionPaint);
    this.core = new LiveChartsCore.CartesianChart(this, (config) => LiveChartsSkiaSharp.UseDefaults(config), this.CanvasCore, zoomingSection);
    if (this.DesignerMode)
      return;
    this.core.Update();
  }
  GetPointsAt(point, strategy = LiveChartsCore.TooltipFindingStrategy.Automatic) {
    let cc = this.core;
    if (strategy == LiveChartsCore.TooltipFindingStrategy.Automatic)
      strategy = LiveChartsCore.Extensions.GetTooltipFindingStrategy(cc.Series);
    return cc.Series.SelectMany((series) => series.FindHitPoints(cc, point.Clone(), strategy));
  }
  GetVisualsAt(point) {
    let cc = this.core;
    return cc.VisualElements.SelectMany((visual) => visual.IsHitBy(this.core, point.Clone()));
  }
  get Core() {
    return this.core;
  }
  get XAxes() {
    return this._xAxes;
  }
  set XAxes(value) {
    this._xObserver?.Dispose(this._xAxes);
    this._xObserver?.Initialize(value);
    this._xAxes = value;
    this.OnPropertyChanged();
  }
  get YAxes() {
    return this._yAxes;
  }
  set YAxes(value) {
    this._yObserver?.Dispose(this._yAxes);
    this._yObserver?.Initialize(value);
    this._yAxes = value;
    this.OnPropertyChanged();
  }
  get Sections() {
    return this._sections;
  }
  set Sections(value) {
    this._sectionsObserver?.Dispose(this._sections);
    this._sectionsObserver?.Initialize(value);
    this._sections = value;
    this.OnPropertyChanged();
  }
  get Series() {
    return this._series;
  }
  set Series(value) {
    this._seriesObserver?.Dispose(this._series);
    this._seriesObserver?.Initialize(value);
    this._series = value;
    this.OnPropertyChanged();
  }
  get DrawMarginFrame() {
    return this._drawMarginFrame;
  }
  set DrawMarginFrame(value) {
    this._drawMarginFrame = value;
    this.OnPropertyChanged();
  }
  get TooltipFindingStrategy() {
    return this._tooltipFindingStrategy;
  }
  set TooltipFindingStrategy(value) {
    this._tooltipFindingStrategy = value;
    this.OnPropertyChanged();
  }
  ScalePixelsToData(point, xAxisIndex = 0, yAxisIndex = 0) {
    let cc = this.core;
    let xScaler = LiveChartsCore.Scaler.Make(cc.DrawMarginLocation.Clone(), cc.DrawMarginSize.Clone(), cc.XAxes[xAxisIndex]);
    let yScaler = LiveChartsCore.Scaler.Make(cc.DrawMarginLocation.Clone(), cc.DrawMarginSize.Clone(), cc.YAxes[yAxisIndex]);
    return new LiveChartsCore.LvcPointD(xScaler.ToChartValues(point.X), yScaler.ToChartValues(point.Y));
  }
  ScaleDataToPixels(point, xAxisIndex = 0, yAxisIndex = 0) {
    let cc = this.core;
    let xScaler = LiveChartsCore.Scaler.Make(cc.DrawMarginLocation.Clone(), cc.DrawMarginSize.Clone(), cc.XAxes[xAxisIndex]);
    let yScaler = LiveChartsCore.Scaler.Make(cc.DrawMarginLocation.Clone(), cc.DrawMarginSize.Clone(), cc.YAxes[yAxisIndex]);
    return new LiveChartsCore.LvcPointD(xScaler.ToPixels(point.X), yScaler.ToPixels(point.Y));
  }
  OnDeepCollectionChanged(sender, e) {
    this.OnPropertyChanged();
  }
  OnDeepCollectionPropertyChanged(sender, e) {
    this.OnPropertyChanged();
  }
}
__publicField(CartesianChart, "$meta_LiveChartsCore_ICartesianChartView", true);
export { Axis, BaseGeometryVisual, BezierPoint, Blur, CandlestickGeometry, CandlesticksSeries, CartesianChart, ChartView, CircleGeometry, ColoredRectangleGeometry, ColumnSeries, CubicBezierAreaGeometry, DashEffect, DoubleDict, DoughnutGeometry, DrawMarginFrame, Drawable, DrawingCanvas, DrawingFluentExtensions, DropShadow, GaugeBuilder, Geometry, GeometryVisual, HeatLand, HeatLandSeries, HeatPathShape, HeatSeries, ImageFilter, ImageFiltersMergeOperation, LabelGeometry, LabelVisual, LineGeometry, LineSegment, LineSeries, LinearGradientPaint, LiveChartsSkiaSharp, MapFactory, MoveToPathCommand, OvalGeometry, Paint, PaintTask, PathCommand, PathEffect, PathGeometry, PieChart, PieSeries, PolarAxis, PolarLineSeries, RadialGradientPaint, RectangleGeometry, RectangularSection, RoundedRectangleGeometry, RowSeries, SKDefaultLegend, SKDefaultTooltip, SKMatrixMotionProperty, SVGPathGeometry, ScatterSeries, SeriesVisual, SizedGeometry, SkiaDrawingContext, SkiaSharpProvider, SolidColorPaint, SquareGeometry, StackedAreaSeries, StackedColumnSeries, StackedRowSeries, StackedStepAreaSeries, StepLineAreaGeometry, StepLineSeries, StepPoint, ThemesExtensions, VariableGeometryVisual, VectorGeometry, VisualElementsExtensions };
