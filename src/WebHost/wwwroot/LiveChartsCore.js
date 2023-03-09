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
var _SeriesProperties, _MeasureWork, _ThemeId, _IsLoaded, _IsFirstDraw, _Canvas, _SeriesContext, _ControlSize, _DrawMarginLocation, _DrawMarginSize, _LegendPosition, _Legend, _TooltipPosition, _TooltipFindingStrategy, _Tooltip, _AnimationsSpeed, _EasingFunction, _VisualElements, _PreviousLegendPosition, _PreviousSeriesAtLegend, _AngleAxes, _RadiusAxes, _Series2, _FitToBounds, _TotalAnge, _InnerRadius, _InitialRotation, _View, _Series3, _ValueBounds, _IndexBounds, _PushoutBounds, _IsFirstDraw2, _XAxes, _YAxes, _Series4, _Sections, _IsZoomingOrPanning, _IsConfigured, _Default, _Function, _Speed, _Layers, _MapWidth, _MapHeight, _XOffset, _YOffset, _Chart, _HeatPaint, _HeatStops, _Bounds, _CoreMap, _MapFile, _Projector, _View2, _Pivot, _Direction, _BoundsHypotenuse, _Coordinates, _ShortName, _Name, _HSize, _HCenter, _Lands, _PropertyName, _IsValid, _HasPreviousState, _HasPreviousState2, _Coordinate2, _Coordinate3, _Coordinate4, _Coordinate5, _Coordinate6, _Coordinate7, _Coordinate8, _Coordinate9, _MaxVal, _MinVal, _AreaGeometry, _Bounds2, _CenterX, _CenterY, _InnerRadius2, _MaxRadius, _MinRadius, _MinAngle, _MaxAngle, _IsEmpty, _Max, _Min, _PaddingMax, _PaddingMin, _RequestedGeometrySize, _MinDelta, _IsEmpty2, _Chart2, _Series5, _Entity, _DataSource, _Visual, _Label, _HoverArea, _IsEmpty3, _PrimaryValue, _SecondaryValue, _TertiaryValue, _QuaternaryValue, _QuinaryValue, _CurrentThemeId, _Context, _Stroke, _Fill, _Enumerator, _PointerLocation, _VisualElements2;
import * as System from "/System.js";
function IsInterfaceOfISeries(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_ISeries" in obj.constructor;
}
class HeatLandSeries {
  constructor() {
    __publicField(this, "_heatPaint");
    __publicField(this, "_isHeatInCanvas", false);
    __publicField(this, "_heatMap", []);
    __publicField(this, "_colorStops");
    __publicField(this, "_lands");
    __publicField(this, "_isVisible", false);
    __publicField(this, "_subscribedTo", new System.HashSet());
    __publicField(this, "_observer");
    __publicField(this, "_everUsed", new System.HashSet());
    __publicField(this, "PropertyChanged", new System.Event());
    __publicField(this, "Name", "");
    this._observer = new CollectionDeepObserver((sender, e) => this.NotifySubscribers(), (sender, e) => this.NotifySubscribers());
  }
  get HeatMap() {
    return this._heatMap;
  }
  set HeatMap(value) {
    this._heatMap = value;
    this.OnPropertyChanged();
  }
  get ColorStops() {
    return this._colorStops;
  }
  set ColorStops(value) {
    this._colorStops = value;
    this.OnPropertyChanged();
  }
  get Lands() {
    return this._lands;
  }
  set Lands(value) {
    this._observer?.Dispose(this._lands);
    this._observer?.Initialize(value);
    this._lands = value;
    this.OnPropertyChanged();
  }
  get IsVisible() {
    return this._isVisible;
  }
  set IsVisible(value) {
    this._isVisible = value;
    this.OnPropertyChanged();
  }
  Measure(context) {
    this._subscribedTo.Add(context.CoreMap);
    if (this._heatPaint == null)
      throw new System.Exception("Default paint not found");
    if (!this._isHeatInCanvas) {
      context.View.Canvas.AddDrawableTask(this._heatPaint);
      this._isHeatInCanvas = true;
    }
    let i = context.View.Fill?.ZIndex ?? 0;
    this._heatPaint.ZIndex = i + 1;
    let bounds = new Bounds();
    if (this.Lands != null) {
      for (const shape of this.Lands) {
        bounds.AppendValue(shape.Value);
      }
    }
    let heatStops = HeatFunctions.BuildColorStops(this.HeatMap, this.ColorStops);
    let toRemove = new System.HashSet(this._everUsed);
    if (this.Lands != null) {
      for (const land of this.Lands) {
        Maps.BuildProjector(context.View.MapProjection, context.View.Width, context.View.Height);
        let heat = HeatFunctions.InterpolateColor(land.Value, bounds, this.HeatMap, heatStops);
        let mapLand = context.View.ActiveMap.FindLand(land.Name);
        if (mapLand == null)
          return;
        let shapesQuery = mapLand.Data.Select((x) => x.Shape).Where((x) => x != null).Cast();
        for (const pathShape of shapesQuery) {
          pathShape.FillColor = heat.Clone();
        }
        this._everUsed.Add(mapLand);
        toRemove.Remove(mapLand);
      }
    }
    this.ClearHeat(toRemove);
  }
  Delete(context) {
    this.ClearHeat(this._everUsed);
    this._subscribedTo.Remove(context.CoreMap);
  }
  IntitializeSeries(heatPaint) {
    this._heatPaint = heatPaint;
  }
  OnPropertyChanged(propertyName = null) {
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
  NotifySubscribers() {
    for (const chart of this._subscribedTo)
      chart.Update();
  }
  ClearHeat(toRemove) {
    for (const mapLand of toRemove) {
      let shapesQuery = mapLand.Data.Select((x) => x.Shape).Where((x) => x != null).Cast();
      for (const pathShape of shapesQuery) {
        pathShape.FillColor = LvcColor.Empty.Clone();
      }
      this._everUsed.Remove(mapLand);
    }
  }
}
__publicField(HeatLandSeries, "$meta_System_INotifyPropertyChanged", true);
class StepLineSeries extends StrokeAndFillCartesianSeries {
  constructor(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory, isStacked = false) {
    super(SeriesProperties.StepLine | SeriesProperties.PrimaryAxisVerticalOrientation | (isStacked ? SeriesProperties.Stacked : 0) | SeriesProperties.Sketch | SeriesProperties.PrefersXStrategyTooltips);
    __publicField(this, "_fillPathHelperDictionary", new System.Dictionary());
    __publicField(this, "_strokePathHelperDictionary", new System.Dictionary());
    __publicField(this, "_geometrySize", 14);
    __publicField(this, "_geometryFill");
    __publicField(this, "_geometryStroke");
    __publicField(this, "_enableNullSplitting", true);
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    __publicField(this, "_pathGeometryFactory");
    __publicField(this, "_visualPointFactory");
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this._pathGeometryFactory = pathGeometryFactory;
    this._visualPointFactory = visualPointFactory;
    this.DataPadding = new LvcPoint(0.5, 1);
  }
  get EnableNullSplitting() {
    return this._enableNullSplitting;
  }
  set EnableNullSplitting(value) {
    this.SetProperty(new System.Ref(() => this._enableNullSplitting, ($v) => this._enableNullSplitting = $v), value);
  }
  get GeometrySize() {
    return this._geometrySize;
  }
  set GeometrySize(value) {
    this.SetProperty(new System.Ref(() => this._geometrySize, ($v) => this._geometrySize = $v), value);
  }
  get GeometryFill() {
    return this._geometryFill;
  }
  set GeometryFill(value) {
    this.SetPaintProperty(new System.Ref(() => this._geometryFill, ($v) => this._geometryFill = $v), value);
  }
  get GeometryStroke() {
    return this._geometryStroke;
  }
  set GeometryStroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._geometryStroke, ($v) => this._geometryStroke = $v), value, true);
  }
  Invalidate(chart) {
    let strokePathHelperContainer;
    let fillPathHelperContainer;
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let secondaryScale = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
    let primaryScale = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    Extensions.GetActualScaler(secondaryAxis, cartesianChart);
    Extensions.GetActualScaler(primaryAxis, cartesianChart);
    let gs = this._geometrySize;
    let hgs = gs / 2;
    this.Stroke?.StrokeThickness ?? 0;
    let p = primaryScale.ToPixels(this.pivot);
    let segments = this._enableNullSplitting ? Extensions.SplitByNullGaps(this.Fetch(cartesianChart), (point) => this.DeleteNullPoint(point, secondaryScale, primaryScale)) : new System.List().Init([this.Fetch(cartesianChart)]);
    let stacker = (this.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup()) : null;
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (stacker != null) {
      actualZIndex = 1e3 - stacker.Position;
      if (this.Fill != null)
        this.Fill.ZIndex = actualZIndex;
      if (this.Stroke != null)
        this.Stroke.ZIndex = actualZIndex;
    }
    let dls = this.DataLabelsSize;
    let segmentI = 0;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    if (!this._strokePathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => strokePathHelperContainer, ($v) => strokePathHelperContainer = $v))) {
      strokePathHelperContainer = new System.List();
      this._strokePathHelperDictionary.SetAt(chart.Canvas.Sync, strokePathHelperContainer);
    }
    if (!this._fillPathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => fillPathHelperContainer, ($v) => fillPathHelperContainer = $v))) {
      fillPathHelperContainer = new System.List();
      this._fillPathHelperDictionary.SetAt(chart.Canvas.Sync, fillPathHelperContainer);
    }
    let uwx = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
    uwx = uwx < gs ? gs : uwx;
    for (const segment of segments) {
      let fillPath;
      let strokePath;
      let isNew = false;
      if (segmentI >= fillPathHelperContainer.length) {
        isNew = true;
        fillPath = this._pathGeometryFactory();
        fillPath.ClosingMethod = VectorClosingMethod.CloseToPivot;
        strokePath = this._pathGeometryFactory();
        strokePath.ClosingMethod = VectorClosingMethod.NotClosed;
        fillPathHelperContainer.Add(fillPath);
        strokePathHelperContainer.Add(strokePath);
      } else {
        fillPath = fillPathHelperContainer[segmentI];
        strokePath = strokePathHelperContainer[segmentI];
      }
      let strokeVector = new VectorManager(strokePath);
      let fillVector = new VectorManager(fillPath);
      if (this.Fill != null) {
        this.Fill.AddGeometryToPaintTask(cartesianChart.Canvas, fillPath);
        cartesianChart.Canvas.AddDrawableTask(this.Fill);
        this.Fill.ZIndex = actualZIndex + 0.1;
        this.Fill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        fillPath.Pivot = p;
        if (isNew) {
          Extensions.TransitionateProperties(fillPath, "fillPath.Pivot").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction)).CompleteCurrentTransitions();
        }
      }
      if (this.Stroke != null) {
        this.Stroke.AddGeometryToPaintTask(cartesianChart.Canvas, strokePath);
        cartesianChart.Canvas.AddDrawableTask(this.Stroke);
        this.Stroke.ZIndex = actualZIndex + 0.2;
        this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        strokePath.Pivot = p;
        if (isNew) {
          Extensions.TransitionateProperties(strokePath, "strokePath.Pivot").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction)).CompleteCurrentTransitions();
        }
      }
      let previousPrimary = 0;
      let previousSecondary = 0;
      for (const point of segment) {
        let s = 0;
        if (stacker != null)
          s = stacker.GetStack(point).Start;
        let visual = point.Context.Visual;
        let dp = point.PrimaryValue + s - previousPrimary;
        let ds = point.SecondaryValue - previousSecondary;
        if (visual == null) {
          let v = this._visualPointFactory();
          visual = v;
          if (this.IsFirstDraw) {
            v.Geometry.X = secondaryScale.ToPixels(point.SecondaryValue);
            v.Geometry.Y = p;
            v.Geometry.Width = 0;
            v.Geometry.Height = 0;
            v.StepSegment.Xi = secondaryScale.ToPixels(point.SecondaryValue - ds);
            v.StepSegment.Xj = secondaryScale.ToPixels(point.SecondaryValue);
            v.StepSegment.Yi = p;
            v.StepSegment.Yj = p;
          }
          point.Context.Visual = v;
          this.OnPointCreated(point);
        }
        this.everFetched.Add(point);
        this.GeometryFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);
        this.GeometryStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);
        visual.StepSegment.Id = point.Context.Entity.EntityIndex;
        if (this.Fill != null)
          fillVector.AddConsecutiveSegment(visual.StepSegment, !this.IsFirstDraw);
        if (this.Stroke != null)
          strokeVector.AddConsecutiveSegment(visual.StepSegment, !this.IsFirstDraw);
        visual.StepSegment.Xi = secondaryScale.ToPixels(point.SecondaryValue - ds);
        visual.StepSegment.Xj = secondaryScale.ToPixels(point.SecondaryValue);
        visual.StepSegment.Yi = primaryScale.ToPixels(point.PrimaryValue + s - dp);
        visual.StepSegment.Yj = primaryScale.ToPixels(point.PrimaryValue + s);
        let x = secondaryScale.ToPixels(point.SecondaryValue);
        let y = primaryScale.ToPixels(point.PrimaryValue + s);
        visual.Geometry.MotionProperties.GetAt("visual.Geometry.X").CopyFrom(visual.StepSegment.MotionProperties.GetAt("visual.StepSegment.Xj"));
        visual.Geometry.MotionProperties.GetAt("visual.Geometry.Y").CopyFrom(visual.StepSegment.MotionProperties.GetAt("visual.StepSegment.Yj"));
        visual.Geometry.TranslateTransform = new LvcPoint(-hgs, -hgs);
        visual.Geometry.Width = gs;
        visual.Geometry.Height = gs;
        visual.Geometry.RemoveOnCompleted = false;
        visual.FillPath = fillPath;
        visual.StrokePath = strokePath;
        let ha;
        if (point.Context.HoverArea instanceof RectangleHoverArea)
          ha = point.Context.HoverArea;
        else
          point.Context.HoverArea = ha = new RectangleHoverArea();
        ha.SetDimensions(x - uwx * 0.5, y - hgs, uwx, gs);
        pointsCleanup.Clean(point);
        if (this.DataLabelsPaint != null) {
          let label = point.Context.Label;
          if (label == null) {
            let l = this._labelFactory();
            l.X = x - hgs;
            l.Y = p - hgs;
            l.RotateTransform = this.DataLabelsRotation;
            Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
            l.CompleteTransition(null);
            label = l;
            point.Context.Label = l;
          }
          this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
          label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
          label.TextSize = dls;
          label.Padding = this.DataLabelsPadding;
          let m = label.Measure(this.DataLabelsPaint);
          let labelPosition = this.GetLabelPosition(x - hgs, y - hgs, gs, gs, m.Clone(), this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > this.Pivot, drawLocation.Clone(), drawMarginSize.Clone());
          if (this.DataLabelsTranslate != null)
            label.TranslateTransform = new LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
          label.X = labelPosition.X;
          label.Y = labelPosition.Y;
        }
        this.OnPointMeasured(point);
        previousPrimary = point.PrimaryValue + s;
        previousSecondary = point.SecondaryValue;
      }
      strokeVector.End();
      fillVector.End();
      if (this.GeometryFill != null) {
        cartesianChart.Canvas.AddDrawableTask(this.GeometryFill);
        this.GeometryFill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        this.GeometryFill.ZIndex = actualZIndex + 0.3;
      }
      if (this.GeometryStroke != null) {
        cartesianChart.Canvas.AddDrawableTask(this.GeometryStroke);
        this.GeometryStroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        this.GeometryStroke.ZIndex = actualZIndex + 0.4;
      }
      segmentI++;
    }
    while (segmentI > fillPathHelperContainer.length) {
      let iFill = fillPathHelperContainer.length - 1;
      let fillHelper = fillPathHelperContainer[iFill];
      this.Fill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, fillHelper);
      fillPathHelperContainer.RemoveAt(iFill);
      let iStroke = strokePathHelperContainer.length - 1;
      let strokeHelper = strokePathHelperContainer[iStroke];
      this.Stroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, strokeHelper);
      strokePathHelperContainer.RemoveAt(iStroke);
    }
    if (this.DataLabelsPaint != null) {
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.5;
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
    this.IsFirstDraw = false;
  }
  GetRequestedGeometrySize() {
    return (this.GeometrySize + (this.GeometryStroke?.StrokeThickness ?? 0)) * 0.5;
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.GeometryFill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.GeometryFill, this._visualFactory()));
    else if (this.Fill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
    if (this.GeometryStroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.GeometryStroke, this._visualFactory()));
    else if (this.Stroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
  MiniatureEquals(series) {
    if (series instanceof StepLineSeries) {
      const stepSeries = series;
      return this.Name == series.Name && !this.PaintsChanged && this.Fill == stepSeries.Fill && this.Stroke == stepSeries.Stroke && this.GeometryFill == stepSeries.GeometryFill && this.GeometryStroke == stepSeries.GeometryStroke;
    }
    return false;
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual.Geometry, "visual.Geometry.X", "visual.Geometry.Y", "visual.Geometry.Width", "visual.Geometry.Height", "visual.Geometry.TranslateTransform").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
    Extensions.TransitionateProperties(visual.StepSegment, "visual.StepSegment.Xi", "visual.StepSegment.Yi", "visual.StepSegment.Xj", "visual.StepSegment.Yj").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let chartView = point.Context.Chart;
    if (chartView.Core.IsZoomingOrPanning) {
      visual.Geometry.CompleteTransition(null);
      visual.Geometry.RemoveOnCompleted = true;
      this.DataFactory.DisposePoint(point);
      return;
    }
    let x = secondaryScale.ToPixels(point.SecondaryValue);
    let y = primaryScale.ToPixels(point.PrimaryValue);
    visual.Geometry.X = x;
    visual.Geometry.Y = y;
    visual.Geometry.Height = 0;
    visual.Geometry.Width = 0;
    visual.Geometry.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
  SoftDeleteOrDispose(chart) {
    super.SoftDeleteOrDispose(chart);
    let canvas = chart.CoreCanvas;
    if (this.Fill != null) {
      for (const activeChartContainer of this._fillPathHelperDictionary.Values)
        for (const pathHelper of activeChartContainer)
          this.Fill.RemoveGeometryFromPainTask(canvas, pathHelper);
    }
    if (this.Stroke != null) {
      for (const activeChartContainer of this._strokePathHelperDictionary.Values)
        for (const pathHelper of activeChartContainer)
          this.Stroke.RemoveGeometryFromPainTask(canvas, pathHelper);
    }
    if (this.GeometryFill != null)
      canvas.RemovePaintTask(this.GeometryFill);
    if (this.GeometryStroke != null)
      canvas.RemovePaintTask(this.GeometryStroke);
  }
  RemoveFromUI(chart) {
    super.RemoveFromUI(chart);
    this._fillPathHelperDictionary.Remove(chart.Canvas.Sync);
    this._strokePathHelperDictionary.Remove(chart.Canvas.Sync);
  }
  GetPaintTasks() {
    return [this.Stroke, this.Fill, this._geometryFill, this._geometryStroke, this.DataLabelsPaint, this.hoverPaint];
  }
  DeleteNullPoint(point, xScale, yScale) {
    let visual;
    if (point.Context.Visual instanceof StepLineVisualPoint)
      visual = point.Context.Visual;
    else
      return;
    let x = xScale.ToPixels(point.SecondaryValue);
    let y = yScale.ToPixels(point.PrimaryValue);
    let gs = this._geometrySize;
    let hgs = gs / 2;
    visual.Geometry.X = x - hgs;
    visual.Geometry.Y = y - hgs;
    visual.Geometry.Width = gs;
    visual.Geometry.Height = gs;
    visual.Geometry.RemoveOnCompleted = true;
    point.Context.Visual = null;
  }
}
const _Series = class extends ChartElement {
  constructor(properties) {
    super();
    __publicField(this, "subscribedTo", new System.HashSet());
    __publicField(this, "implementsICP");
    __publicField(this, "pivot", 0);
    __publicField(this, "everFetched", new System.HashSet());
    __publicField(this, "hoverPaint");
    __publicField(this, "_requestedCustomMeasureHandler", false);
    __publicField(this, "_customMeasureHandler", null);
    __publicField(this, "_observer");
    __publicField(this, "_values");
    __publicField(this, "_name");
    __publicField(this, "_mapping");
    __publicField(this, "_zIndex", 0);
    __publicField(this, "_tooltipLabelFormatter", (point) => `${point.Context.Series.Name} ${point.PrimaryValue}`);
    __publicField(this, "_dataLabelsFormatter", (point) => `${point.PrimaryValue}`);
    __publicField(this, "_isVisible", true);
    __publicField(this, "_dataPadding", new LvcPoint(0.5, 0.5).Clone());
    __publicField(this, "_dataFactory");
    __publicField(this, "_isVisibleAtLegend", true);
    __publicField(this, "_miniatureShapeSize", 12);
    __publicField(this, "_miniatureSketch", new Sketch());
    __publicField(this, "_easingFunction");
    __publicField(this, "_animationsSpeed");
    __publicField(this, "PaintsChanged", false);
    __privateAdd(this, _SeriesProperties, 0);
    __publicField(this, "SeriesId", -1);
    __publicField(this, "PointMeasured", new System.Event());
    __publicField(this, "PointCreated", new System.Event());
    __publicField(this, "DataPointerDown", new System.Event());
    __publicField(this, "DataPointerHover", new System.Event());
    __publicField(this, "DataPointerHoverLost", new System.Event());
    __publicField(this, "ChartPointPointerHover", new System.Event());
    __publicField(this, "ChartPointPointerHoverLost", new System.Event());
    __publicField(this, "ChartPointPointerDown", new System.Event());
    __publicField(this, "IsHoverable", true);
    __publicField(this, "VisibilityChanged", new System.Event());
    this.SeriesProperties = properties;
    this._observer = new CollectionDeepObserver((sender, e) => this.NotifySubscribers(), (sender, e) => this.NotifySubscribers());
  }
  get ActivePoints() {
    return this.everFetched;
  }
  get SeriesProperties() {
    return __privateGet(this, _SeriesProperties);
  }
  set SeriesProperties(value) {
    __privateSet(this, _SeriesProperties, value);
  }
  get Name() {
    return this._name;
  }
  set Name(value) {
    this.SetProperty(new System.Ref(() => this._name, ($v) => this._name = $v), value);
  }
  get Values() {
    return this._values;
  }
  set Values(value) {
    this._observer?.Dispose(this._values);
    this._observer?.Initialize(value);
    this._values = value;
    this.OnPropertyChanged();
  }
  get Pivot() {
    return this.pivot;
  }
  set Pivot(value) {
    this.SetProperty(new System.Ref(() => this.pivot, ($v) => this.pivot = $v), value);
  }
  get Mapping() {
    return this._mapping;
  }
  set Mapping(value) {
    this.SetProperty(new System.Ref(() => this._mapping, ($v) => this._mapping = $v), value);
  }
  get RequiresFindClosestOnPointerDown() {
    return this.DataPointerDown != null || this.ChartPointPointerDown != null;
  }
  get ZIndex() {
    return this._zIndex;
  }
  set ZIndex(value) {
    this.SetProperty(new System.Ref(() => this._zIndex, ($v) => this._zIndex = $v), value);
  }
  get TooltipLabelFormatter() {
    return this._tooltipLabelFormatter;
  }
  set TooltipLabelFormatter(value) {
    this.SetProperty(new System.Ref(() => this._tooltipLabelFormatter, ($v) => this._tooltipLabelFormatter = $v), value);
  }
  get DataLabelsFormatter() {
    return this._dataLabelsFormatter;
  }
  set DataLabelsFormatter(value) {
    this.SetProperty(new System.Ref(() => this._dataLabelsFormatter, ($v) => this._dataLabelsFormatter = $v), value);
  }
  get IsVisible() {
    return this._isVisible;
  }
  set IsVisible(value) {
    this.SetProperty(new System.Ref(() => this._isVisible, ($v) => this._isVisible = $v), value);
  }
  get IsVisibleAtLegend() {
    return this._isVisibleAtLegend;
  }
  set IsVisibleAtLegend(value) {
    this.SetProperty(new System.Ref(() => this._isVisibleAtLegend, ($v) => this._isVisibleAtLegend = $v), value);
  }
  get DataPadding() {
    return this._dataPadding;
  }
  set DataPadding(value) {
    this.SetProperty(new System.Ref(() => this._dataPadding, ($v) => this._dataPadding = $v), value.Clone());
  }
  get AnimationsSpeed() {
    return this._animationsSpeed;
  }
  set AnimationsSpeed(value) {
    this.SetProperty(new System.Ref(() => this._animationsSpeed, ($v) => this._animationsSpeed = $v), value);
  }
  get EasingFunction() {
    return this._easingFunction;
  }
  set EasingFunction(value) {
    this.SetProperty(new System.Ref(() => this._easingFunction, ($v) => this._easingFunction = $v), value);
  }
  get DataFactory() {
    if (this._dataFactory == null) {
      let factory = LiveCharts.DefaultSettings.GetProvider();
      this._dataFactory = factory.GetDefaultDataFactory();
    }
    return this._dataFactory;
  }
  get LegendShapeSize() {
    return this.MiniatureShapeSize;
  }
  set LegendShapeSize(value) {
    this.MiniatureShapeSize = value;
  }
  get MiniatureShapeSize() {
    return this._miniatureShapeSize;
  }
  set MiniatureShapeSize(value) {
    this._miniatureShapeSize = value;
    this.OnMiniatureChanged();
    this.SetProperty(new System.Ref(() => this._miniatureShapeSize, ($v) => this._miniatureShapeSize = $v), value);
  }
  get CanvasSchedule() {
    return this._miniatureSketch;
  }
  set CanvasSchedule(value) {
    this.SetProperty(new System.Ref(() => this._miniatureSketch, ($v) => this._miniatureSketch = $v), value);
  }
  GetStackGroup() {
    return 0;
  }
  Fetch(chart) {
    this.subscribedTo.Add(chart);
    return this.DataFactory.Fetch(this, chart);
  }
  OnDataPointerDown(chart, points, pointer) {
    this.DataPointerDown.Invoke(chart, points.Select((point) => new ChartPoint3(point)));
    this.ChartPointPointerDown.Invoke(chart, new ChartPoint3(Extensions.FindClosestTo(points, pointer.Clone())));
  }
  FindHitPoints(chart, pointerPosition, strategy) {
    let motionCanvas = chart.Canvas;
    if (motionCanvas.StartPoint != null) {
      pointerPosition.X -= motionCanvas.StartPoint.X;
      pointerPosition.Y -= motionCanvas.StartPoint.Y;
    }
    let query = this.Fetch(chart).Where((x) => x.Context.HoverArea != null && x.Context.HoverArea.IsPointerOver(pointerPosition.Clone(), strategy));
    let s = Math.floor(strategy) & 4294967295;
    if (s >= 4 && s <= 6) {
      query = Extensions.SelectFirst(query.Select((x) => {
        return { distance: x.DistanceTo(pointerPosition.Clone()), point: x };
      }).OrderBy((x) => x.distance), (x) => x.point);
    }
    return query;
  }
  OnPointerEnter(point) {
    this.WhenPointerEnters(point);
  }
  OnPointerLeft(point) {
    this.WhenPointerLeaves(point);
  }
  RestartAnimations() {
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    this.DataFactory.RestartVisuals();
  }
  GetTooltipText(point) {
    return this.TooltipLabelFormatter(new ChartPoint3(point));
  }
  GetDataLabelText(point) {
    return this.DataLabelsFormatter(new ChartPoint3(point));
  }
  RemoveFromUI(chart) {
    super.RemoveFromUI(chart);
    this.DataFactory?.Dispose(chart);
    this._dataFactory = null;
    this.everFetched = new System.HashSet();
  }
  ConvertToTypedChartPoint(point) {
    return new ChartPoint3(point);
  }
  BuildMiniatureSchedule(paint, geometry) {
    let paintClone = paint.CloneTask();
    let st = paint.IsStroke ? paint.StrokeThickness : 0;
    if (st > _Series.MAX_MINIATURE_STROKE_WIDTH) {
      st = _Series.MAX_MINIATURE_STROKE_WIDTH;
      paintClone.StrokeThickness = _Series.MAX_MINIATURE_STROKE_WIDTH;
    }
    geometry.X = 0.5 * st;
    geometry.Y = 0.5 * st;
    geometry.Height = this.MiniatureShapeSize;
    geometry.Width = this.MiniatureShapeSize;
    if (paint.IsStroke)
      paintClone.ZIndex = 1;
    return new PaintSchedule(paintClone, geometry);
  }
  OnPointMeasured(chartPoint) {
    this.PointMeasured.Invoke(new ChartPoint3(chartPoint));
  }
  OnPointCreated(chartPoint) {
    this.SetDefaultPointTransitions(chartPoint);
    this.PointCreated.Invoke(new ChartPoint3(chartPoint));
  }
  OnVisibilityChanged() {
    this.VisibilityChanged.Invoke(this);
  }
  WhenPointerEnters(point) {
    let chartView = point.Context.Chart;
    if (this.hoverPaint == null) {
      let coreChart = chartView.CoreChart;
      this.hoverPaint = LiveCharts.DefaultSettings.GetProvider().GetSolidColorPaint(new LvcColor(255, 255, 255, 100));
      this.hoverPaint.ZIndex = 10049;
      this.hoverPaint.SetClipRectangle(chartView.CoreCanvas, new LvcRectangle(coreChart.DrawMarginLocation.Clone(), coreChart.DrawMarginSize.Clone()));
    }
    chartView.CoreCanvas.AddDrawableTask(this.hoverPaint);
    let visual = point.Context.Visual;
    if (visual == null || visual.MainGeometry == null)
      return;
    this.hoverPaint.AddGeometryToPaintTask(chartView.CoreCanvas, visual.MainGeometry);
    this.DataPointerHover.Invoke(point.Context.Chart, new ChartPoint3(point));
    this.ChartPointPointerHover.Invoke(point.Context.Chart, new ChartPoint3(point));
  }
  WhenPointerLeaves(point) {
    if (this.hoverPaint == null)
      return;
    let visual = point.Context.Visual;
    if (visual == null || visual.MainGeometry == null)
      return;
    this.hoverPaint.RemoveGeometryFromPainTask(point.Context.Chart.CoreChart.Canvas, visual.MainGeometry);
    this.DataPointerHoverLost.Invoke(point.Context.Chart, new ChartPoint3(point));
    this.ChartPointPointerHoverLost.Invoke(point.Context.Chart, new ChartPoint3(point));
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnMiniatureChanged();
    this.PaintsChanged = true;
  }
  OnMiniatureChanged() {
    this.CanvasSchedule = this.GetMiniatresSketch();
  }
  NotifySubscribers() {
    for (const chart of this.subscribedTo)
      chart.Update();
  }
};
let Series = _Series;
_SeriesProperties = new WeakMap();
__publicField(Series, "$meta_LiveChartsCore_ISeries", true);
__publicField(Series, "$meta_System_INotifyPropertyChanged", true);
__publicField(Series, "MAX_MINIATURE_STROKE_WIDTH", 3.5);
class Chart {
  constructor(canvas, defaultPlatformConfig, view) {
    __publicField(this, "_everMeasuredElements", new System.HashSet());
    __publicField(this, "_toDeleteElements", new System.HashSet());
    __publicField(this, "_preserveFirstDraw", false);
    __publicField(this, "_updateThrottler");
    __publicField(this, "_tooltipThrottler");
    __publicField(this, "_panningThrottler");
    __publicField(this, "_pointerPosition", new LvcPoint(-10, -10).Clone());
    __publicField(this, "_pointerPanningStartPosition", new LvcPoint(-10, -10).Clone());
    __publicField(this, "_pointerPanningPosition", new LvcPoint(-10, -10).Clone());
    __publicField(this, "_pointerPreviousPanningPosition", new LvcPoint(-10, -10).Clone());
    __publicField(this, "_isPanning", false);
    __publicField(this, "_isPointerIn", false);
    __publicField(this, "_activePoints", new System.Dictionary());
    __publicField(this, "_previousSize", LvcSize.Empty.Clone());
    __publicField(this, "Measuring", new System.Event());
    __publicField(this, "UpdateStarted", new System.Event());
    __publicField(this, "UpdateFinished", new System.Event());
    __publicField(this, "PointerDown", new System.Event());
    __publicField(this, "PointerMove", new System.Event());
    __publicField(this, "PointerUp", new System.Event());
    __publicField(this, "PointerLeft", new System.Event());
    __publicField(this, "PanGesture", new System.Event());
    __privateAdd(this, _MeasureWork, {});
    __privateAdd(this, _ThemeId, {});
    __privateAdd(this, _IsLoaded, false);
    __privateAdd(this, _IsFirstDraw, true);
    __privateAdd(this, _Canvas, void 0);
    __privateAdd(this, _SeriesContext, new SeriesContext([]));
    __privateAdd(this, _ControlSize, LvcSize.Empty.Clone());
    __privateAdd(this, _DrawMarginLocation, LvcPoint.Empty.Clone());
    __privateAdd(this, _DrawMarginSize, LvcSize.Empty.Clone());
    __privateAdd(this, _LegendPosition, 0);
    __privateAdd(this, _Legend, void 0);
    __privateAdd(this, _TooltipPosition, 0);
    __privateAdd(this, _TooltipFindingStrategy, 0);
    __privateAdd(this, _Tooltip, void 0);
    __privateAdd(this, _AnimationsSpeed, System.TimeSpan.Empty.Clone());
    __privateAdd(this, _EasingFunction, void 0);
    __privateAdd(this, _VisualElements, []);
    __privateAdd(this, _PreviousLegendPosition, 0);
    __privateAdd(this, _PreviousSeriesAtLegend, []);
    this.Canvas = canvas;
    canvas.Validated.Add(this.OnCanvasValidated, this);
    this.EasingFunction = EasingFunctions.QuadraticOut;
    if (!LiveCharts.IsConfigured)
      LiveCharts.Configure(defaultPlatformConfig);
    this._updateThrottler = view.DesignerMode ? new ActionThrottler(() => Promise.resolve(), System.TimeSpan.FromMilliseconds(50)) : new ActionThrottler(this.UpdateThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(50));
    this._updateThrottler.ThrottlerTimeSpan = view.UpdaterThrottler;
    this.PointerDown.Add(this.Chart_PointerDown, this);
    this.PointerMove.Add(this.Chart_PointerMove, this);
    this.PointerUp.Add(this.Chart_PointerUp, this);
    this.PointerLeft.Add(this.Chart_PointerLeft, this);
    this._tooltipThrottler = new ActionThrottler(this.TooltipThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(10));
    this._panningThrottler = new ActionThrottler(this.PanningThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(30));
  }
  get ActualBounds() {
    return new AnimatableContainer();
  }
  get MeasureWork() {
    return __privateGet(this, _MeasureWork);
  }
  set MeasureWork(value) {
    __privateSet(this, _MeasureWork, value);
  }
  get ThemeId() {
    return __privateGet(this, _ThemeId);
  }
  set ThemeId(value) {
    __privateSet(this, _ThemeId, value);
  }
  get IsLoaded() {
    return __privateGet(this, _IsLoaded);
  }
  set IsLoaded(value) {
    __privateSet(this, _IsLoaded, value);
  }
  get IsFirstDraw() {
    return __privateGet(this, _IsFirstDraw);
  }
  set IsFirstDraw(value) {
    __privateSet(this, _IsFirstDraw, value);
  }
  get Canvas() {
    return __privateGet(this, _Canvas);
  }
  set Canvas(value) {
    __privateSet(this, _Canvas, value);
  }
  get SeriesContext() {
    return __privateGet(this, _SeriesContext);
  }
  set SeriesContext(value) {
    __privateSet(this, _SeriesContext, value);
  }
  get ControlSize() {
    return __privateGet(this, _ControlSize);
  }
  set ControlSize(value) {
    __privateSet(this, _ControlSize, value);
  }
  get DrawMarginLocation() {
    return __privateGet(this, _DrawMarginLocation);
  }
  set DrawMarginLocation(value) {
    __privateSet(this, _DrawMarginLocation, value);
  }
  get DrawMarginSize() {
    return __privateGet(this, _DrawMarginSize);
  }
  set DrawMarginSize(value) {
    __privateSet(this, _DrawMarginSize, value);
  }
  get LegendPosition() {
    return __privateGet(this, _LegendPosition);
  }
  set LegendPosition(value) {
    __privateSet(this, _LegendPosition, value);
  }
  get Legend() {
    return __privateGet(this, _Legend);
  }
  set Legend(value) {
    __privateSet(this, _Legend, value);
  }
  get TooltipPosition() {
    return __privateGet(this, _TooltipPosition);
  }
  set TooltipPosition(value) {
    __privateSet(this, _TooltipPosition, value);
  }
  get TooltipFindingStrategy() {
    return __privateGet(this, _TooltipFindingStrategy);
  }
  set TooltipFindingStrategy(value) {
    __privateSet(this, _TooltipFindingStrategy, value);
  }
  get Tooltip() {
    return __privateGet(this, _Tooltip);
  }
  set Tooltip(value) {
    __privateSet(this, _Tooltip, value);
  }
  get AnimationsSpeed() {
    return __privateGet(this, _AnimationsSpeed);
  }
  set AnimationsSpeed(value) {
    __privateSet(this, _AnimationsSpeed, value);
  }
  get EasingFunction() {
    return __privateGet(this, _EasingFunction);
  }
  set EasingFunction(value) {
    __privateSet(this, _EasingFunction, value);
  }
  get VisualElements() {
    return __privateGet(this, _VisualElements);
  }
  set VisualElements(value) {
    __privateSet(this, _VisualElements, value);
  }
  get PreviousLegendPosition() {
    return __privateGet(this, _PreviousLegendPosition);
  }
  set PreviousLegendPosition(value) {
    __privateSet(this, _PreviousLegendPosition, value);
  }
  get PreviousSeriesAtLegend() {
    return __privateGet(this, _PreviousSeriesAtLegend);
  }
  set PreviousSeriesAtLegend(value) {
    __privateSet(this, _PreviousSeriesAtLegend, value);
  }
  Update(chartUpdateParams = null) {
    chartUpdateParams ?? (chartUpdateParams = new ChartUpdateParams());
    if (chartUpdateParams.IsAutomaticUpdate && !this.View.AutoUpdateEnabled)
      return;
    this._updateThrottler.ThrottlerTimeSpan = this.View.UpdaterThrottler;
    if (!chartUpdateParams.Throttling) {
      this._updateThrottler.ForceCall();
      return;
    }
    this._updateThrottler.Call();
  }
  Load() {
    this.IsLoaded = true;
    this.IsFirstDraw = true;
    this.Update();
  }
  Unload() {
    this.IsLoaded = false;
    this._everMeasuredElements.Clear();
    this._toDeleteElements.Clear();
    this._activePoints.Clear();
    this.Canvas.Dispose();
  }
  ClearTooltipData() {
    for (const point of this._activePoints.Keys.ToArray()) {
      let cp = point;
      cp.Context.Series.OnPointerLeft(cp);
      this._activePoints.Remove(point);
    }
    this.Canvas.Invalidate();
  }
  InvokePointerDown(point, isSecondaryAction) {
    this.PointerDown.Invoke(point.Clone());
    let strategy = Extensions.GetTooltipFindingStrategy(this.ChartSeries);
    for (const series of this.ChartSeries) {
      if (!series.RequiresFindClosestOnPointerDown)
        continue;
      let points = series.FindHitPoints(this, point.Clone(), strategy);
      if (!points.Any())
        continue;
      series.OnDataPointerDown(this.View, points, point.Clone());
    }
    let iterablePoints = this.ChartSeries.SelectMany((x) => x.FindHitPoints(this, point.Clone(), strategy));
    this.View.OnDataPointerDown(iterablePoints, point.Clone());
    let iterableVisualElements = this.VisualElements.Cast().SelectMany((x) => x.IsHitBy(this, point.Clone()));
    this.View.OnVisualElementPointerDown(iterableVisualElements, point.Clone());
  }
  InvokePointerMove(point) {
    this.PointerMove.Invoke(point.Clone());
  }
  InvokePointerUp(point, isSecondaryAction) {
    this.PointerUp.Invoke(point.Clone());
  }
  InvokePointerLeft() {
    this.PointerLeft.Invoke();
  }
  InvokePanGestrue(eventArgs) {
    this.PanGesture.Invoke(eventArgs);
  }
  SetDrawMargin(controlSize, margin) {
    this.DrawMarginSize = new LvcSize().Init({
      Width: controlSize.Width - margin.Left - margin.Right,
      Height: controlSize.Height - margin.Top - margin.Bottom
    });
    this.DrawMarginLocation = new LvcPoint(margin.Left, margin.Top);
  }
  SetPreviousSize() {
    this._previousSize = this.ControlSize.Clone();
  }
  InvokeOnMeasuring() {
    this.Measuring.Invoke(this.View);
  }
  InvokeOnUpdateStarted() {
    this.SetPreviousSize();
    this.UpdateStarted.Invoke(this.View);
  }
  InvokeOnUpdateFinished() {
    this.UpdateFinished.Invoke(this.View);
  }
  SizeChanged() {
    return this._previousSize.Width != this.ControlSize.Width || this._previousSize.Height != this.ControlSize.Height;
  }
  SeriesMiniatureChanged(newSeries, position) {
    if (position == LegendPosition.Hidden && this.PreviousLegendPosition == LegendPosition.Hidden)
      return false;
    if (position != this.PreviousLegendPosition)
      return true;
    if (this.PreviousSeriesAtLegend.length != newSeries.length)
      return true;
    for (let i = 0; i < newSeries.length; i++) {
      if (i + 1 > this.PreviousSeriesAtLegend.length)
        return true;
      let a = this.PreviousSeriesAtLegend[i];
      let b = newSeries[i];
      if (!a.MiniatureEquals(b))
        return true;
    }
    return false;
  }
  UpdateThrottlerUnlocked() {
    return new Promise(($resolve) => {
      this.View.InvokeOnUIThread(() => {
        {
          this.Measure();
        }
      });
      $resolve();
    });
  }
  UpdateBounds() {
    this.ActualBounds.Location = this.DrawMarginLocation.Clone();
    this.ActualBounds.Size = this.DrawMarginSize.Clone();
    if (this.IsFirstDraw) {
      Extensions.TransitionateProperties(this.ActualBounds, null).WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed).WithEasingFunction(this.EasingFunction)).CompleteCurrentTransitions();
      this.Canvas.Trackers.Add(this.ActualBounds);
    }
  }
  InitializeVisualsCollector() {
    this._toDeleteElements = new System.HashSet(this._everMeasuredElements);
  }
  AddVisual(element) {
    element.Invalidate(this);
    element.RemoveOldPaints(this.View);
    this._everMeasuredElements.Add(element);
    this._toDeleteElements.Remove(element);
  }
  RemoveVisual(element) {
    element.RemoveFromUI(this);
    this._everMeasuredElements.Remove(element);
    this._toDeleteElements.Remove(element);
  }
  CollectVisuals() {
    for (const visual of this._toDeleteElements) {
      if (IsInterfaceOfISeries(visual)) {
        const series = visual;
        series.SoftDeleteOrDispose(this.View);
      } else {
        visual.RemoveFromUI(this);
      }
      this._everMeasuredElements.Remove(visual);
    }
    this._toDeleteElements = new System.HashSet();
  }
  DrawLegend(seriesInLegend) {
    if (this.Legend != null && (this.SeriesMiniatureChanged(seriesInLegend, this.LegendPosition) || this.SizeChanged())) {
      if (IsInterfaceOfIImageControl(this.Legend)) {
        const imageLegend = this.Legend;
        imageLegend.Measure(this);
        if (this.LegendPosition == LegendPosition.Left || this.LegendPosition == LegendPosition.Right)
          this.ControlSize = new LvcSize(this.ControlSize.Width - imageLegend.Size.Width, this.ControlSize.Height).Clone();
        if (this.LegendPosition == LegendPosition.Top || this.LegendPosition == LegendPosition.Bottom)
          this.ControlSize = new LvcSize(this.ControlSize.Width, this.ControlSize.Height - imageLegend.Size.Height).Clone();
        this.Canvas.StartPoint = new LvcPoint(0, 0);
        this.Legend.Draw(this);
        this.PreviousLegendPosition = this.LegendPosition;
        this.PreviousSeriesAtLegend = seriesInLegend;
        for (const series of this.PreviousSeriesAtLegend.Cast())
          series.PaintsChanged = false;
        this._preserveFirstDraw = this.IsFirstDraw;
      } else {
        this.Legend.Draw(this);
        this.PreviousLegendPosition = this.LegendPosition;
        this.PreviousSeriesAtLegend = seriesInLegend;
        for (const series of this.PreviousSeriesAtLegend.Cast())
          series.PaintsChanged = false;
        this._preserveFirstDraw = this.IsFirstDraw;
        this.SetPreviousSize();
        this.Measure();
        return;
      }
    }
  }
  TooltipThrottlerUnlocked() {
    return new Promise(($resolve) => {
      this.View.InvokeOnUIThread(() => {
        {
          if (this._pointerPosition.X < this.DrawMarginLocation.X || this._pointerPosition.X > this.DrawMarginLocation.X + this.DrawMarginSize.Width || this._pointerPosition.Y < this.DrawMarginLocation.Y || this._pointerPosition.Y > this.DrawMarginLocation.Y + this.DrawMarginSize.Height) {
            return;
          }
          let points = this.FindHoveredPointsBy(this._pointerPosition.Clone());
          if (!points.Any()) {
            this.ClearTooltipData();
            this.Tooltip?.Hide();
            return;
          }
          if (this._activePoints.length > 0 && points.All((x) => this._activePoints.ContainsKey(x)))
            return;
          let o = {};
          for (const tooltipPoint of points) {
            tooltipPoint.Context.Series.OnPointerEnter(tooltipPoint);
            this._activePoints.SetAt(tooltipPoint, o);
          }
          for (const point of this._activePoints.Keys.ToArray()) {
            if (this._activePoints.GetAt(point) == o)
              continue;
            point.Context.Series.OnPointerLeft(point);
            this._activePoints.Remove(point);
          }
          if (this.TooltipPosition != TooltipPosition.Hidden)
            this.Tooltip?.Show(points, this);
          this.Canvas.Invalidate();
        }
      });
      $resolve();
    });
  }
  PanningThrottlerUnlocked() {
    return new Promise(($resolve) => {
      this.View.InvokeOnUIThread(() => {
        let cartesianChart;
        if (this instanceof CartesianChart)
          cartesianChart = this;
        else
          return;
        {
          let dx = this._pointerPanningPosition.X - this._pointerPreviousPanningPosition.X;
          let dy = this._pointerPanningPosition.Y - this._pointerPreviousPanningPosition.Y;
          if (dx == 0)
            dx = this._pointerPanningStartPosition.X - this._pointerPanningPosition.X > 0 ? -0.01 : 0.01;
          if (dy == 0)
            dy = this._pointerPanningStartPosition.Y - this._pointerPanningPosition.Y > 0 ? -0.01 : 0.01;
          cartesianChart.Pan(new LvcPoint(dx, dy), this._isPanning);
          this._pointerPreviousPanningPosition = new LvcPoint(this._pointerPanningPosition.X, this._pointerPanningPosition.Y);
        }
      });
      $resolve();
    });
  }
  OnCanvasValidated(chart) {
    this.InvokeOnUpdateFinished();
  }
  Chart_PointerDown(pointerPosition) {
    this._isPanning = true;
    this._pointerPreviousPanningPosition = pointerPosition.Clone();
    this._pointerPanningStartPosition = pointerPosition.Clone();
  }
  Chart_PointerMove(pointerPosition) {
    this._pointerPosition = pointerPosition.Clone();
    this._isPointerIn = true;
    this._tooltipThrottler.Call();
    if (!this._isPanning)
      return;
    this._pointerPanningPosition = pointerPosition.Clone();
    this._panningThrottler.Call();
  }
  Chart_PointerLeft() {
    this._isPointerIn = false;
  }
  Chart_PointerUp(pointerPosition) {
    if (!this._isPanning)
      return;
    this._isPanning = false;
    this._pointerPanningPosition = pointerPosition.Clone();
    this._panningThrottler.Call();
  }
}
_MeasureWork = new WeakMap();
_ThemeId = new WeakMap();
_IsLoaded = new WeakMap();
_IsFirstDraw = new WeakMap();
_Canvas = new WeakMap();
_SeriesContext = new WeakMap();
_ControlSize = new WeakMap();
_DrawMarginLocation = new WeakMap();
_DrawMarginSize = new WeakMap();
_LegendPosition = new WeakMap();
_Legend = new WeakMap();
_TooltipPosition = new WeakMap();
_TooltipFindingStrategy = new WeakMap();
_Tooltip = new WeakMap();
_AnimationsSpeed = new WeakMap();
_EasingFunction = new WeakMap();
_VisualElements = new WeakMap();
_PreviousLegendPosition = new WeakMap();
_PreviousSeriesAtLegend = new WeakMap();
class Section extends ChartElement {
  constructor() {
    super(...arguments);
    __publicField(this, "_stroke", null);
    __publicField(this, "_fill", null);
    __publicField(this, "_xi");
    __publicField(this, "_xj");
    __publicField(this, "_yi");
    __publicField(this, "_yj");
    __publicField(this, "_scalesXAt", 0);
    __publicField(this, "_scalesYAt", 0);
    __publicField(this, "_zIndex");
    __publicField(this, "_isVisible", true);
    __publicField(this, "PropertyChanged", new System.Event());
  }
  get Stroke() {
    return this._stroke;
  }
  set Stroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._stroke, ($v) => this._stroke = $v), value, true);
  }
  get Fill() {
    return this._fill;
  }
  set Fill(value) {
    this.SetPaintProperty(new System.Ref(() => this._fill, ($v) => this._fill = $v), value);
  }
  get IsVisible() {
    return this._isVisible;
  }
  set IsVisible(value) {
    this.SetProperty(new System.Ref(() => this._isVisible, ($v) => this._isVisible = $v), value);
  }
  get Xi() {
    return this._xi;
  }
  set Xi(value) {
    this.SetProperty(new System.Ref(() => this._xi, ($v) => this._xi = $v), value);
  }
  get Xj() {
    return this._xj;
  }
  set Xj(value) {
    this.SetProperty(new System.Ref(() => this._xj, ($v) => this._xj = $v), value);
  }
  get Yi() {
    return this._yi;
  }
  set Yi(value) {
    this.SetProperty(new System.Ref(() => this._yi, ($v) => this._yi = $v), value);
  }
  get Yj() {
    return this._yj;
  }
  set Yj(value) {
    this.SetProperty(new System.Ref(() => this._yj, ($v) => this._yj = $v), value);
  }
  get ScalesXAt() {
    return this._scalesXAt;
  }
  set ScalesXAt(value) {
    this.SetProperty(new System.Ref(() => this._scalesXAt, ($v) => this._scalesXAt = $v), value);
  }
  get ScalesYAt() {
    return this._scalesYAt;
  }
  set ScalesYAt(value) {
    this.SetProperty(new System.Ref(() => this._scalesYAt, ($v) => this._scalesYAt = $v), value);
  }
  get ZIndex() {
    return this._zIndex;
  }
  set ZIndex(value) {
    this.SetProperty(new System.Ref(() => this._zIndex, ($v) => this._zIndex = $v), value);
  }
  GetPaintTasks() {
    return [this._stroke, this._fill];
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged(propertyName);
  }
  OnPropertyChanged(propertyName = null) {
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
__publicField(Section, "$meta_System_INotifyPropertyChanged", true);
class Section2 extends Section {
  constructor(sizedGeometryFactory) {
    super();
    __publicField(this, "_sizedGeometryFactory");
    __publicField(this, "_fillSizedGeometry");
    __publicField(this, "_strokeSizedGeometry");
    this._sizedGeometryFactory = sizedGeometryFactory;
  }
  Invalidate(chart) {
    let drawLocation = chart.DrawMarginLocation.Clone();
    let drawMarginSize = chart.DrawMarginSize.Clone();
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let secondaryScale = Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), secondaryAxis);
    let primaryScale = Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), primaryAxis);
    let xi = this.Xi == null ? drawLocation.X : secondaryScale.ToPixels(this.Xi);
    let xj = this.Xj == null ? drawLocation.X + drawMarginSize.Width : secondaryScale.ToPixels(this.Xj);
    let yi = this.Yi == null ? drawLocation.Y : primaryScale.ToPixels(this.Yi);
    let yj = this.Yj == null ? drawLocation.Y + drawMarginSize.Height : primaryScale.ToPixels(this.Yj);
    if (this.Fill != null) {
      this.Fill.ZIndex = this.ZIndex ?? -2.5;
      if (this._fillSizedGeometry == null) {
        this._fillSizedGeometry = this._sizedGeometryFactory();
        this._fillSizedGeometry.X = xi;
        this._fillSizedGeometry.Y = yi;
        this._fillSizedGeometry.Width = xj - xi;
        this._fillSizedGeometry.Height = yj - yi;
        Extensions.TransitionateProperties(this._fillSizedGeometry, "_fillSizedGeometry.X", "_fillSizedGeometry.Width", "_fillSizedGeometry.Y", "_fillSizedGeometry.Height").WithAnimationBuilder((animation) => animation.WithDuration(chart.AnimationsSpeed).WithEasingFunction(chart.EasingFunction));
        this._fillSizedGeometry.CompleteTransition(null);
      }
      this._fillSizedGeometry.X = xi;
      this._fillSizedGeometry.Y = yi;
      this._fillSizedGeometry.Width = xj - xi;
      this._fillSizedGeometry.Height = yj - yi;
      this.Fill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      this.Fill.AddGeometryToPaintTask(chart.Canvas, this._fillSizedGeometry);
      chart.Canvas.AddDrawableTask(this.Fill);
    }
    if (this.Stroke != null) {
      this.Stroke.ZIndex = this.ZIndex ?? 0;
      if (this._strokeSizedGeometry == null) {
        this._strokeSizedGeometry = this._sizedGeometryFactory();
        this._strokeSizedGeometry.X = xi;
        this._strokeSizedGeometry.Y = yi;
        this._strokeSizedGeometry.Width = xj - xi;
        this._strokeSizedGeometry.Height = yj - yi;
        Extensions.TransitionateProperties(this._strokeSizedGeometry, "_strokeSizedGeometry.X", "_strokeSizedGeometry.Width", "_strokeSizedGeometry.Y", "_strokeSizedGeometry.Height").WithAnimationBuilder((animation) => animation.WithDuration(chart.AnimationsSpeed).WithEasingFunction(chart.EasingFunction));
        this._strokeSizedGeometry.CompleteTransition(null);
      }
      this._strokeSizedGeometry.X = xi;
      this._strokeSizedGeometry.Y = yi;
      this._strokeSizedGeometry.Width = xj - xi;
      this._strokeSizedGeometry.Height = yj - yi;
      this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      this.Stroke.AddGeometryToPaintTask(chart.Canvas, this._strokeSizedGeometry);
      chart.Canvas.AddDrawableTask(this.Stroke);
    }
  }
}
class PolarChart extends Chart {
  constructor(view, defaultPlatformConfig, canvas, requiresLegendMeasureAlways = false) {
    super(canvas, defaultPlatformConfig, view);
    __publicField(this, "_chartView");
    __publicField(this, "_nextSeries", 0);
    __publicField(this, "_requiresLegendMeasureAlways", false);
    __privateAdd(this, _AngleAxes, []);
    __privateAdd(this, _RadiusAxes, []);
    __privateAdd(this, _Series2, []);
    __privateAdd(this, _FitToBounds, false);
    __privateAdd(this, _TotalAnge, 0);
    __privateAdd(this, _InnerRadius, 0);
    __privateAdd(this, _InitialRotation, 0);
    this._chartView = view;
    this._requiresLegendMeasureAlways = requiresLegendMeasureAlways;
  }
  get AngleAxes() {
    return __privateGet(this, _AngleAxes);
  }
  set AngleAxes(value) {
    __privateSet(this, _AngleAxes, value);
  }
  get RadiusAxes() {
    return __privateGet(this, _RadiusAxes);
  }
  set RadiusAxes(value) {
    __privateSet(this, _RadiusAxes, value);
  }
  get Series() {
    return __privateGet(this, _Series2);
  }
  set Series(value) {
    __privateSet(this, _Series2, value);
  }
  get FitToBounds() {
    return __privateGet(this, _FitToBounds);
  }
  set FitToBounds(value) {
    __privateSet(this, _FitToBounds, value);
  }
  get TotalAnge() {
    return __privateGet(this, _TotalAnge);
  }
  set TotalAnge(value) {
    __privateSet(this, _TotalAnge, value);
  }
  get InnerRadius() {
    return __privateGet(this, _InnerRadius);
  }
  set InnerRadius(value) {
    __privateSet(this, _InnerRadius, value);
  }
  get InitialRotation() {
    return __privateGet(this, _InitialRotation);
  }
  set InitialRotation(value) {
    __privateSet(this, _InitialRotation, value);
  }
  get ChartSeries() {
    return this.Series;
  }
  get View() {
    return this._chartView;
  }
  FindHoveredPointsBy(pointerPosition) {
    return this.ChartSeries.Where((series) => series.IsHoverable).SelectMany((series) => series.FindHitPoints(this, pointerPosition.Clone(), TooltipFindingStrategy.CompareAll));
  }
  Measure() {
    if (!this.IsLoaded)
      return;
    this.InvokeOnMeasuring();
    if (this._preserveFirstDraw) {
      this.IsFirstDraw = true;
      this._preserveFirstDraw = false;
    }
    this.MeasureWork = {};
    this._chartView.DrawMargin;
    this.ControlSize = this._chartView.ControlSize.Clone();
    this.AngleAxes = this._chartView.AngleAxes.Cast().Select((x) => x).ToArray();
    this.RadiusAxes = this._chartView.RadiusAxes.Cast().Select((x) => x).ToArray();
    let theme = LiveCharts.DefaultSettings.GetTheme();
    this.LegendPosition = this._chartView.LegendPosition;
    this.Legend = this._chartView.Legend;
    this.TooltipPosition = this._chartView.TooltipPosition;
    this.Tooltip = this._chartView.Tooltip;
    this.AnimationsSpeed = this._chartView.AnimationsSpeed;
    this.EasingFunction = this._chartView.EasingFunction;
    this.FitToBounds = this._chartView.FitToBounds;
    this.TotalAnge = this._chartView.TotalAngle;
    this.InnerRadius = this._chartView.InnerRadius;
    this.InitialRotation = this._chartView.InitialRotation;
    let actualSeries = this._chartView.Series == null ? [] : this._chartView.Series.Where((x) => x.IsVisible);
    this.Series = actualSeries.Cast().ToArray();
    this.VisualElements = this._chartView.VisualElements?.ToArray() ?? [];
    this.SeriesContext = new SeriesContext(this.Series);
    let isNewTheme = LiveCharts.DefaultSettings.CurrentThemeId != this.ThemeId;
    for (const axis of this.AngleAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      axis.Initialize(PolarAxisOrientation.Angle);
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToAxis(axis);
        ce._isThemeSet = true;
      }
      ce._isInternalSet = false;
    }
    for (const axis of this.RadiusAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      axis.Initialize(PolarAxisOrientation.Radius);
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToAxis(axis);
        ce._isThemeSet = true;
      }
      ce._isInternalSet = false;
    }
    this.SetDrawMargin(this.ControlSize.Clone(), Margin.Empty());
    for (const series of this.Series) {
      if (series.SeriesId == -1)
        series.SeriesId = this._nextSeries++;
      let ce = series;
      ce._isInternalSet = true;
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToSeries(series);
        ce._isThemeSet = true;
      }
      let secondaryAxis = this.AngleAxes[series.ScalesAngleAt];
      let primaryAxis = this.RadiusAxes[series.ScalesRadiusAt];
      let seriesBounds = series.GetBounds(this, secondaryAxis, primaryAxis).Bounds;
      if (seriesBounds.IsEmpty)
        continue;
      secondaryAxis.DataBounds.AppendValueByBounds(seriesBounds.SecondaryBounds);
      primaryAxis.DataBounds.AppendValueByBounds(seriesBounds.PrimaryBounds);
      secondaryAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.SecondaryBounds);
      primaryAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.PrimaryBounds);
    }
    for (const axis of this.AngleAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      if (!axis.DataBounds.IsEmpty) {
        ce._isInternalSet = false;
        continue;
      }
      let min = 0;
      let max = 10 * axis.UnitWidth;
      axis.DataBounds.AppendValue(max);
      axis.DataBounds.AppendValue(min);
      axis.VisibleDataBounds.AppendValue(max);
      axis.VisibleDataBounds.AppendValue(min);
      if (axis.DataBounds.MinDelta < max)
        axis.DataBounds.MinDelta = max;
      ce._isInternalSet = false;
    }
    for (const axis of this.RadiusAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      if (!axis.DataBounds.IsEmpty) {
        ce._isInternalSet = false;
        continue;
      }
      let min = 0;
      let max = 10 * axis.UnitWidth;
      axis.DataBounds.AppendValue(max);
      axis.DataBounds.AppendValue(min);
      axis.VisibleDataBounds.AppendValue(max);
      axis.VisibleDataBounds.AppendValue(min);
      if (axis.DataBounds.MinDelta < max)
        axis.DataBounds.MinDelta = max;
      ce._isInternalSet = false;
    }
    this.InitializeVisualsCollector();
    let seriesInLegend = this.Series.Where((x) => x.IsVisibleAtLegend).ToArray();
    this.DrawLegend(seriesInLegend);
    if (this.FitToBounds) {
      let mt = 0;
      let mb = 0;
      let ml = 0;
      let mr = 0;
      for (const series of this.Series) {
        let scaler = new PolarScaler(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), this.AngleAxes[series.ScalesAngleAt], this.RadiusAxes[series.ScalesRadiusAt], this.InnerRadius, this.InitialRotation, this.TotalAnge);
        for (const point of series.Fetch(this)) {
          let p = scaler.ToPixelsFromCharPoint(point);
          let dx = p.X - scaler.CenterX;
          let dy = p.Y - scaler.CenterY;
          if (dx > 0) {
            if (dx > mr)
              mr = dx;
          } else {
            dx *= -1;
            if (dx > ml)
              ml = dx;
          }
          if (dy > 0) {
            if (dy > mb)
              mb = dy;
          } else {
            dy *= -1;
            if (dy > mt)
              mt = dy;
          }
        }
      }
      let cs = this.ControlSize.Clone();
      let cx = cs.Width * 0.5;
      let cy = cs.Height * 0.5;
      let dl = cx - ml;
      let dr = cx - mr;
      let dt = cy - mt;
      let db = cy - mb;
      let fitMargin = new Margin(-dl, -dt, -dr, -db);
      this.SetDrawMargin(this.ControlSize.Clone(), fitMargin);
    } else {
      let m = Margin.Empty();
      if (this.View.Title != null) {
        let titleSize = this.View.Title.Measure(this, null, null);
        m.Top = titleSize.Height;
      }
      this.SetDrawMargin(this.ControlSize.Clone(), m);
      for (const axis of this.AngleAxes) {
        if (!axis.IsVisible)
          continue;
        if (axis.DataBounds.Max == axis.DataBounds.Min) {
          let c = axis.UnitWidth * 0.5;
          axis.DataBounds.Min = axis.DataBounds.Min - c;
          axis.DataBounds.Max = axis.DataBounds.Max + c;
          axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - c;
          axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + c;
        }
        let drawablePlane = axis;
        drawablePlane.GetNameLabelSize(this);
        let s = drawablePlane.GetPossibleSize(this);
        let radius = s.Height;
        axis.Ro = m.Top + radius;
        m.Top += radius;
        m.Bottom += radius;
        m.Left += radius;
        m.Right += radius;
      }
      for (const axis of this.RadiusAxes) {
        if (!axis.IsVisible)
          continue;
        if (axis.DataBounds.Max == axis.DataBounds.Min) {
          let c = axis.UnitWidth * 0.5;
          axis.DataBounds.Min = axis.DataBounds.Min - c;
          axis.DataBounds.Max = axis.DataBounds.Max + c;
          axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - c;
          axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + c;
        }
      }
      this.SetDrawMargin(this.ControlSize.Clone(), m);
    }
    if (this.DrawMarginSize.Width <= 0 || this.DrawMarginSize.Height <= 0)
      return;
    this.UpdateBounds();
    let title = this.View.Title;
    if (title != null) {
      let titleSize = title.Measure(this, null, null);
      title.AlignToTopLeftCorner();
      title.X = this.ControlSize.Width * 0.5 - titleSize.Width * 0.5;
      title.Y = 0;
      this.AddVisual(title);
    }
    let totalAxes = this.RadiusAxes.Concat(this.AngleAxes).ToArray();
    for (const axis of totalAxes) {
      if (axis.DataBounds.Max == axis.DataBounds.Min) {
        let c = axis.DataBounds.Min * 0.3;
        axis.DataBounds.Min = axis.DataBounds.Min - c;
        axis.DataBounds.Max = axis.DataBounds.Max + c;
      }
      if (axis.MinLimit == null) {
        let p = 0;
        if (axis.DataBounds.PaddingMin > p)
          p = axis.DataBounds.PaddingMin;
        let ce = axis;
        ce._isInternalSet = true;
        axis.DataBounds.Min = axis.DataBounds.Min - p;
        axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - p;
        ce._isInternalSet = false;
      }
      if (axis.MaxLimit == null) {
        let p = 0;
        if (axis.DataBounds.PaddingMax > p)
          p = axis.DataBounds.PaddingMax;
        let ce = axis;
        ce._isInternalSet = true;
        axis.DataBounds.Max = axis.DataBounds.Max + p;
        axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + p;
        ce._isInternalSet = false;
      }
      if (axis.IsVisible)
        this.AddVisual(axis);
      axis.RemoveOldPaints(this.View);
    }
    for (const visual of this.VisualElements)
      this.AddVisual(visual);
    for (const series of this.Series)
      this.AddVisual(series);
    this.CollectVisuals();
    for (const axis of totalAxes) {
      if (!axis.IsVisible)
        continue;
      let ce = axis;
      ce._isInternalSet = true;
      axis.ActualBounds.HasPreviousState = true;
      ce._isInternalSet = false;
    }
    this.InvokeOnUpdateStarted();
    this.IsFirstDraw = false;
    this.ThemeId = LiveCharts.DefaultSettings.CurrentThemeId;
    this.PreviousSeriesAtLegend = this.Series.Where((x) => x.IsVisibleAtLegend).ToArray();
    this.PreviousLegendPosition = this.LegendPosition;
    this.Canvas.Invalidate();
  }
  ScaleUIPoint(point, angleAxisIndex = 0, radiusAxisIndex = 0) {
    let angleAxis = this.AngleAxes[angleAxisIndex];
    let radiusAxis = this.RadiusAxes[radiusAxisIndex];
    let scaler = new PolarScaler(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), angleAxis, radiusAxis, this.InnerRadius, this.InitialRotation, this.TotalAnge);
    let r = scaler.ToChartValues(point.X, point.Y);
    return new Float64Array([r.X, r.Y]);
  }
  Unload() {
    super.Unload();
    this.IsFirstDraw = true;
  }
}
_AngleAxes = new WeakMap();
_RadiusAxes = new WeakMap();
_Series2 = new WeakMap();
_FitToBounds = new WeakMap();
_TotalAnge = new WeakMap();
_InnerRadius = new WeakMap();
_InitialRotation = new WeakMap();
const _PieSeries = class extends ChartSeries {
  constructor(visualFactory, labelFactory, miniatureGeometryFactory, isGauge = false, isGaugeFill = false) {
    super(SeriesProperties.PieSeries | SeriesProperties.Stacked | (isGauge ? SeriesProperties.Gauge : 0) | (isGaugeFill ? SeriesProperties.GaugeFill : 0) | SeriesProperties.Solid);
    __publicField(this, "_stroke", null);
    __publicField(this, "_fill", null);
    __publicField(this, "_pushout", 0);
    __publicField(this, "_innerRadius", 0);
    __publicField(this, "_maxOuterRadius", 1);
    __publicField(this, "_hoverPushout", 20);
    __publicField(this, "_innerPadding", 0);
    __publicField(this, "_outerPadding", 0);
    __publicField(this, "_maxRadialColW", Number.MAX_VALUE);
    __publicField(this, "_cornerRadius", 0);
    __publicField(this, "_radialAlign", RadialAlignment.Outer);
    __publicField(this, "_invertedCornerRadius", false);
    __publicField(this, "_isFillSeries", false);
    __publicField(this, "_labelsPosition", PolarLabelsPosition.Middle);
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    __publicField(this, "_miniatureGeometryFactory");
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this._miniatureGeometryFactory = miniatureGeometryFactory;
  }
  get Stroke() {
    return this._stroke;
  }
  set Stroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._stroke, ($v) => this._stroke = $v), value, true);
  }
  get Fill() {
    return this._fill;
  }
  set Fill(value) {
    this.SetPaintProperty(new System.Ref(() => this._fill, ($v) => this._fill = $v), value);
  }
  get Pushout() {
    return this._pushout;
  }
  set Pushout(value) {
    this.SetProperty(new System.Ref(() => this._pushout, ($v) => this._pushout = $v), value);
  }
  get InnerRadius() {
    return this._innerRadius;
  }
  set InnerRadius(value) {
    this.SetProperty(new System.Ref(() => this._innerRadius, ($v) => this._innerRadius = $v), value);
  }
  get MaxOuterRadius() {
    return this._maxOuterRadius;
  }
  set MaxOuterRadius(value) {
    this.SetProperty(new System.Ref(() => this._maxOuterRadius, ($v) => this._maxOuterRadius = $v), value);
  }
  get HoverPushout() {
    return this._hoverPushout;
  }
  set HoverPushout(value) {
    this.SetProperty(new System.Ref(() => this._hoverPushout, ($v) => this._hoverPushout = $v), value);
  }
  get RelativeInnerRadius() {
    return this._innerPadding;
  }
  set RelativeInnerRadius(value) {
    this.SetProperty(new System.Ref(() => this._innerPadding, ($v) => this._innerPadding = $v), value);
  }
  get RelativeOuterRadius() {
    return this._outerPadding;
  }
  set RelativeOuterRadius(value) {
    this.SetProperty(new System.Ref(() => this._outerPadding, ($v) => this._outerPadding = $v), value);
  }
  get MaxRadialColumnWidth() {
    return this._maxRadialColW;
  }
  set MaxRadialColumnWidth(value) {
    this.SetProperty(new System.Ref(() => this._maxRadialColW, ($v) => this._maxRadialColW = $v), value);
  }
  get RadialAlign() {
    return this._radialAlign;
  }
  set RadialAlign(value) {
    this.SetProperty(new System.Ref(() => this._radialAlign, ($v) => this._radialAlign = $v), value);
  }
  get CornerRadius() {
    return this._cornerRadius;
  }
  set CornerRadius(value) {
    this.SetProperty(new System.Ref(() => this._cornerRadius, ($v) => this._cornerRadius = $v), value);
  }
  get InvertedCornerRadius() {
    return this._invertedCornerRadius;
  }
  set InvertedCornerRadius(value) {
    this.SetProperty(new System.Ref(() => this._invertedCornerRadius, ($v) => this._invertedCornerRadius = $v), value);
  }
  get IsFillSeries() {
    return this._isFillSeries;
  }
  set IsFillSeries(value) {
    this.SetProperty(new System.Ref(() => this._isFillSeries, ($v) => this._isFillSeries = $v), value);
  }
  get DataLabelsPosition() {
    return this._labelsPosition;
  }
  set DataLabelsPosition(value) {
    this.SetProperty(new System.Ref(() => this._labelsPosition, ($v) => this._labelsPosition = $v), value);
  }
  Invalidate(chart) {
    let pieChart = chart;
    let drawLocation = pieChart.DrawMarginLocation.Clone();
    let drawMarginSize = pieChart.DrawMarginSize.Clone();
    let minDimension = drawMarginSize.Width < drawMarginSize.Height ? drawMarginSize.Width : drawMarginSize.Height;
    let maxPushout = pieChart.PushoutBounds.Max;
    let pushout = this.Pushout;
    let innerRadius = this.InnerRadius;
    let maxOuterRadius = this.MaxOuterRadius;
    minDimension = minDimension - (this.Stroke?.StrokeThickness ?? 0) * 2 - maxPushout * 2;
    minDimension *= maxOuterRadius;
    let view = pieChart.View;
    let initialRotation = Math.trunc(view.InitialRotation);
    let completeAngle = view.MaxAngle;
    let chartTotal = view.Total;
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (this.Fill != null) {
      this.Fill.ZIndex = actualZIndex + 0.1;
      this.Fill.SetClipRectangle(pieChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      pieChart.Canvas.AddDrawableTask(this.Fill);
    }
    if (this.Stroke != null) {
      this.Stroke.ZIndex = actualZIndex + 0.2;
      this.Stroke.SetClipRectangle(pieChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      pieChart.Canvas.AddDrawableTask(this.Stroke);
    }
    if (this.DataLabelsPaint != null) {
      this.DataLabelsPaint.ZIndex = 1e3 + actualZIndex + 0.3;
      pieChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
    }
    let cx = drawLocation.X + drawMarginSize.Width * 0.5;
    let cy = drawLocation.Y + drawMarginSize.Height * 0.5;
    let dls = this.DataLabelsSize;
    let stacker = pieChart.SeriesContext.GetStackPosition(this, this.GetStackGroup());
    if (stacker == null)
      throw new System.Exception("Unexpected null stacker");
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    let fetched = this.Fetch(pieChart).ToArray();
    let stackedInnerRadius = innerRadius;
    let relativeInnerRadius = this.RelativeInnerRadius;
    let relativeOuterRadius = this.RelativeOuterRadius;
    let maxRadialWidth = this.MaxRadialColumnWidth;
    let cornerRadius = this.CornerRadius;
    let mdc = minDimension;
    let wc = mdc - (mdc - 2 * innerRadius) * (fetched.length - 1) / fetched.length - relativeOuterRadius * 2;
    if (wc * 0.5 - stackedInnerRadius > maxRadialWidth) {
      let dw = wc * 0.5 - stackedInnerRadius - maxRadialWidth;
      switch (this.RadialAlign) {
        case RadialAlignment.Outer:
          relativeOuterRadius = 0;
          relativeInnerRadius = dw;
          break;
        case RadialAlignment.Center:
          relativeOuterRadius = dw * 0.5;
          relativeInnerRadius = dw * 0.5;
          break;
        case RadialAlignment.Inner:
          relativeOuterRadius = dw;
          relativeInnerRadius = 0;
          break;
        default:
          throw new System.NotImplementedException(`The alignment ${this.RadialAlign} is not supported.`);
      }
    }
    let r = this.DataLabelsRotation;
    let isTangent = false;
    let isCotangent = false;
    if ((Math.floor(r) & 4294967295 & LiveCharts.TangentAngle) != 0) {
      r -= LiveCharts.TangentAngle;
      isTangent = true;
    }
    if ((Math.floor(r) & 4294967295 & LiveCharts.CotangentAngle) != 0) {
      r -= LiveCharts.CotangentAngle;
      isCotangent = true;
    }
    let i = 1;
    let isClockWise = view.IsClockwise;
    for (const point of fetched) {
      let visual = point.Context.Visual;
      if (point.IsEmpty) {
        if (visual != null) {
          visual.CenterX = cx;
          visual.CenterY = cy;
          visual.X = cx;
          visual.Y = cy;
          visual.Width = 0;
          visual.Height = 0;
          visual.SweepAngle = 0;
          visual.StartAngle = initialRotation;
          visual.PushOut = 0;
          visual.InnerRadius = 0;
          visual.CornerRadius = 0;
          visual.RemoveOnCompleted = true;
          point.Context.Visual = null;
        }
        let md2 = minDimension;
        let w2 = md2 - (md2 - 2 * innerRadius) * (fetched.length - i) / fetched.length - relativeOuterRadius * 2;
        stackedInnerRadius = (w2 + relativeOuterRadius * 2) * 0.5;
        i++;
        continue;
      }
      let stack = stacker.GetStack(point);
      let stackedValue = stack.Start;
      let total = chartTotal ?? stack.Total;
      let start = 0;
      let sweep = 0;
      if (total == 0) {
        start = 0;
        sweep = 0;
      } else {
        start = stackedValue / total * completeAngle;
        sweep = (stackedValue + point.PrimaryValue) / total * completeAngle - start;
        if (!isClockWise)
          start = completeAngle - start - sweep;
      }
      if (this.IsFillSeries) {
        start = 0;
        sweep = completeAngle - 0.1;
      }
      if (visual == null) {
        let p = this._visualFactory();
        p.CenterX = cx;
        p.CenterY = cy;
        p.X = cx;
        p.Y = cy;
        p.Width = 0;
        p.Height = 0;
        p.StartAngle = pieChart.IsFirstDraw ? initialRotation : start + initialRotation;
        p.SweepAngle = 0;
        p.PushOut = 0;
        p.InnerRadius = 0;
        p.CornerRadius = 0;
        visual = p;
        point.Context.Visual = visual;
        this.OnPointCreated(point);
        this.everFetched.Add(point);
      }
      this.Fill?.AddGeometryToPaintTask(pieChart.Canvas, visual);
      this.Stroke?.AddGeometryToPaintTask(pieChart.Canvas, visual);
      let dougnutGeometry = visual;
      stackedInnerRadius += relativeInnerRadius;
      let md = minDimension;
      let w = md - (md - 2 * innerRadius) * (fetched.length - i) / fetched.length - relativeOuterRadius * 2;
      let x = (drawMarginSize.Width - w) * 0.5;
      dougnutGeometry.CenterX = cx;
      dougnutGeometry.CenterY = cy;
      dougnutGeometry.X = drawLocation.X + x;
      dougnutGeometry.Y = drawLocation.Y + (drawMarginSize.Height - w) * 0.5;
      dougnutGeometry.Width = w;
      dougnutGeometry.Height = w;
      dougnutGeometry.InnerRadius = stackedInnerRadius;
      dougnutGeometry.PushOut = pushout;
      dougnutGeometry.StartAngle = start + initialRotation;
      dougnutGeometry.SweepAngle = sweep;
      dougnutGeometry.CornerRadius = cornerRadius;
      dougnutGeometry.InvertedCornerRadius = this.InvertedCornerRadius;
      dougnutGeometry.RemoveOnCompleted = false;
      if (start + initialRotation == initialRotation && sweep == 360)
        dougnutGeometry.SweepAngle = 359.99;
      let ha;
      if (point.Context.HoverArea instanceof SemicircleHoverArea)
        ha = point.Context.HoverArea;
      else
        point.Context.HoverArea = ha = new SemicircleHoverArea();
      ha.SetDimensions(cx, cy, start + initialRotation, start + initialRotation + sweep, md * 0.5);
      pointsCleanup.Clean(point);
      if (this.DataLabelsPaint != null && point.PrimaryValue >= 0) {
        let label = point.Context.Label;
        let middleAngle = start + initialRotation + sweep * 0.5;
        let actualRotation = r + (isTangent ? middleAngle - 90 : 0) + (isCotangent ? middleAngle : 0);
        if ((isTangent || isCotangent) && (actualRotation + 90) % 360 > 180)
          actualRotation += 180;
        if (label == null) {
          let l = this._labelFactory();
          l.X = cx;
          l.Y = cy;
          l.RotateTransform = actualRotation;
          Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? pieChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? pieChart.EasingFunction));
          l.CompleteTransition(null);
          label = l;
          point.Context.Label = l;
        }
        this.DataLabelsPaint.AddGeometryToPaintTask(pieChart.Canvas, label);
        label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
        label.TextSize = dls;
        label.Padding = this.DataLabelsPadding;
        label.RotateTransform = actualRotation;
        if (this.DataLabelsPosition == PolarLabelsPosition.Start) {
          let a = start + initialRotation;
          a %= 360;
          if (a < 0)
            a += 360;
          let c = 90;
          if (a > 180)
            c = -90;
          label.HorizontalAlign = a > 180 ? Align.End : Align.Start;
          label.RotateTransform = a - c;
        }
        if (this.DataLabelsPosition == PolarLabelsPosition.End) {
          let a = start + initialRotation + sweep;
          a %= 360;
          if (a < 0)
            a += 360;
          let c = 90;
          if (a > 180)
            c = -90;
          label.HorizontalAlign = a > 180 ? Align.Start : Align.End;
          label.RotateTransform = a - c;
        }
        if (this.DataLabelsPosition == PolarLabelsPosition.Outer) {
          let a = start + initialRotation + sweep * 0.5;
          let mod = a % 360;
          let isStart = mod < 90 || mod > 270 && mod < 360;
          label.HorizontalAlign = label.HorizontalAlign = isStart ? Align.Start : Align.End;
        }
        let labelPosition = this.GetLabelPolarPosition(cx, cy, ((w + relativeOuterRadius * 2) * 0.5 + stackedInnerRadius) * 0.5, stackedInnerRadius, start + initialRotation, sweep, label.Measure(this.DataLabelsPaint), this.DataLabelsPosition);
        label.X = labelPosition.X;
        label.Y = labelPosition.Y;
      }
      this.OnPointMeasured(point);
      stackedInnerRadius = (w + relativeOuterRadius * 2) * 0.5;
      i++;
    }
    let u = Scaler.MakeDefault();
    pointsCleanup.CollectPoints(this.everFetched, pieChart.View, u, u, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetBounds(chart) {
    return this.DataFactory.GetPieBounds(chart, this).Bounds;
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.Fill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._miniatureGeometryFactory()));
    if (this.Stroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._miniatureGeometryFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
  GetStackGroup() {
    return 0;
  }
  GetPaintTasks() {
    return [this._fill, this._stroke, this.DataLabelsPaint, this.hoverPaint];
  }
  WhenPointerEnters(point) {
    super.WhenPointerEnters(point);
    let visual = point.Context.Visual;
    if (visual == null || visual.MainGeometry == null)
      return;
    visual.PushOut = this.HoverPushout;
  }
  WhenPointerLeaves(point) {
    super.WhenPointerLeaves(point);
    let visual = point.Context.Visual;
    if (visual == null || visual.MainGeometry == null)
      return;
    visual.PushOut = this.Pushout;
  }
  MiniatureEquals(instance) {
    if (instance instanceof _PieSeries) {
      const pieSeries = instance;
      return this.Name == pieSeries.Name && this.Fill == pieSeries.Fill && this.Stroke == pieSeries.Stroke;
    }
    return false;
  }
  SetDefaultPointTransitions(chartPoint) {
    if (this.IsFillSeries)
      return;
    (this.SeriesProperties & SeriesProperties.Gauge) == SeriesProperties.Gauge;
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual, "visual.StartAngle", "visual.SweepAngle", "visual.PushOut").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
    if ((this.SeriesProperties & SeriesProperties.Gauge) == 0)
      Extensions.TransitionateProperties(visual, "visual.CenterX", "visual.CenterY", "visual.X", "visual.Y", "visual.InnerRadius", "visual.Width", "visual.Height").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    visual.StartAngle += visual.SweepAngle;
    visual.SweepAngle = 0;
    visual.CornerRadius = 0;
    visual.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
  GetLabelPolarPosition(centerX, centerY, radius, innerRadius, startAngle, sweepAngle, labelSize, position) {
    let toRadians = Math.PI / 180;
    let angle = 0;
    switch (position) {
      case PolarLabelsPosition.End:
        angle = startAngle + sweepAngle;
        break;
      case PolarLabelsPosition.Start:
        angle = startAngle;
        break;
      case PolarLabelsPosition.Outer:
        angle = startAngle + sweepAngle * 0.5;
        radius += radius - innerRadius;
        break;
      case PolarLabelsPosition.Middle:
        angle = startAngle + sweepAngle * 0.5;
        break;
      case PolarLabelsPosition.ChartCenter:
        return new LvcPoint(centerX, centerY);
    }
    angle *= toRadians;
    return new LvcPoint(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
  }
  SoftDeleteOrDispose(chart) {
    let core = chart.Core;
    let u = Scaler.MakeDefault();
    let toDelete = new System.List();
    for (const point of this.everFetched) {
      if (point.Context.Chart != chart)
        continue;
      this.SoftDeleteOrDisposePoint(point, u, u);
      toDelete.Add(point);
    }
    for (const pt of this.GetPaintTasks()) {
      if (pt != null)
        core.Canvas.RemovePaintTask(pt);
    }
    for (const item of toDelete)
      this.everFetched.Remove(item);
    this.OnVisibilityChanged();
  }
};
let PieSeries = _PieSeries;
__publicField(PieSeries, "$meta_LiveChartsCore_IPieSeries", true);
class PolarAxis extends ChartElement {
  constructor(textGeometryFactory, lineGeometryFactory, circleGeometryFactory) {
    super();
    __publicField(this, "_textGeometryFactory");
    __publicField(this, "_lineGeometryFactory");
    __publicField(this, "_circleGeometryFactory");
    __publicField(this, "activeSeparators", new System.Dictionary());
    __publicField(this, "_orientation", 0);
    __publicField(this, "_minStep", 0);
    __publicField(this, "_dataBounds", null);
    __publicField(this, "_visibleDataBounds", null);
    __publicField(this, "_labelsRotation", 0);
    __publicField(this, "_labeler", Labelers.Default);
    __publicField(this, "_minLimit", null);
    __publicField(this, "_maxLimit", null);
    __publicField(this, "_namePaint");
    __publicField(this, "_nameTextSize", 20);
    __publicField(this, "_namePadding", Padding.All(5));
    __publicField(this, "_labelsPaint");
    __publicField(this, "_unitWidth", 1);
    __publicField(this, "_textSize", 16);
    __publicField(this, "_separatorsPaint");
    __publicField(this, "_showSeparatorLines", true);
    __publicField(this, "_isVisible", true);
    __publicField(this, "_isInverted", false);
    __publicField(this, "_forceStepToMin", false);
    __publicField(this, "_labelsAngle", 0);
    __publicField(this, "_labelsPadding", Padding.All(3));
    __publicField(this, "_labelsVerticalAlign", Align.Middle);
    __publicField(this, "_labelsHorizontalAlign", Align.Middle);
    __publicField(this, "_labelsBackground", new LvcColor(255, 255, 255).Clone());
    __publicField(this, "_animatableBounds", new AnimatableAxisBounds());
    __publicField(this, "Ro", 0);
    __publicField(this, "Name", null);
    __publicField(this, "Labels");
    __publicField(this, "AnimationsSpeed");
    __publicField(this, "EasingFunction");
    __publicField(this, "Initialized", new System.Event());
    this._textGeometryFactory = textGeometryFactory;
    this._lineGeometryFactory = lineGeometryFactory;
    this._circleGeometryFactory = circleGeometryFactory;
  }
  get DataBounds() {
    if (this._dataBounds == null)
      throw new System.Exception("bounds not found");
    return this._dataBounds;
  }
  get VisibleDataBounds() {
    if (this._visibleDataBounds == null)
      throw new System.Exception("bounds not found");
    return this._visibleDataBounds;
  }
  get ActualBounds() {
    return this._animatableBounds;
  }
  get NameTextSize() {
    return this._nameTextSize;
  }
  set NameTextSize(value) {
    this.SetProperty(new System.Ref(() => this._nameTextSize, ($v) => this._nameTextSize = $v), value);
  }
  get NamePadding() {
    return this._namePadding;
  }
  set NamePadding(value) {
    this.SetProperty(new System.Ref(() => this._namePadding, ($v) => this._namePadding = $v), value);
  }
  get Orientation() {
    return this._orientation;
  }
  get LabelsAngle() {
    return this._labelsAngle;
  }
  set LabelsAngle(value) {
    this.SetProperty(new System.Ref(() => this._labelsAngle, ($v) => this._labelsAngle = $v), value);
  }
  get Labeler() {
    return this._labeler;
  }
  set Labeler(value) {
    this.SetProperty(new System.Ref(() => this._labeler, ($v) => this._labeler = $v), value);
  }
  get MinStep() {
    return this._minStep;
  }
  set MinStep(value) {
    this.SetProperty(new System.Ref(() => this._minStep, ($v) => this._minStep = $v), value);
  }
  get ForceStepToMin() {
    return this._forceStepToMin;
  }
  set ForceStepToMin(value) {
    this.SetProperty(new System.Ref(() => this._forceStepToMin, ($v) => this._forceStepToMin = $v), value);
  }
  get MinLimit() {
    return this._minLimit;
  }
  set MinLimit(value) {
    this.SetProperty(new System.Ref(() => this._minLimit, ($v) => this._minLimit = $v), value);
  }
  get MaxLimit() {
    return this._maxLimit;
  }
  set MaxLimit(value) {
    this.SetProperty(new System.Ref(() => this._maxLimit, ($v) => this._maxLimit = $v), value);
  }
  get UnitWidth() {
    return this._unitWidth;
  }
  set UnitWidth(value) {
    this.SetProperty(new System.Ref(() => this._unitWidth, ($v) => this._unitWidth = $v), value);
  }
  get LabelsRotation() {
    return this._labelsRotation;
  }
  set LabelsRotation(value) {
    this.SetProperty(new System.Ref(() => this._labelsRotation, ($v) => this._labelsRotation = $v), value);
  }
  get TextSize() {
    return this._textSize;
  }
  set TextSize(value) {
    this.SetProperty(new System.Ref(() => this._textSize, ($v) => this._textSize = $v), value);
  }
  get LabelsPadding() {
    return this._labelsPadding;
  }
  set LabelsPadding(value) {
    this.SetProperty(new System.Ref(() => this._labelsPadding, ($v) => this._labelsPadding = $v), value);
  }
  get LabelsVerticalAlignment() {
    return this._labelsVerticalAlign;
  }
  set LabelsVerticalAlignment(value) {
    this.SetProperty(new System.Ref(() => this._labelsVerticalAlign, ($v) => this._labelsVerticalAlign = $v), value);
  }
  get LabelsHorizontalAlignment() {
    return this._labelsHorizontalAlign;
  }
  set LabelsHorizontalAlignment(value) {
    this.SetProperty(new System.Ref(() => this._labelsHorizontalAlign, ($v) => this._labelsHorizontalAlign = $v), value);
  }
  get LabelsBackground() {
    return this._labelsBackground;
  }
  set LabelsBackground(value) {
    this.SetProperty(new System.Ref(() => this._labelsBackground, ($v) => this._labelsBackground = $v), value.Clone());
  }
  get ShowSeparatorLines() {
    return this._showSeparatorLines;
  }
  set ShowSeparatorLines(value) {
    this.SetProperty(new System.Ref(() => this._showSeparatorLines, ($v) => this._showSeparatorLines = $v), value);
  }
  get IsVisible() {
    return this._isVisible;
  }
  set IsVisible(value) {
    this.SetProperty(new System.Ref(() => this._isVisible, ($v) => this._isVisible = $v), value);
  }
  get IsInverted() {
    return this._isInverted;
  }
  set IsInverted(value) {
    this.SetProperty(new System.Ref(() => this._isInverted, ($v) => this._isInverted = $v), value);
  }
  get NamePaint() {
    return this._namePaint;
  }
  set NamePaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._namePaint, ($v) => this._namePaint = $v), value);
  }
  get LabelsPaint() {
    return this._labelsPaint;
  }
  set LabelsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._labelsPaint, ($v) => this._labelsPaint = $v), value);
  }
  get SeparatorsPaint() {
    return this._separatorsPaint;
  }
  set SeparatorsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._separatorsPaint, ($v) => this._separatorsPaint = $v), value, true);
  }
  Invalidate(chart) {
    let separators;
    let polarChart = chart;
    if (this._dataBounds == null)
      throw new System.Exception("DataBounds not found");
    polarChart.ControlSize.Clone();
    let drawLocation = polarChart.DrawMarginLocation.Clone();
    let drawMarginSize = polarChart.DrawMarginSize.Clone();
    let axisTick = Extensions.GetTickForPolar(this, polarChart);
    let labeler = this.Labeler;
    if (this.Labels != null) {
      labeler = Labelers.BuildNamedLabeler(this.Labels).Function.bind(Labelers.BuildNamedLabeler(this.Labels));
      this._minStep = 1;
    }
    let s = axisTick.Value;
    if (s < this._minStep)
      s = this._minStep;
    if (this._forceStepToMin)
      s = this._minStep;
    if (!this._animatableBounds.HasPreviousState) {
      Extensions.TransitionateProperties(this._animatableBounds, "_animatableBounds.MinLimit", "_animatableBounds.MaxLimit").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));
      polarChart.Canvas.Trackers.Add(this._animatableBounds);
    }
    if (this.NamePaint != null) {
      if (this.NamePaint.ZIndex == 0)
        this.NamePaint.ZIndex = -1;
      polarChart.Canvas.AddDrawableTask(this.NamePaint);
    }
    if (this.LabelsPaint != null) {
      if (this.LabelsPaint.ZIndex == 0)
        this.LabelsPaint.ZIndex = -0.9;
      polarChart.Canvas.AddDrawableTask(this.LabelsPaint);
    }
    if (this.SeparatorsPaint != null) {
      if (this.SeparatorsPaint.ZIndex == 0)
        this.SeparatorsPaint.ZIndex = -1;
      this.SeparatorsPaint.SetClipRectangle(polarChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      polarChart.Canvas.AddDrawableTask(this.SeparatorsPaint);
    }
    let a;
    let b;
    if (this._orientation == PolarAxisOrientation.Angle) {
      a = this;
      b = polarChart.RadiusAxes[0];
    } else {
      a = polarChart.AngleAxes[0];
      b = this;
    }
    let scaler = new PolarScaler(polarChart.DrawMarginLocation.Clone(), polarChart.DrawMarginSize.Clone(), a, b, polarChart.InnerRadius, polarChart.InitialRotation, polarChart.TotalAnge);
    let size = this.TextSize;
    let r = this._labelsRotation;
    let isTangent = false;
    let isCotangent = false;
    if ((Math.floor(r) & 4294967295 & LiveCharts.TangentAngle) != 0) {
      r -= LiveCharts.TangentAngle;
      isTangent = true;
    }
    if ((Math.floor(r) & 4294967295 & LiveCharts.CotangentAngle) != 0) {
      r -= LiveCharts.CotangentAngle;
      isCotangent = true;
    }
    let hasRotation = Math.abs(r) > 0.01;
    let max = this.MaxLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Max : this.MaxLimit;
    let min = this.MinLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Min : this.MinLimit;
    let start = Math.trunc(min / s) * s;
    if (!this.activeSeparators.TryGetValue(polarChart, new System.Out(() => separators, ($v) => separators = $v))) {
      separators = new System.Dictionary();
      this.activeSeparators.SetAt(polarChart, separators);
    }
    let measured = new System.HashSet();
    for (let i = start; i <= max; i += s) {
      let visualSeparator;
      if (i < min)
        continue;
      let label = labeler(i - 1 + 1);
      if (!separators.TryGetValue(i, new System.Out(() => visualSeparator, ($v) => visualSeparator = $v))) {
        visualSeparator = this._orientation == PolarAxisOrientation.Angle ? new AxisVisualSeprator().Init({ Value: i }) : new RadialAxisVisualSeparator().Init({ Value: i });
        let l = (this._orientation == PolarAxisOrientation.Angle ? scaler.ToPixels(visualSeparator.Value, scaler.MaxRadius) : scaler.ToPixelsWithAngleInDegrees(this.LabelsAngle, visualSeparator.Value)).Clone();
        if (this.LabelsPaint != null) {
          let textGeometry = this._textGeometryFactory();
          textGeometry.TextSize = size;
          visualSeparator.Label = textGeometry;
          if (hasRotation)
            textGeometry.RotateTransform = r;
          Extensions.TransitionateProperties(textGeometry, "textGeometry.X", "textGeometry.Y", "textGeometry.RotateTransform", "textGeometry.Opacity").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));
          textGeometry.X = l.X;
          textGeometry.Y = l.Y;
          textGeometry.Opacity = 0;
          textGeometry.CompleteTransition(null);
        }
        if (this.SeparatorsPaint != null && this.ShowSeparatorLines) {
          if (visualSeparator instanceof AxisVisualSeprator) {
            const linearSeparator = visualSeparator;
            let lineGeometry = this._lineGeometryFactory();
            linearSeparator.Separator = lineGeometry;
            Extensions.TransitionateProperties(lineGeometry, "lineGeometry.X", "lineGeometry.X1", "lineGeometry.Y", "lineGeometry.Y1", "lineGeometry.Opacity").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));
            lineGeometry.Opacity = 0;
            lineGeometry.CompleteTransition(null);
          }
          if (visualSeparator instanceof RadialAxisVisualSeparator) {
            const polarSeparator = visualSeparator;
            let circleGeometry = this._circleGeometryFactory();
            polarSeparator.Circle = circleGeometry;
            Extensions.TransitionateProperties(circleGeometry, "circleGeometry.X", "circleGeometry.Y", "circleGeometry.Width", "circleGeometry.Height", "circleGeometry.Opacity").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));
            let h = Math.sqrt(Math.pow(l.X - scaler.CenterX, 2) + Math.pow(l.Y - scaler.CenterY, 2));
            let radius = h;
            polarSeparator.Circle.X = scaler.CenterX - radius;
            polarSeparator.Circle.Y = scaler.CenterY - radius;
            polarSeparator.Circle.Width = radius * 2;
            polarSeparator.Circle.Height = radius * 2;
            circleGeometry.Opacity = 0;
            circleGeometry.CompleteTransition(null);
          }
        }
        separators.Add(i, visualSeparator);
      }
      if (this.SeparatorsPaint != null && this.ShowSeparatorLines && visualSeparator.Geometry != null)
        this.SeparatorsPaint.AddGeometryToPaintTask(polarChart.Canvas, visualSeparator.Geometry);
      if (this.LabelsPaint != null && visualSeparator.Label != null)
        this.LabelsPaint.AddGeometryToPaintTask(polarChart.Canvas, visualSeparator.Label);
      let location = (this._orientation == PolarAxisOrientation.Angle ? scaler.ToPixels(visualSeparator.Value, scaler.MaxRadius) : scaler.ToPixelsWithAngleInDegrees(this.LabelsAngle, visualSeparator.Value)).Clone();
      if (visualSeparator.Label != null) {
        visualSeparator.Label.Text = label;
        visualSeparator.Label.Padding = this._labelsPadding;
        visualSeparator.Label.HorizontalAlign = this._labelsHorizontalAlign;
        visualSeparator.Label.VerticalAlign = this._labelsVerticalAlign;
        let actualRotation = r + (isTangent ? scaler.GetAngle(i) - 90 : 0) + (isCotangent ? scaler.GetAngle(i) : 0);
        visualSeparator.Label.X = location.X;
        visualSeparator.Label.Y = location.Y;
        visualSeparator.Label.Background = this._labelsBackground.Clone();
        if (actualRotation < 0)
          actualRotation = 360 + actualRotation % 360;
        if (this._orientation == PolarAxisOrientation.Angle && (actualRotation + 90) % 360 > 180)
          actualRotation += 180;
        visualSeparator.Label.RotateTransform = actualRotation;
        visualSeparator.Label.Opacity = System.IsNullOrEmpty(label) ? 0 : 1;
        visualSeparator.Label.X = location.X;
        visualSeparator.Label.Y = location.Y;
        if (!this._animatableBounds.HasPreviousState)
          visualSeparator.Label.CompleteTransition(null);
      }
      if (visualSeparator.Geometry != null) {
        if (visualSeparator instanceof AxisVisualSeprator) {
          const lineSepartator = visualSeparator;
          if (lineSepartator.Separator != null) {
            let innerPos = scaler.ToPixels(visualSeparator.Value, scaler.MinRadius);
            lineSepartator.Separator.X = innerPos.X;
            lineSepartator.Separator.X1 = location.X;
            lineSepartator.Separator.Y = innerPos.Y;
            lineSepartator.Separator.Y1 = location.Y;
            if (!this._animatableBounds.HasPreviousState)
              lineSepartator.Separator.CompleteTransition(null);
          }
        }
        if (visualSeparator instanceof RadialAxisVisualSeparator) {
          const polarSeparator = visualSeparator;
          if (polarSeparator.Circle != null) {
            let h = Math.sqrt(Math.pow(location.X - scaler.CenterX, 2) + Math.pow(location.Y - scaler.CenterY, 2));
            let radius = h;
            polarSeparator.Circle.X = scaler.CenterX - radius;
            polarSeparator.Circle.Y = scaler.CenterY - radius;
            polarSeparator.Circle.Width = radius * 2;
            polarSeparator.Circle.Height = radius * 2;
            if (!this._animatableBounds.HasPreviousState)
              polarSeparator.Circle.CompleteTransition(null);
          }
        }
        visualSeparator.Geometry.Opacity = 1;
      }
      if (visualSeparator.Label != null || visualSeparator.Geometry != null)
        measured.Add(visualSeparator);
    }
    for (const separator of separators) {
      if (measured.Contains(separator.Value))
        continue;
      this.SoftDeleteSeparator(polarChart, separator.Value, scaler);
      separators.Remove(separator.Key);
    }
  }
  GetNameLabelSize(chart) {
    if (this.NamePaint == null || System.IsNullOrEmpty(this.Name))
      return new LvcSize(0, 0);
    let textGeometry = this._textGeometryFactory();
    textGeometry.Text = this.Name ?? "";
    textGeometry.TextSize = this.NameTextSize;
    textGeometry.Padding = this._labelsPadding;
    return textGeometry.Measure(this.NamePaint);
  }
  GetPossibleSize(chart) {
    if (this._dataBounds == null)
      throw new System.Exception("DataBounds not found");
    if (this.LabelsPaint == null)
      return new LvcSize(0, 0);
    let ts = this.TextSize;
    let labeler = this.Labeler;
    let polarChart = chart;
    let a;
    let b;
    if (this._orientation == PolarAxisOrientation.Angle) {
      a = this;
      b = polarChart.RadiusAxes[0];
    } else {
      a = polarChart.AngleAxes[0];
      b = this;
    }
    let scaler = new PolarScaler(polarChart.DrawMarginLocation.Clone(), polarChart.DrawMarginSize.Clone(), a, b, polarChart.InnerRadius, polarChart.InitialRotation, polarChart.TotalAnge);
    if (this.Labels != null) {
      labeler = Labelers.BuildNamedLabeler(this.Labels).Function.bind(Labelers.BuildNamedLabeler(this.Labels));
      this._minStep = 1;
    }
    let axisTick = Extensions.GetTickForPolar(this, polarChart);
    let s = axisTick.Value;
    if (s < this._minStep)
      s = this._minStep;
    if (this._forceStepToMin)
      s = this._minStep;
    let max = this.MaxLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Max : this.MaxLimit;
    let min = this.MinLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Min : this.MinLimit;
    let start = Math.trunc(min / s) * s;
    let totalH = 0;
    let r = this.LabelsRotation;
    for (let i = start; i <= max; i += s) {
      let textGeometry = this._textGeometryFactory();
      textGeometry.Text = labeler(i);
      textGeometry.TextSize = ts;
      textGeometry.RotateTransform = r + (this._orientation == PolarAxisOrientation.Angle ? scaler.GetAngle(i) - 90 : 0);
      textGeometry.Padding = this._labelsPadding;
      let m = textGeometry.Measure(this.LabelsPaint);
      let h = Math.sqrt(Math.pow(m.Width * 0.5, 2) + Math.pow(m.Height * 0.5, 2));
      if (h > totalH)
        totalH = h;
    }
    return new LvcSize(0, totalH);
  }
  Initialize(orientation) {
    this._orientation = orientation;
    this._animatableBounds ?? (this._animatableBounds = new AnimatableAxisBounds());
    this._dataBounds = new Bounds();
    this._visibleDataBounds = new Bounds();
    this.Initialized.Invoke(this);
  }
  Delete(chart) {
    if (this._labelsPaint != null) {
      chart.Canvas.RemovePaintTask(this._labelsPaint);
      this._labelsPaint.ClearGeometriesFromPaintTask(chart.Canvas);
    }
    if (this._separatorsPaint != null) {
      chart.Canvas.RemovePaintTask(this._separatorsPaint);
      this._separatorsPaint.ClearGeometriesFromPaintTask(chart.Canvas);
    }
    this.activeSeparators.Remove(chart);
  }
  RemoveFromUI(chart) {
    super.RemoveFromUI(chart);
    this._animatableBounds = null;
    this.activeSeparators.Remove(chart);
  }
  SoftDeleteSeparator(chart, separator, scaler) {
    if (separator.Geometry == null)
      return;
    let location = (this._orientation == PolarAxisOrientation.Angle ? scaler.ToPixels(separator.Value, scaler.MaxRadius) : scaler.ToPixels(0, separator.Value)).Clone();
    if (separator instanceof AxisVisualSeprator) {
      const lineSeparator = separator;
      lineSeparator.Separator.X = scaler.CenterX;
      lineSeparator.Separator.Y = scaler.CenterY;
      lineSeparator.Separator.X1 = location.X;
      lineSeparator.Separator.Y1 = location.Y;
    }
    if (separator instanceof RadialAxisVisualSeparator) {
      const polarSeparator = separator;
      polarSeparator.Circle.X = scaler.CenterX;
      polarSeparator.Circle.Y = scaler.CenterY;
      polarSeparator.Circle.Width = 0;
      polarSeparator.Circle.Height = 0;
    }
    separator.Geometry.Opacity = 0;
    separator.Geometry.RemoveOnCompleted = true;
    if (separator.Label != null) {
      separator.Label.Opacity = 0;
      separator.Label.RemoveOnCompleted = true;
    }
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged(propertyName);
  }
  GetPaintTasks() {
    return [this._separatorsPaint, this._labelsPaint, this._namePaint];
  }
}
__publicField(PolarAxis, "$meta_System_INotifyPropertyChanged", true);
class Axis extends ChartElement {
  constructor(textGeometryFactory, lineGeometryFactory) {
    super();
    __publicField(this, "_textGeometryFactory");
    __publicField(this, "_lineGeometryFactory");
    __publicField(this, "activeSeparators", new System.Dictionary());
    __publicField(this, "_xo", 0);
    __publicField(this, "_yo", 0);
    __publicField(this, "_size", LvcSize.Empty.Clone());
    __publicField(this, "_orientation", 0);
    __publicField(this, "_animatableBounds", new AnimatableAxisBounds());
    __publicField(this, "_dataBounds", new Bounds());
    __publicField(this, "_visibleDataBounds", new Bounds());
    __publicField(this, "_minStep", 0);
    __publicField(this, "_labelsRotation", 0);
    __publicField(this, "_labelsDesiredSize", LvcRectangle.Empty.Clone());
    __publicField(this, "_nameDesiredSize", LvcRectangle.Empty.Clone());
    __publicField(this, "_nameGeometry");
    __publicField(this, "_position", AxisPosition.Start);
    __publicField(this, "_labeler", Labelers.Default);
    __publicField(this, "_padding", Padding.Default);
    __publicField(this, "_minLimit", null);
    __publicField(this, "_maxLimit", null);
    __publicField(this, "_namePaint");
    __publicField(this, "_nameTextSize", 20);
    __publicField(this, "_namePadding", Padding.All(5));
    __publicField(this, "_labelsPaint");
    __publicField(this, "_unitWidth", 1);
    __publicField(this, "_textSize", 16);
    __publicField(this, "_separatorsPaint");
    __publicField(this, "_subseparatorsPaint");
    __publicField(this, "_drawTicksPath", false);
    __publicField(this, "_ticksPath");
    __publicField(this, "_ticksPaint");
    __publicField(this, "_subticksPaint");
    __publicField(this, "_zeroPaint");
    __publicField(this, "_zeroLine");
    __publicField(this, "_crosshairLine");
    __publicField(this, "_crosshairLabel");
    __publicField(this, "_crosshairPaint");
    __publicField(this, "_crosshairLabelsPaint");
    __publicField(this, "_showSeparatorLines", true);
    __publicField(this, "_isVisible", true);
    __publicField(this, "_isInverted", false);
    __publicField(this, "_separatorsAtCenter", true);
    __publicField(this, "_ticksAtCenter", true);
    __publicField(this, "_forceStepToMin", false);
    __publicField(this, "_crosshairSnapEnabled", false);
    __publicField(this, "_tickLength", 6);
    __publicField(this, "_subSections", 3);
    __publicField(this, "_labelsAlignment");
    __publicField(this, "_inLineNamePlacement", false);
    __publicField(this, "Name", null);
    __publicField(this, "Labels");
    __publicField(this, "CrosshairLabelsBackground");
    __publicField(this, "CrosshairPadding");
    __publicField(this, "AnimationsSpeed");
    __publicField(this, "EasingFunction");
    __publicField(this, "MinZoomDelta");
    __publicField(this, "Initialized", new System.Event());
    this._textGeometryFactory = textGeometryFactory;
    this._lineGeometryFactory = lineGeometryFactory;
  }
  get Xo() {
    return this._xo;
  }
  set Xo(value) {
    this._xo = value;
  }
  get Yo() {
    return this._yo;
  }
  set Yo(value) {
    this._yo = value;
  }
  get Size() {
    return this._size;
  }
  set Size(value) {
    this._size = value.Clone();
  }
  get LabelsDesiredSize() {
    return this._labelsDesiredSize;
  }
  set LabelsDesiredSize(value) {
    this._labelsDesiredSize = value.Clone();
  }
  get NameDesiredSize() {
    return this._nameDesiredSize;
  }
  set NameDesiredSize(value) {
    this._nameDesiredSize = value.Clone();
  }
  get DataBounds() {
    return this._dataBounds;
  }
  get VisibleDataBounds() {
    return this._visibleDataBounds;
  }
  get ActualBounds() {
    return this._animatableBounds;
  }
  get NameTextSize() {
    return this._nameTextSize;
  }
  set NameTextSize(value) {
    this.SetProperty(new System.Ref(() => this._nameTextSize, ($v) => this._nameTextSize = $v), value);
  }
  get NamePadding() {
    return this._namePadding;
  }
  set NamePadding(value) {
    this.SetProperty(new System.Ref(() => this._namePadding, ($v) => this._namePadding = $v), value);
  }
  get LabelsAlignment() {
    return this._labelsAlignment;
  }
  set LabelsAlignment(value) {
    this.SetProperty(new System.Ref(() => this._labelsAlignment, ($v) => this._labelsAlignment = $v), value);
  }
  get Orientation() {
    return this._orientation;
  }
  get Padding() {
    return this._padding;
  }
  set Padding(value) {
    this.SetProperty(new System.Ref(() => this._padding, ($v) => this._padding = $v), value);
  }
  get Labeler() {
    return this._labeler;
  }
  set Labeler(value) {
    this.SetProperty(new System.Ref(() => this._labeler, ($v) => this._labeler = $v), value);
  }
  get MinStep() {
    return this._minStep;
  }
  set MinStep(value) {
    this.SetProperty(new System.Ref(() => this._minStep, ($v) => this._minStep = $v), value);
  }
  get ForceStepToMin() {
    return this._forceStepToMin;
  }
  set ForceStepToMin(value) {
    this.SetProperty(new System.Ref(() => this._forceStepToMin, ($v) => this._forceStepToMin = $v), value);
  }
  get MinLimit() {
    return this._minLimit;
  }
  set MinLimit(value) {
    this.SetProperty(new System.Ref(() => this._minLimit, ($v) => this._minLimit = $v), value);
  }
  get MaxLimit() {
    return this._maxLimit;
  }
  set MaxLimit(value) {
    this.SetProperty(new System.Ref(() => this._maxLimit, ($v) => this._maxLimit = $v), value);
  }
  get UnitWidth() {
    return this._unitWidth;
  }
  set UnitWidth(value) {
    this.SetProperty(new System.Ref(() => this._unitWidth, ($v) => this._unitWidth = $v), value);
  }
  get Position() {
    return this._position;
  }
  set Position(value) {
    this.SetProperty(new System.Ref(() => this._position, ($v) => this._position = $v), value);
  }
  get LabelsRotation() {
    return this._labelsRotation;
  }
  set LabelsRotation(value) {
    this.SetProperty(new System.Ref(() => this._labelsRotation, ($v) => this._labelsRotation = $v), value);
  }
  get TextSize() {
    return this._textSize;
  }
  set TextSize(value) {
    this.SetProperty(new System.Ref(() => this._textSize, ($v) => this._textSize = $v), value);
  }
  get ShowSeparatorLines() {
    return this._showSeparatorLines;
  }
  set ShowSeparatorLines(value) {
    this.SetProperty(new System.Ref(() => this._showSeparatorLines, ($v) => this._showSeparatorLines = $v), value);
  }
  get IsVisible() {
    return this._isVisible;
  }
  set IsVisible(value) {
    this.SetProperty(new System.Ref(() => this._isVisible, ($v) => this._isVisible = $v), value);
  }
  get IsInverted() {
    return this._isInverted;
  }
  set IsInverted(value) {
    this.SetProperty(new System.Ref(() => this._isInverted, ($v) => this._isInverted = $v), value);
  }
  get SeparatorsAtCenter() {
    return this._separatorsAtCenter;
  }
  set SeparatorsAtCenter(value) {
    this.SetProperty(new System.Ref(() => this._separatorsAtCenter, ($v) => this._separatorsAtCenter = $v), value);
  }
  get TicksAtCenter() {
    return this._ticksAtCenter;
  }
  set TicksAtCenter(value) {
    this.SetProperty(new System.Ref(() => this._ticksAtCenter, ($v) => this._ticksAtCenter = $v), value);
  }
  get NamePaint() {
    return this._namePaint;
  }
  set NamePaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._namePaint, ($v) => this._namePaint = $v), value);
  }
  get LabelsPaint() {
    return this._labelsPaint;
  }
  set LabelsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._labelsPaint, ($v) => this._labelsPaint = $v), value);
  }
  get SeparatorsPaint() {
    return this._separatorsPaint;
  }
  set SeparatorsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._separatorsPaint, ($v) => this._separatorsPaint = $v), value, true);
  }
  get SubseparatorsPaint() {
    return this._subseparatorsPaint;
  }
  set SubseparatorsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._subseparatorsPaint, ($v) => this._subseparatorsPaint = $v), value, true);
  }
  get DrawTicksPath() {
    return this._drawTicksPath;
  }
  set DrawTicksPath(value) {
    this.SetProperty(new System.Ref(() => this._drawTicksPath, ($v) => this._drawTicksPath = $v), value);
  }
  get TicksPaint() {
    return this._ticksPaint;
  }
  set TicksPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._ticksPaint, ($v) => this._ticksPaint = $v), value, true);
  }
  get SubticksPaint() {
    return this._subticksPaint;
  }
  set SubticksPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._subticksPaint, ($v) => this._subticksPaint = $v), value, true);
  }
  get ZeroPaint() {
    return this._zeroPaint;
  }
  set ZeroPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._zeroPaint, ($v) => this._zeroPaint = $v), value, true);
  }
  get CrosshairPaint() {
    return this._crosshairPaint;
  }
  set CrosshairPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._crosshairPaint, ($v) => this._crosshairPaint = $v), value, true);
  }
  get CrosshairLabelsPaint() {
    return this._crosshairLabelsPaint;
  }
  set CrosshairLabelsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._crosshairLabelsPaint, ($v) => this._crosshairLabelsPaint = $v), value);
  }
  get CrosshairSnapEnabled() {
    return this._crosshairSnapEnabled;
  }
  set CrosshairSnapEnabled(value) {
    this.SetProperty(new System.Ref(() => this._crosshairSnapEnabled, ($v) => this._crosshairSnapEnabled = $v), value);
  }
  get TextBrush() {
    return this.LabelsPaint;
  }
  set TextBrush(value) {
    this.LabelsPaint = value;
  }
  get SeparatorsBrush() {
    return this.SeparatorsPaint;
  }
  set SeparatorsBrush(value) {
    this.SeparatorsPaint = value;
  }
  get InLineNamePlacement() {
    return this._inLineNamePlacement;
  }
  set InLineNamePlacement(value) {
    this.SetProperty(new System.Ref(() => this._inLineNamePlacement, ($v) => this._inLineNamePlacement = $v), value);
  }
  Invalidate(chart) {
    let separators;
    let cartesianChart = chart;
    let controlSize = cartesianChart.ControlSize.Clone();
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let max = this.MaxLimit == null ? this._visibleDataBounds.Max : this.MaxLimit;
    let min = this.MinLimit == null ? this._visibleDataBounds.Min : this.MinLimit;
    this._animatableBounds.MaxVisibleBound = max;
    this._animatableBounds.MinVisibleBound = min;
    if (!this._animatableBounds.HasPreviousState) {
      Extensions.TransitionateProperties(this._animatableBounds, null).WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction)).CompleteCurrentTransitions();
      cartesianChart.Canvas.Trackers.Add(this._animatableBounds);
    }
    let scale = Extensions.GetNextScaler(this, cartesianChart);
    let actualScale = Extensions.GetActualScaler(this, cartesianChart) ?? scale;
    let axisTick = Extensions.GetTick(this, drawMarginSize.Clone(), null, this.GetPossibleMaxLabelSize(chart));
    let labeler = this.Labeler;
    if (this.Labels != null) {
      labeler = Labelers.BuildNamedLabeler(this.Labels).Function.bind(Labelers.BuildNamedLabeler(this.Labels));
      this._minStep = 1;
    }
    let s = axisTick.Value;
    if (s < this._minStep)
      s = this._minStep;
    if (this._forceStepToMin)
      s = this._minStep;
    if (this.NamePaint != null) {
      if (this.NamePaint.ZIndex == 0)
        this.NamePaint.ZIndex = -1;
      cartesianChart.Canvas.AddDrawableTask(this.NamePaint);
    }
    if (this.LabelsPaint != null) {
      if (this.LabelsPaint.ZIndex == 0)
        this.LabelsPaint.ZIndex = -0.9;
      cartesianChart.Canvas.AddDrawableTask(this.LabelsPaint);
    }
    if (this.SubseparatorsPaint != null) {
      if (this.SubseparatorsPaint.ZIndex == 0)
        this.SubseparatorsPaint.ZIndex = -1;
      this.SubseparatorsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.SubseparatorsPaint);
    }
    if (this.SeparatorsPaint != null) {
      if (this.SeparatorsPaint.ZIndex == 0)
        this.SeparatorsPaint.ZIndex = -1;
      this.SeparatorsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.SeparatorsPaint);
    }
    let ticksClipRectangle = (this._orientation == AxisOrientation.X ? new LvcRectangle(new LvcPoint(drawLocation.X, 0), new LvcSize(drawMarginSize.Width, controlSize.Height)) : new LvcRectangle(new LvcPoint(0, drawLocation.Y), new LvcSize(controlSize.Width, drawMarginSize.Height))).Clone();
    if (this.TicksPaint != null) {
      if (this.TicksPaint.ZIndex == 0)
        this.TicksPaint.ZIndex = -1;
      this.TicksPaint.SetClipRectangle(cartesianChart.Canvas, ticksClipRectangle.Clone());
      cartesianChart.Canvas.AddDrawableTask(this.TicksPaint);
    }
    if (this.SubticksPaint != null) {
      if (this.SubticksPaint.ZIndex == 0)
        this.SubticksPaint.ZIndex = -1;
      this.SubticksPaint.SetClipRectangle(cartesianChart.Canvas, ticksClipRectangle.Clone());
      cartesianChart.Canvas.AddDrawableTask(this.SubticksPaint);
    }
    let lyi = drawLocation.Y;
    let lyj = drawLocation.Y + drawMarginSize.Height;
    let lxi = drawLocation.X;
    let lxj = drawLocation.X + drawMarginSize.Width;
    let xoo = 0;
    let yoo = 0;
    if (this._orientation == AxisOrientation.X) {
      yoo = this._position == AxisPosition.Start ? controlSize.Height - this._yo : this._yo;
    } else {
      xoo = this._position == AxisPosition.Start ? this._xo : controlSize.Width - this._xo;
    }
    let size = this.TextSize;
    let r = this._labelsRotation;
    let hasRotation = Math.abs(r) > 0.01;
    let start = Math.trunc(min / s) * s;
    if (!this.activeSeparators.TryGetValue(cartesianChart, new System.Out(() => separators, ($v) => separators = $v))) {
      separators = new System.Dictionary();
      this.activeSeparators.SetAt(cartesianChart, separators);
    }
    if (this.Name != null && this.NamePaint != null)
      this.DrawName(cartesianChart, this.NameTextSize, lxi, lxj, lyi, lyj);
    if (this.NamePaint != null && this._nameGeometry != null)
      this.NamePaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._nameGeometry);
    let hasActivePaint = this.NamePadding != null || this.SeparatorsPaint != null || this.LabelsPaint != null || this.TicksPaint != null || this.SubticksPaint != null || this.SubseparatorsPaint != null;
    let measured = new System.HashSet();
    if (this.ZeroPaint != null) {
      let x = 0;
      let y = 0;
      if (this._orientation == AxisOrientation.X) {
        x = scale.ToPixels(0);
        y = yoo;
      } else {
        x = xoo;
        y = scale.ToPixels(0);
      }
      if (this.ZeroPaint.ZIndex == 0)
        this.ZeroPaint.ZIndex = -1;
      this.ZeroPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.ZeroPaint);
      if (this._zeroLine == null) {
        this._zeroLine = this._lineGeometryFactory();
        this.ZeroPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._zeroLine);
        this.InitializeLine(this._zeroLine, cartesianChart);
        this.UpdateSeparator(this._zeroLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndComplete);
      }
      this.UpdateSeparator(this._zeroLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.Update);
    }
    if (this.TicksPaint != null && this._drawTicksPath) {
      if (this._ticksPath == null) {
        this._ticksPath = this._lineGeometryFactory();
        this.InitializeLine(this._ticksPath, cartesianChart);
      }
      this.TicksPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._ticksPath);
      if (this._orientation == AxisOrientation.X) {
        let yp = yoo + this._size.Height * 0.5 * (this._position == AxisPosition.Start ? -1 : 1);
        this._ticksPath.X = lxi;
        this._ticksPath.X1 = lxj;
        this._ticksPath.Y = yp;
        this._ticksPath.Y1 = yp;
      } else {
        let xp = xoo + this._size.Width * 0.5 * (this._position == AxisPosition.Start ? 1 : -1);
        this._ticksPath.X = xp;
        this._ticksPath.X1 = xp;
        this._ticksPath.Y = lyi;
        this._ticksPath.Y1 = lyj;
      }
      if (!this._animatableBounds.HasPreviousState)
        this._ticksPath.CompleteTransition(null);
    }
    if (this.TicksPaint != null && this._ticksPath != null && !this._drawTicksPath)
      this.TicksPaint.RemoveGeometryFromPainTask(cartesianChart.Canvas, this._ticksPath);
    let txco = 0;
    let tyco = 0;
    let sxco = 0;
    let syco = 0;
    let uw = scale.MeasureInPixels(this._unitWidth);
    if (!this._ticksAtCenter && this._orientation == AxisOrientation.X)
      txco = uw * 0.5;
    if (!this._ticksAtCenter && this._orientation == AxisOrientation.Y)
      tyco = uw * 0.5;
    if (!this._separatorsAtCenter && this._orientation == AxisOrientation.X)
      sxco = uw * 0.5;
    if (!this._separatorsAtCenter && this._orientation == AxisOrientation.Y)
      sxco = uw * 0.5;
    for (let i = start - s; i <= max + s; i += s) {
      let visualSeparator;
      let separatorKey = Labelers.SixRepresentativeDigits(i - 1 + 1);
      let labelContent = i < min || i > max ? "" : this.TryGetLabelOrLogError(labeler, i - 1 + 1);
      let x = 0;
      let y = 0;
      if (this._orientation == AxisOrientation.X) {
        x = scale.ToPixels(i);
        y = yoo;
      } else {
        x = xoo;
        y = scale.ToPixels(i);
      }
      let xc = 0;
      let yc = 0;
      if (this._orientation == AxisOrientation.X) {
        xc = actualScale.ToPixels(i);
        yc = yoo;
      } else {
        xc = xoo;
        yc = actualScale.ToPixels(i);
      }
      if (!separators.TryGetValue(separatorKey, new System.Out(() => visualSeparator, ($v) => visualSeparator = $v))) {
        visualSeparator = new AxisVisualSeprator().Init({ Value: i });
        separators.Add(separatorKey, visualSeparator);
      }
      if (this.SeparatorsPaint != null && this.ShowSeparatorLines && visualSeparator.Separator == null) {
        this.InitializeSeparator(visualSeparator, cartesianChart);
        this.UpdateSeparator(visualSeparator.Separator, xc + sxco, yc + syco, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndComplete);
      }
      if (this.SubseparatorsPaint != null && this.ShowSeparatorLines && (visualSeparator.Subseparators == null || visualSeparator.Subseparators.length == 0)) {
        this.InitializeSubseparators(visualSeparator, cartesianChart);
        this.UpdateSubseparators(visualSeparator.Subseparators, actualScale, s, xc + sxco, yc + syco, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndComplete);
      }
      if (this.TicksPaint != null && visualSeparator.Tick == null) {
        this.InitializeTick(visualSeparator, cartesianChart);
        this.UpdateTick(visualSeparator.Tick, this._tickLength, xc + txco, yc + tyco, UpdateMode.UpdateAndComplete);
      }
      if (this.SubticksPaint != null && this._subSections > 0 && (visualSeparator.Subticks == null || visualSeparator.Subticks.length == 0)) {
        this.InitializeSubticks(visualSeparator, cartesianChart);
        this.UpdateSubticks(visualSeparator.Subticks, actualScale, s, xc + txco, yc + tyco, UpdateMode.UpdateAndComplete);
      }
      if (this.LabelsPaint != null && visualSeparator.Label == null) {
        this.IntializeLabel(visualSeparator, cartesianChart, size, hasRotation, r);
        this.UpdateLabel(visualSeparator.Label, xc, yc, this.TryGetLabelOrLogError(labeler, i - 1 + 1), hasRotation, r, UpdateMode.UpdateAndComplete);
      }
      if (this.SeparatorsPaint != null && visualSeparator.Separator != null) {
        if (this.ShowSeparatorLines)
          this.SeparatorsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, visualSeparator.Separator);
        else
          this.SeparatorsPaint.RemoveGeometryFromPainTask(cartesianChart.Canvas, visualSeparator.Separator);
      }
      if (this.SubseparatorsPaint != null && visualSeparator.Subseparators != null)
        if (this.ShowSeparatorLines)
          for (const subtick of visualSeparator.Subseparators)
            this.SubseparatorsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, subtick);
        else
          for (const subtick of visualSeparator.Subseparators)
            this.SubseparatorsPaint.RemoveGeometryFromPainTask(cartesianChart.Canvas, subtick);
      if (this.LabelsPaint != null && visualSeparator.Label != null)
        this.LabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, visualSeparator.Label);
      if (this.TicksPaint != null && visualSeparator.Tick != null)
        this.TicksPaint.AddGeometryToPaintTask(cartesianChart.Canvas, visualSeparator.Tick);
      if (this.SubticksPaint != null && visualSeparator.Subticks != null)
        for (const subtick of visualSeparator.Subticks)
          this.SubticksPaint.AddGeometryToPaintTask(cartesianChart.Canvas, subtick);
      if (visualSeparator.Separator != null)
        this.UpdateSeparator(visualSeparator.Separator, x + sxco, y + syco, lxi, lxj, lyi, lyj, UpdateMode.Update);
      if (visualSeparator.Subseparators != null)
        this.UpdateSubseparators(visualSeparator.Subseparators, scale, s, x + sxco, y + tyco, lxi, lxj, lyi, lyj, UpdateMode.Update);
      if (visualSeparator.Tick != null)
        this.UpdateTick(visualSeparator.Tick, this._tickLength, x + txco, y + tyco, UpdateMode.Update);
      if (visualSeparator.Subticks != null)
        this.UpdateSubticks(visualSeparator.Subticks, scale, s, x + txco, y + tyco, UpdateMode.Update);
      if (visualSeparator.Label != null)
        this.UpdateLabel(visualSeparator.Label, x, y + tyco, labelContent, hasRotation, r, UpdateMode.Update);
      if (hasActivePaint)
        measured.Add(visualSeparator);
    }
    for (const separatorValueKey of separators) {
      let separator = separatorValueKey.Value;
      if (measured.Contains(separator))
        continue;
      let x = 0;
      let y = 0;
      if (this._orientation == AxisOrientation.X) {
        x = scale.ToPixels(separator.Value);
        y = yoo;
      } else {
        x = xoo;
        y = scale.ToPixels(separator.Value);
      }
      if (separator.Separator != null)
        this.UpdateSeparator(separator.Separator, x + sxco, y + syco, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndRemove);
      if (separator.Subseparators != null)
        this.UpdateSubseparators(separator.Subseparators, scale, s, x + sxco, y + syco, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndRemove);
      if (separator.Tick != null)
        this.UpdateTick(separator.Tick, this._tickLength, x + txco, y + tyco, UpdateMode.UpdateAndRemove);
      if (separator.Subticks != null)
        this.UpdateSubticks(separator.Subticks, scale, s, x + txco, y + tyco, UpdateMode.UpdateAndRemove);
      if (separator.Label != null)
        this.UpdateLabel(separator.Label, x, y + tyco, this.TryGetLabelOrLogError(labeler, separator.Value - 1 + 1), hasRotation, r, UpdateMode.UpdateAndRemove);
      separators.Remove(separatorValueKey.Key);
    }
  }
  InvalidateCrosshair(chart, pointerPosition) {
    if (this.CrosshairPaint == null)
      return;
    let cartesianChart;
    if (chart instanceof CartesianChart)
      cartesianChart = chart;
    else
      return;
    let scale = Extensions.GetNextScaler(this, cartesianChart);
    let controlSize = cartesianChart.ControlSize.Clone();
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let labelValue = 0;
    let lyi = drawLocation.Y;
    let lyj = drawLocation.Y + drawMarginSize.Height;
    let lxi = drawLocation.X;
    let lxj = drawLocation.X + drawMarginSize.Width;
    let xoo = 0;
    let yoo = 0;
    if (this._orientation == AxisOrientation.X) {
      yoo = this._position == AxisPosition.Start ? controlSize.Height - this._yo : this._yo;
    } else {
      xoo = this._position == AxisPosition.Start ? this._xo : controlSize.Width - this._xo;
    }
    let x = 0;
    let y = 0;
    if (this._orientation == AxisOrientation.X) {
      let crosshairX = 0;
      if (this.CrosshairSnapEnabled) {
        let axisIndex = cartesianChart.XAxes.indexOf(this);
        let closestPoint = Axis.FindClosestPoint(pointerPosition.Clone(), cartesianChart, cartesianChart.Series.Where((s) => s.ScalesXAt == axisIndex));
        crosshairX = scale.ToPixels(closestPoint?.SecondaryValue ?? pointerPosition.X);
        labelValue = closestPoint?.SecondaryValue ?? scale.ToChartValues(pointerPosition.X);
      } else {
        crosshairX = pointerPosition.X;
        labelValue = scale.ToChartValues(pointerPosition.X);
      }
      x = crosshairX;
      y = yoo;
    } else {
      let crosshairY = 0;
      if (this.CrosshairSnapEnabled) {
        let axisIndex = cartesianChart.YAxes.indexOf(this);
        let closestPoint = Axis.FindClosestPoint(pointerPosition.Clone(), cartesianChart, cartesianChart.Series.Where((s) => s.ScalesYAt == axisIndex));
        crosshairY = scale.ToPixels(closestPoint?.PrimaryValue ?? pointerPosition.Y);
        labelValue = closestPoint?.PrimaryValue ?? scale.ToChartValues(pointerPosition.Y);
      } else {
        crosshairY = pointerPosition.Y;
        labelValue = scale.ToChartValues(pointerPosition.Y);
      }
      x = xoo;
      y = crosshairY;
    }
    if (this.CrosshairPaint.ZIndex == 0)
      this.CrosshairPaint.ZIndex = 1050;
    this.CrosshairPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
    cartesianChart.Canvas.AddDrawableTask(this.CrosshairPaint);
    if (this._crosshairLine == null) {
      this._crosshairLine = this._lineGeometryFactory();
      this.UpdateSeparator(this._crosshairLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndComplete);
    }
    this.CrosshairPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._crosshairLine);
    if (this.CrosshairLabelsPaint != null) {
      if (this.CrosshairLabelsPaint.ZIndex == 0)
        this.CrosshairLabelsPaint.ZIndex = 1050;
      if (this.Orientation == AxisOrientation.X) {
        this.CrosshairLabelsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(new LvcPoint(drawLocation.X, 0), new LvcSize(drawMarginSize.Width, controlSize.Height)));
      } else {
        this.CrosshairLabelsPaint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(new LvcPoint(0, drawLocation.Y), new LvcSize(controlSize.Width, drawMarginSize.Height)));
      }
      cartesianChart.Canvas.AddDrawableTask(this.CrosshairLabelsPaint);
      this._crosshairLabel ?? (this._crosshairLabel = this._textGeometryFactory());
      let labeler = this.Labeler;
      if (this.Labels != null) {
        labeler = Labelers.BuildNamedLabeler(this.Labels).Function.bind(Labelers.BuildNamedLabeler(this.Labels));
      }
      this._crosshairLabel.Text = this.TryGetLabelOrLogError(labeler, labelValue);
      this._crosshairLabel.TextSize = this._textSize;
      this._crosshairLabel.Background = (this.CrosshairLabelsBackground ?? LvcColor.Empty).Clone();
      this._crosshairLabel.Padding = this.CrosshairPadding ?? this._padding;
      this._crosshairLabel.X = x;
      this._crosshairLabel.Y = y;
      let r = this._labelsRotation;
      let hasRotation = Math.abs(r) > 0.01;
      if (hasRotation)
        this._crosshairLabel.RotateTransform = r;
      this.CrosshairLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._crosshairLabel);
    }
    this.UpdateSeparator(this._crosshairLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.Update);
    chart.Canvas.Invalidate();
  }
  static FindClosestPoint(pointerPosition, cartesianChart, allSeries) {
    let closestPoint = null;
    for (const series of allSeries) {
      let hitpoints = series.FindHitPoints(cartesianChart, pointerPosition.Clone(), Extensions.GetTooltipFindingStrategy(allSeries));
      let hitpoint = hitpoints.FirstOrDefault();
      if (hitpoint == null)
        continue;
      if (closestPoint == null || hitpoint.DistanceTo(pointerPosition.Clone()) < closestPoint.DistanceTo(pointerPosition.Clone())) {
        closestPoint = hitpoint;
      }
    }
    return closestPoint;
  }
  GetNameLabelSize(chart) {
    if (this.NamePaint == null || System.IsNullOrEmpty(this.Name))
      return new LvcSize(0, 0);
    let textGeometry = this._textGeometryFactory();
    textGeometry.Text = this.Name ?? "";
    textGeometry.TextSize = this._nameTextSize;
    textGeometry.RotateTransform = this.Orientation == AxisOrientation.X ? 0 : this.InLineNamePlacement ? 0 : -90;
    textGeometry.Padding = this.NamePadding;
    return textGeometry.Measure(this.NamePaint);
  }
  GetPossibleSize(chart) {
    if (this._dataBounds == null)
      throw new System.Exception("DataBounds not found");
    if (this.LabelsPaint == null)
      return new LvcSize(0, 0);
    let ts = this._textSize;
    let labeler = this.Labeler;
    if (this.Labels != null) {
      labeler = Labelers.BuildNamedLabeler(this.Labels).Function.bind(Labelers.BuildNamedLabeler(this.Labels));
      this._minStep = 1;
    }
    let axisTick = Extensions.GetTick(this, chart.DrawMarginSize.Clone());
    let s = axisTick.Value;
    let max = this.MaxLimit == null ? this._visibleDataBounds.Max : this.MaxLimit;
    let min = this.MinLimit == null ? this._visibleDataBounds.Min : this.MinLimit;
    if (s < this._minStep)
      s = this._minStep;
    if (this._forceStepToMin)
      s = this._minStep;
    let start = Math.trunc(min / s) * s;
    let w = 0;
    let h = 0;
    let r = this.LabelsRotation;
    for (let i = start; i <= max; i += s) {
      let textGeometry = this._textGeometryFactory();
      textGeometry.Text = this.TryGetLabelOrLogError(labeler, i);
      textGeometry.TextSize = ts;
      textGeometry.RotateTransform = r;
      textGeometry.Padding = this._padding;
      let m = textGeometry.Measure(this.LabelsPaint);
      if (m.Width > w)
        w = m.Width;
      if (m.Height > h)
        h = m.Height;
    }
    return new LvcSize(w, h);
  }
  Initialize(orientation) {
    this._orientation = orientation;
    this._dataBounds = new Bounds();
    this._visibleDataBounds = new Bounds();
    this._animatableBounds ?? (this._animatableBounds = new AnimatableAxisBounds());
    this.Initialized.Invoke(this);
  }
  Delete(chart) {
    for (const paint of this.GetPaintTasks()) {
      if (paint == null)
        continue;
      chart.Canvas.RemovePaintTask(paint);
      paint.ClearGeometriesFromPaintTask(chart.Canvas);
    }
    this.activeSeparators.Remove(chart);
  }
  RemoveFromUI(chart) {
    super.RemoveFromUI(chart);
    this._animatableBounds = null;
    this.activeSeparators.Remove(chart);
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged(propertyName);
  }
  GetPaintTasks() {
    return [this._separatorsPaint, this._labelsPaint, this._namePaint, this._zeroPaint, this._ticksPaint, this._subticksPaint, this._subseparatorsPaint];
  }
  GetPossibleMaxLabelSize(chart) {
    if (this.LabelsPaint == null)
      return new LvcSize();
    let labeler = this.Labeler;
    if (this.Labels != null) {
      labeler = Labelers.BuildNamedLabeler(this.Labels).Function.bind(Labelers.BuildNamedLabeler(this.Labels));
      this._minStep = 1;
    }
    let axisTick = Extensions.GetTick(this, chart.DrawMarginSize.Clone());
    let s = axisTick.Value;
    let max = this.MaxLimit == null ? this._visibleDataBounds.Max : this.MaxLimit;
    let min = this.MinLimit == null ? this._visibleDataBounds.Min : this.MinLimit;
    if (s == 0)
      s = 1;
    if (s < this._minStep)
      s = this._minStep;
    if (this._forceStepToMin)
      s = this._minStep;
    let maxLabelSize = new LvcSize();
    if (max - min == 0)
      return maxLabelSize;
    for (let i = min; i <= max; i += s) {
      let textGeometry = this._textGeometryFactory();
      textGeometry.Text = labeler(i);
      textGeometry.TextSize = this._textSize;
      textGeometry.RotateTransform = this.LabelsRotation;
      textGeometry.Padding = this._padding;
      let m = textGeometry.Measure(this.LabelsPaint);
      maxLabelSize = new LvcSize(maxLabelSize.Width > m.Width ? maxLabelSize.Width : m.Width, maxLabelSize.Height > m.Height ? maxLabelSize.Height : m.Height);
    }
    return maxLabelSize;
  }
  DrawName(cartesianChart, size, lxi, lxj, lyi, lyj) {
    let isNew = false;
    if (this._nameGeometry == null) {
      this._nameGeometry = this._textGeometryFactory();
      this._nameGeometry.TextSize = size;
      this._nameGeometry.HorizontalAlign = Align.Middle;
      this._nameGeometry.VerticalAlign = Align.Middle;
      Extensions.TransitionateProperties(this._nameGeometry, "_nameGeometry.X", "_nameGeometry.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
      isNew = true;
    }
    this._nameGeometry.Padding = this.NamePadding;
    this._nameGeometry.Text = this.Name ?? "";
    this._nameGeometry.TextSize = this._nameTextSize;
    if (this._orientation == AxisOrientation.X) {
      if (this.InLineNamePlacement) {
        this._nameGeometry.X = this._nameDesiredSize.X + this._nameDesiredSize.Width * 0.5;
        this._nameGeometry.Y = this._nameDesiredSize.Y + this._nameDesiredSize.Height * 0.5;
      } else {
        this._nameGeometry.X = (lxi + lxj) * 0.5;
        this._nameGeometry.Y = this._nameDesiredSize.Y + this._nameDesiredSize.Height * 0.5;
      }
    } else {
      if (this.InLineNamePlacement) {
        this._nameGeometry.X = this._nameDesiredSize.X + this._nameDesiredSize.Width * 0.5;
        this._nameGeometry.Y = this._nameDesiredSize.Height * 0.5;
      } else {
        this._nameGeometry.RotateTransform = -90;
        this._nameGeometry.X = this._nameDesiredSize.X + this._nameDesiredSize.Width * 0.5;
        this._nameGeometry.Y = (lyi + lyj) * 0.5;
      }
    }
    if (isNew)
      this._nameGeometry.CompleteTransition(null);
  }
  InitializeSeparator(visualSeparator, cartesianChart, separatorGeometry = null) {
    let lineGeometry;
    if (separatorGeometry != null) {
      lineGeometry = separatorGeometry;
    } else {
      lineGeometry = this._lineGeometryFactory();
      visualSeparator.Separator = lineGeometry;
    }
    visualSeparator.Separator = lineGeometry;
    this.InitializeLine(lineGeometry, cartesianChart);
  }
  InitializeSubseparators(visualSeparator, cartesianChart) {
    visualSeparator.Subseparators = new Array(this._subSections);
    for (let j = 0; j < this._subSections; j++) {
      let subSeparator = this._lineGeometryFactory();
      visualSeparator.Subseparators[j] = subSeparator;
      this.InitializeTick(visualSeparator, cartesianChart, subSeparator);
    }
  }
  InitializeLine(lineGeometry, cartesianChart) {
    Extensions.TransitionateProperties(lineGeometry, "lineGeometry.X", "lineGeometry.X1", "lineGeometry.Y", "lineGeometry.Y1", "lineGeometry.Opacity").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
  }
  InitializeTick(visualSeparator, cartesianChart, subTickGeometry = null) {
    let tickGeometry;
    if (subTickGeometry != null) {
      tickGeometry = subTickGeometry;
    } else {
      tickGeometry = this._lineGeometryFactory();
      visualSeparator.Tick = tickGeometry;
    }
    Extensions.TransitionateProperties(tickGeometry, "tickGeometry.X", "tickGeometry.X1", "tickGeometry.Y", "tickGeometry.Y1", "tickGeometry.Opacity").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
  }
  InitializeSubticks(visualSeparator, cartesianChart) {
    visualSeparator.Subticks = new Array(this._subSections);
    for (let j = 0; j < this._subSections; j++) {
      let subTick = this._lineGeometryFactory();
      visualSeparator.Subticks[j] = subTick;
      this.InitializeTick(visualSeparator, cartesianChart, subTick);
    }
  }
  IntializeLabel(visualSeparator, cartesianChart, size, hasRotation, r) {
    let textGeometry = this._textGeometryFactory();
    textGeometry.TextSize = size;
    visualSeparator.Label = textGeometry;
    if (hasRotation)
      textGeometry.RotateTransform = r;
    Extensions.TransitionateProperties(textGeometry, "textGeometry.X", "textGeometry.Y", "textGeometry.Opacity").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
  }
  UpdateSeparator(line, x, y, lxi, lxj, lyi, lyj, mode) {
    if (this._orientation == AxisOrientation.X) {
      line.X = x;
      line.X1 = x;
      line.Y = lyi;
      line.Y1 = lyj;
    } else {
      line.X = lxi;
      line.X1 = lxj;
      line.Y = y;
      line.Y1 = y;
    }
    this.SetUpdateMode(line, mode);
  }
  UpdateTick(tick, length, x, y, mode) {
    if (this._orientation == AxisOrientation.X) {
      let lyi = y + this._size.Height * 0.5;
      let lyj = y - this._size.Height * 0.5;
      tick.X = x;
      tick.X1 = x;
      tick.Y = this._position == AxisPosition.Start ? lyj : lyi - length;
      tick.Y1 = this._position == AxisPosition.Start ? lyj + length : lyi;
    } else {
      let lxi = x + this._size.Width * 0.5;
      let lxj = x - this._size.Width * 0.5;
      tick.X = this._position == AxisPosition.Start ? lxi : lxj + length;
      tick.X1 = this._position == AxisPosition.Start ? lxi - length : lxj;
      tick.Y = y;
      tick.Y1 = y;
    }
    this.SetUpdateMode(tick, mode);
  }
  UpdateSubseparators(subseparators, scale, s, x, y, lxi, lxj, lyi, lyj, mode) {
    for (let j = 0; j < subseparators.length; j++) {
      let subseparator = subseparators[j];
      let kl = (j + 1) / (this._subSections + 1);
      let xs = 0;
      let ys = 0;
      if (this._orientation == AxisOrientation.X) {
        xs = scale.MeasureInPixels(s * kl);
      } else {
        ys = scale.MeasureInPixels(s * kl);
      }
      this.UpdateSeparator(subseparator, x + xs, y + ys, lxi, lxj, lyi, lyj, mode);
    }
  }
  UpdateSubticks(subticks, scale, s, x, y, mode) {
    for (let j = 0; j < subticks.length; j++) {
      let subtick = subticks[j];
      let k = 0.5;
      let kl = (j + 1) / (this._subSections + 1);
      if (Math.abs(kl - 0.5) < 0.01)
        k += 0.25;
      let xs = 0;
      let ys = 0;
      if (this._orientation == AxisOrientation.X) {
        xs = scale.MeasureInPixels(s * kl);
      } else {
        ys = scale.MeasureInPixels(s * kl);
      }
      this.UpdateTick(subtick, this._tickLength * k, x + xs, y + ys, mode);
    }
  }
  UpdateLabel(label, x, y, text, hasRotation, r, mode) {
    let actualRotatation = r;
    let toRadians = Math.PI / 180;
    if (this._orientation == AxisOrientation.Y) {
      actualRotatation %= 180;
      if (actualRotatation < 0)
        actualRotatation += 360;
      if (actualRotatation > 90 && actualRotatation < 180)
        actualRotatation += 180;
      if (actualRotatation > 180 && actualRotatation < 270)
        actualRotatation += 180;
      let actualAlignment = this._labelsAlignment == null ? this._position == AxisPosition.Start ? Align.End : Align.Start : this._labelsAlignment;
      if (actualAlignment == Align.Start) {
        if (hasRotation && this._labelsPaint != null) {
          let textGeometry = this._textGeometryFactory();
          textGeometry.Text = text;
          textGeometry.TextSize = this._textSize;
          textGeometry.Padding = this._padding;
          let notRotatedSize = textGeometry.Measure(this._labelsPaint);
          let rhx = Math.cos((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
          x += Math.abs(rhx * 0.5);
        }
        x -= this._labelsDesiredSize.Width * 0.5;
        label.HorizontalAlign = Align.Start;
      } else {
        if (hasRotation && this._labelsPaint != null) {
          let textGeometry = this._textGeometryFactory();
          textGeometry.Text = text;
          textGeometry.TextSize = this._textSize;
          textGeometry.Padding = this._padding;
          let notRotatedSize = textGeometry.Measure(this._labelsPaint);
          let rhx = Math.cos((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
          x -= Math.abs(rhx * 0.5);
        }
        x += this._labelsDesiredSize.Width * 0.5;
        label.HorizontalAlign = Align.End;
      }
    }
    if (this._orientation == AxisOrientation.X) {
      actualRotatation %= 180;
      if (actualRotatation < 0)
        actualRotatation += 180;
      if (actualRotatation >= 90)
        actualRotatation -= 180;
      let actualAlignment = this._labelsAlignment == null ? this._position == AxisPosition.Start ? Align.Start : Align.End : this._labelsAlignment;
      if (actualAlignment == Align.Start) {
        if (hasRotation && this._labelsPaint != null) {
          let textGeometry = this._textGeometryFactory();
          textGeometry.Text = text;
          textGeometry.TextSize = this._textSize;
          textGeometry.Padding = this._padding;
          let notRotatedSize = textGeometry.Measure(this._labelsPaint);
          let rhx = Math.sin((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
          y += Math.abs(rhx * 0.5);
        }
        if (hasRotation) {
          y -= this._labelsDesiredSize.Height * 0.5;
          label.HorizontalAlign = actualRotatation < 0 ? Align.End : Align.Start;
        } else {
          label.HorizontalAlign = Align.Middle;
        }
      } else {
        if (hasRotation && this._labelsPaint != null) {
          let textGeometry = this._textGeometryFactory();
          textGeometry.Text = text;
          textGeometry.TextSize = this._textSize;
          textGeometry.Padding = this._padding;
          let notRotatedSize = textGeometry.Measure(this._labelsPaint);
          let rhx = Math.sin((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
          y -= Math.abs(rhx * 0.5);
        }
        if (hasRotation) {
          y += this._labelsDesiredSize.Height * 0.5;
          label.HorizontalAlign = actualRotatation < 0 ? Align.Start : Align.End;
        } else {
          label.HorizontalAlign = Align.Middle;
        }
      }
    }
    label.Text = text;
    label.Padding = this._padding;
    label.X = x;
    label.Y = y;
    if (hasRotation)
      label.RotateTransform = actualRotatation;
    this.SetUpdateMode(label, mode);
  }
  SetUpdateMode(geometry, mode) {
    switch (mode) {
      case UpdateMode.UpdateAndComplete:
        if (this._animatableBounds.HasPreviousState)
          geometry.Opacity = 0;
        geometry.CompleteTransition(null);
        break;
      case UpdateMode.UpdateAndRemove:
        geometry.Opacity = 0;
        geometry.RemoveOnCompleted = true;
        break;
      case UpdateMode.Update:
      default:
        geometry.Opacity = 1;
        break;
    }
  }
  TryGetLabelOrLogError(labeler, value) {
    try {
      return labeler(value);
    } catch (e) {
      return "";
    }
  }
}
var UpdateMode = /* @__PURE__ */ ((UpdateMode2) => {
  UpdateMode2[UpdateMode2["Update"] = 0] = "Update";
  UpdateMode2[UpdateMode2["UpdateAndComplete"] = 1] = "UpdateAndComplete";
  UpdateMode2[UpdateMode2["UpdateAndRemove"] = 2] = "UpdateAndRemove";
  return UpdateMode2;
})(UpdateMode || {});
class RowSeries extends BarSeries {
  constructor(visualFactory, labelFactory, isStacked = false) {
    super(SeriesProperties.Bar | SeriesProperties.PrimaryAxisHorizontalOrientation | SeriesProperties.Solid | SeriesProperties.PrefersYStrategyTooltips | (isStacked ? SeriesProperties.Stacked : 0), visualFactory, labelFactory);
  }
  Invalidate(chart) {
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let secondaryScale = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    let primaryScale = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
    let previousPrimaryScale = Extensions.GetActualScaler(secondaryAxis, cartesianChart);
    let previousSecondaryScale = Extensions.GetActualScaler(primaryAxis, cartesianChart);
    let isStacked = (this.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked;
    let helper = new BarSeries.MeasureHelper(secondaryScale, cartesianChart, this, secondaryAxis, primaryScale.ToPixels(this.pivot), cartesianChart.DrawMarginLocation.X, cartesianChart.DrawMarginLocation.X + cartesianChart.DrawMarginSize.Width, isStacked);
    let pHelper = previousSecondaryScale == null || previousPrimaryScale == null ? null : new BarSeries.MeasureHelper(previousSecondaryScale, cartesianChart, this, secondaryAxis, previousPrimaryScale.ToPixels(this.pivot), cartesianChart.DrawMarginLocation.X, cartesianChart.DrawMarginLocation.X + cartesianChart.DrawMarginSize.Width, isStacked);
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (this.Fill != null) {
      this.Fill.ZIndex = actualZIndex + 0.1;
      this.Fill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.Fill);
    }
    if (this.Stroke != null) {
      this.Stroke.ZIndex = actualZIndex + 0.2;
      this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.Stroke);
    }
    if (this.DataLabelsPaint != null) {
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
    }
    let dls = this.DataLabelsSize;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    let rx = this.Rx;
    let ry = this.Ry;
    let stacker = isStacked ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup()) : null;
    for (const point of this.Fetch(cartesianChart)) {
      let visual = point.Context.Visual;
      let primary = primaryScale.ToPixels(point.PrimaryValue);
      let secondary = secondaryScale.ToPixels(point.SecondaryValue);
      let b = Math.abs(primary - helper.p);
      if (point.IsEmpty) {
        if (visual != null) {
          visual.X = secondary - helper.uwm + helper.cp;
          visual.Y = helper.p;
          visual.Width = helper.uw;
          visual.Height = 0;
          visual.RemoveOnCompleted = true;
          point.Context.Visual = null;
        }
        continue;
      }
      if (visual == null) {
        let yi = secondary - helper.uwm + helper.cp;
        let pi = helper.p;
        let uwi = helper.uw;
        let hi = 0;
        if (previousSecondaryScale != null && previousPrimaryScale != null && pHelper != null) {
          let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
          let bp = Math.abs(previousPrimary - pHelper.p);
          let cyp = point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;
          yi = previousSecondaryScale.ToPixels(point.SecondaryValue) - pHelper.uwm + pHelper.cp;
          pi = cartesianChart.IsZoomingOrPanning ? cyp : pHelper.p;
          uwi = pHelper.uw;
          hi = cartesianChart.IsZoomingOrPanning ? bp : 0;
        }
        let r = this._visualFactory();
        r.X = pi;
        r.Y = yi;
        r.Width = hi;
        r.Height = uwi;
        if (IsInterfaceOfIRoundedRectangleChartPoint(r)) {
          const rr1 = r;
          rr1.Rx = rx;
          rr1.Ry = ry;
        }
        visual = r;
        point.Context.Visual = visual;
        this.OnPointCreated(point);
        this.everFetched.Add(point);
      }
      this.Fill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      this.Stroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      let cx = secondaryAxis.IsInverted ? point.PrimaryValue > this.pivot ? primary : primary - b : point.PrimaryValue > this.pivot ? primary - b : primary;
      let y = secondary - helper.uwm + helper.cp;
      if (stacker != null) {
        let sx = stacker.GetStack(point);
        let primaryI = 0;
        let primaryJ = 0;
        if (point.PrimaryValue >= 0) {
          primaryI = primaryScale.ToPixels(sx.Start);
          primaryJ = primaryScale.ToPixels(sx.End);
        } else {
          primaryI = primaryScale.ToPixels(sx.NegativeStart);
          primaryJ = primaryScale.ToPixels(sx.NegativeEnd);
        }
        cx = primaryJ;
        b = primaryI - primaryJ;
      }
      visual.X = cx;
      visual.Y = y;
      visual.Width = b;
      visual.Height = helper.uw;
      if (IsInterfaceOfIRoundedRectangleChartPoint(visual)) {
        const rr2 = visual;
        rr2.Rx = rx;
        rr2.Ry = ry;
      }
      visual.RemoveOnCompleted = false;
      let ha;
      if (point.Context.HoverArea instanceof RectangleHoverArea)
        ha = point.Context.HoverArea;
      else
        point.Context.HoverArea = ha = new RectangleHoverArea();
      ha.SetDimensions(cx, secondary - helper.actualUw * 0.5, b, helper.actualUw);
      pointsCleanup.Clean(point);
      if (this.DataLabelsPaint != null) {
        let label = point.Context.Label;
        if (label == null) {
          let l = this._labelFactory();
          l.X = helper.p;
          l.Y = secondary - helper.uwm + helper.cp;
          l.RotateTransform = this.DataLabelsRotation;
          Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
          l.CompleteTransition(null);
          label = l;
          point.Context.Label = l;
        }
        this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
        label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
        label.TextSize = dls;
        label.Padding = this.DataLabelsPadding;
        let m = label.Measure(this.DataLabelsPaint);
        let labelPosition = this.GetLabelPosition(cx, y, b, helper.uw, label.Measure(this.DataLabelsPaint), this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > this.Pivot, drawLocation.Clone(), drawMarginSize.Clone());
        if (this.DataLabelsTranslate != null)
          label.TranslateTransform = new LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
        label.X = labelPosition.X;
        label.Y = labelPosition.Y;
      }
      this.OnPointMeasured(point);
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetRequestedSecondaryOffset() {
    return 0.5;
  }
  GetIsInvertedBounds() {
    return true;
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual, "visual.X", "visual.Width", "visual.Y", "visual.Height").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let chartView = point.Context.Chart;
    if (chartView.Core.IsZoomingOrPanning) {
      visual.CompleteTransition(null);
      visual.RemoveOnCompleted = true;
      this.DataFactory.DisposePoint(point);
      return;
    }
    let p = primaryScale.ToPixels(this.pivot);
    let secondary = secondaryScale.ToPixels(point.SecondaryValue);
    visual.X = p;
    visual.Y = secondary;
    visual.Width = 0;
    visual.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
}
class GeoMap {
  constructor(mapView) {
    __publicField(this, "_everMeasuredSeries", new System.HashSet());
    __publicField(this, "_updateThrottler");
    __publicField(this, "_panningThrottler");
    __publicField(this, "_isHeatInCanvas", false);
    __publicField(this, "_heatPaint");
    __publicField(this, "_previousStroke");
    __publicField(this, "_previousFill");
    __publicField(this, "_pointerPanningPosition", new LvcPoint(-10, -10).Clone());
    __publicField(this, "_pointerPreviousPanningPosition", new LvcPoint(-10, -10).Clone());
    __publicField(this, "_isPanning", false);
    __publicField(this, "_mapFactory");
    __publicField(this, "_activeMap");
    __publicField(this, "_isUnloaded", false);
    __publicField(this, "PointerDown", new System.Event());
    __publicField(this, "PointerMove", new System.Event());
    __publicField(this, "PointerUp", new System.Event());
    __publicField(this, "PointerLeft", new System.Event());
    __publicField(this, "PanGesture", new System.Event());
    __privateAdd(this, _View, void 0);
    this.View = mapView;
    this._updateThrottler = mapView.DesignerMode ? new ActionThrottler(() => Promise.resolve(), System.TimeSpan.FromMilliseconds(50)) : new ActionThrottler(this.UpdateThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(100));
    this._heatPaint = LiveCharts.DefaultSettings.GetProvider().GetSolidColorPaint();
    this._mapFactory = LiveCharts.DefaultSettings.GetProvider().GetDefaultMapFactory();
    this.PointerDown.Add(this.Chart_PointerDown, this);
    this.PointerMove.Add(this.Chart_PointerMove, this);
    this.PointerUp.Add(this.Chart_PointerUp, this);
    this.PointerLeft.Add(this.Chart_PointerLeft, this);
    this._panningThrottler = new ActionThrottler(this.PanningThrottlerUnlocked.bind(this), System.TimeSpan.FromMilliseconds(30));
  }
  get View() {
    return __privateGet(this, _View);
  }
  set View(value) {
    __privateSet(this, _View, value);
  }
  ViewTo(command) {
    this._mapFactory.ViewTo(this, command);
  }
  Pan(delta) {
    this._mapFactory.Pan(this, delta.Clone());
  }
  Update(chartUpdateParams = null) {
    chartUpdateParams ?? (chartUpdateParams = new ChartUpdateParams());
    if (chartUpdateParams.IsAutomaticUpdate && !this.View.AutoUpdateEnabled)
      return;
    if (!chartUpdateParams.Throttling) {
      this._updateThrottler.ForceCall();
      return;
    }
    this._updateThrottler.Call();
  }
  Unload() {
    if (this.View.Stroke != null)
      this.View.Canvas.RemovePaintTask(this.View.Stroke);
    if (this.View.Fill != null)
      this.View.Canvas.RemovePaintTask(this.View.Fill);
    this._everMeasuredSeries.Clear();
    this._heatPaint = null;
    this._previousStroke = null;
    this._previousFill = null;
    this._isUnloaded = true;
    this._mapFactory.Dispose();
    this._activeMap?.Dispose();
    this._activeMap = null;
    this._mapFactory = null;
    this.View.Canvas.Dispose();
  }
  InvokePointerDown(point) {
    this.PointerDown.Invoke(point.Clone());
  }
  InvokePointerMove(point) {
    this.PointerMove.Invoke(point.Clone());
  }
  InvokePointerUp(point) {
    this.PointerUp.Invoke(point.Clone());
  }
  InvokePointerLeft() {
    this.PointerLeft.Invoke();
  }
  InvokePanGestrue(eventArgs) {
    this.PanGesture.Invoke(eventArgs);
  }
  UpdateThrottlerUnlocked() {
    return new Promise(($resolve) => {
      this.View.InvokeOnUIThread(() => {
        {
          if (this._isUnloaded)
            return;
          this.Measure();
        }
      });
      $resolve();
    });
  }
  Measure() {
    if (this._activeMap != null && this._activeMap != this.View.ActiveMap) {
      this._previousStroke?.ClearGeometriesFromPaintTask(this.View.Canvas);
      this._previousFill?.ClearGeometriesFromPaintTask(this.View.Canvas);
      this._previousFill = null;
      this._previousStroke = null;
      this.View.Canvas.Clear();
    }
    this._activeMap = this.View.ActiveMap;
    if (!this._isHeatInCanvas) {
      this.View.Canvas.AddDrawableTask(this._heatPaint);
      this._isHeatInCanvas = true;
    }
    if (this._previousStroke != this.View.Stroke) {
      if (this._previousStroke != null)
        this.View.Canvas.RemovePaintTask(this._previousStroke);
      if (this.View.Stroke != null) {
        if (this.View.Stroke.ZIndex == 0)
          this.View.Stroke.ZIndex = 2;
        this.View.Stroke.IsStroke = true;
        this.View.Stroke.IsFill = false;
        this.View.Canvas.AddDrawableTask(this.View.Stroke);
      }
      this._previousStroke = this.View.Stroke;
    }
    if (this._previousFill != this.View.Fill) {
      if (this._previousFill != null)
        this.View.Canvas.RemovePaintTask(this._previousFill);
      if (this.View.Fill != null) {
        this.View.Fill.IsStroke = false;
        this.View.Fill.IsFill = true;
        this.View.Canvas.AddDrawableTask(this.View.Fill);
      }
      this._previousFill = this.View.Fill;
    }
    let i = this._previousFill?.ZIndex ?? 0;
    this._heatPaint.ZIndex = i + 1;
    let context = new MapContext(this, this.View, this.View.ActiveMap, Maps.BuildProjector(this.View.MapProjection, this.View.Width, this.View.Height));
    this._mapFactory.GenerateLands(context);
    let toDeleteSeries = new System.HashSet(this._everMeasuredSeries);
    for (const series of this.View.Series.Cast()) {
      series.Measure(context);
      this._everMeasuredSeries.Add(series);
      toDeleteSeries.Remove(series);
    }
    for (const series of toDeleteSeries) {
      series.Delete(context);
      this._everMeasuredSeries.Remove(series);
    }
    this.View.Canvas.Invalidate();
  }
  PanningThrottlerUnlocked() {
    return new Promise(($resolve) => {
      this.View.InvokeOnUIThread(() => {
        {
          this.Pan(new LvcPoint(this._pointerPanningPosition.X - this._pointerPreviousPanningPosition.X, this._pointerPanningPosition.Y - this._pointerPreviousPanningPosition.Y));
          this._pointerPreviousPanningPosition = new LvcPoint(this._pointerPanningPosition.X, this._pointerPanningPosition.Y);
        }
      });
      $resolve();
    });
  }
  Chart_PointerDown(pointerPosition) {
    this._isPanning = true;
    this._pointerPreviousPanningPosition = pointerPosition.Clone();
  }
  Chart_PointerMove(pointerPosition) {
    if (!this._isPanning)
      return;
    this._pointerPanningPosition = pointerPosition.Clone();
    this._panningThrottler.Call();
  }
  Chart_PointerLeft() {
  }
  Chart_PointerUp(pointerPosition) {
    if (!this._isPanning)
      return;
    this._isPanning = false;
    this._panningThrottler.Call();
  }
}
_View = new WeakMap();
class StackedColumnSeries extends ColumnSeries {
  constructor(visualFactory, labelFactory) {
    super(visualFactory, labelFactory, true);
    __publicField(this, "_stackGroup", 0);
  }
  get StackGroup() {
    return this._stackGroup;
  }
  set StackGroup(value) {
    this._stackGroup = value;
    this.OnPropertyChanged();
  }
  GetStackGroup() {
    return this._stackGroup;
  }
}
class PieChart extends Chart {
  constructor(view, defaultPlatformConfig, canvas, requiresLegendMeasureAlways = false) {
    super(canvas, defaultPlatformConfig, view);
    __publicField(this, "_chartView");
    __publicField(this, "_nextSeries", 0);
    __publicField(this, "_requiresLegendMeasureAlways", false);
    __privateAdd(this, _Series3, []);
    __privateAdd(this, _ValueBounds, new Bounds());
    __privateAdd(this, _IndexBounds, new Bounds());
    __privateAdd(this, _PushoutBounds, new Bounds());
    this._chartView = view;
    this._requiresLegendMeasureAlways = requiresLegendMeasureAlways;
  }
  get Series() {
    return __privateGet(this, _Series3);
  }
  set Series(value) {
    __privateSet(this, _Series3, value);
  }
  get ChartSeries() {
    return this.Series.Where((x) => !x.IsFillSeries);
  }
  get View() {
    return this._chartView;
  }
  get ValueBounds() {
    return __privateGet(this, _ValueBounds);
  }
  set ValueBounds(value) {
    __privateSet(this, _ValueBounds, value);
  }
  get IndexBounds() {
    return __privateGet(this, _IndexBounds);
  }
  set IndexBounds(value) {
    __privateSet(this, _IndexBounds, value);
  }
  get PushoutBounds() {
    return __privateGet(this, _PushoutBounds);
  }
  set PushoutBounds(value) {
    __privateSet(this, _PushoutBounds, value);
  }
  FindHoveredPointsBy(pointerPosition) {
    return this._chartView.Series.Where((series) => IsInterfaceOfIPieSeries(series) && !series.IsFillSeries).Where((series) => series.IsHoverable).SelectMany((series) => series.FindHitPoints(this, pointerPosition.Clone(), TooltipFindingStrategy.CompareAll));
  }
  Measure() {
    if (!this.IsLoaded)
      return;
    this.InvokeOnMeasuring();
    if (this._preserveFirstDraw) {
      this.IsFirstDraw = true;
      this._preserveFirstDraw = false;
    }
    this.MeasureWork = {};
    let viewDrawMargin = this._chartView.DrawMargin;
    this.ControlSize = this._chartView.ControlSize.Clone();
    let actualSeries = this._chartView.Series == null ? [] : this._chartView.Series.Where((x) => x.IsVisible);
    this.Series = actualSeries.Cast().ToArray();
    this.VisualElements = this._chartView.VisualElements?.ToArray() ?? [];
    this.LegendPosition = this._chartView.LegendPosition;
    this.Legend = this._chartView.Legend;
    this.TooltipPosition = this._chartView.TooltipPosition;
    this.Tooltip = this._chartView.Tooltip;
    this.AnimationsSpeed = this._chartView.AnimationsSpeed;
    this.EasingFunction = this._chartView.EasingFunction;
    this.SeriesContext = new SeriesContext(this.Series);
    let isNewTheme = LiveCharts.DefaultSettings.CurrentThemeId != this.ThemeId;
    let theme = LiveCharts.DefaultSettings.GetTheme();
    this.ValueBounds = new Bounds();
    this.IndexBounds = new Bounds();
    this.PushoutBounds = new Bounds();
    for (const series of this.Series) {
      if (series.SeriesId == -1)
        series.SeriesId = this._nextSeries++;
      let ce = series;
      ce._isInternalSet = true;
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToSeries(series);
        ce._isThemeSet = true;
      }
      let seriesBounds = series.GetBounds(this);
      this.ValueBounds.AppendValue(seriesBounds.PrimaryBounds.Max);
      this.ValueBounds.AppendValue(seriesBounds.PrimaryBounds.Min);
      this.IndexBounds.AppendValue(seriesBounds.SecondaryBounds.Max);
      this.IndexBounds.AppendValue(seriesBounds.SecondaryBounds.Min);
      this.PushoutBounds.AppendValue(seriesBounds.TertiaryBounds.Max);
      this.PushoutBounds.AppendValue(seriesBounds.TertiaryBounds.Min);
      ce._isInternalSet = false;
    }
    this.InitializeVisualsCollector();
    let seriesInLegend = this.Series.Where((x) => x.IsVisibleAtLegend).ToArray();
    this.DrawLegend(seriesInLegend);
    let title = this.View.Title;
    let m = Margin.Empty();
    if (title != null) {
      let titleSize = title.Measure(this, null, null);
      m.Top = titleSize.Height;
    }
    let rm = viewDrawMargin ?? Margin.All(Margin.Auto);
    let actualMargin = new Margin(Margin.IsAuto(rm.Left) ? m.Left : rm.Left, Margin.IsAuto(rm.Top) ? m.Top : rm.Top, Margin.IsAuto(rm.Right) ? m.Right : rm.Right, Margin.IsAuto(rm.Bottom) ? m.Bottom : rm.Bottom);
    this.SetDrawMargin(this.ControlSize.Clone(), actualMargin);
    if (this.DrawMarginSize.Width <= 0 || this.DrawMarginSize.Height <= 0)
      return;
    this.UpdateBounds();
    if (title != null) {
      let titleSize = title.Measure(this, null, null);
      title.AlignToTopLeftCorner();
      title.X = this.ControlSize.Width * 0.5 - titleSize.Width * 0.5;
      title.Y = 0;
      this.AddVisual(title);
    }
    for (const visual of this.VisualElements)
      this.AddVisual(visual);
    for (const series of this.Series)
      this.AddVisual(series);
    this.CollectVisuals();
    this.InvokeOnUpdateStarted();
    this.IsFirstDraw = false;
    this.ThemeId = LiveCharts.DefaultSettings.CurrentThemeId;
    this.PreviousSeriesAtLegend = this.Series.Where((x) => x.IsVisibleAtLegend).ToArray();
    this.PreviousLegendPosition = this.LegendPosition;
    this.Canvas.Invalidate();
  }
  Unload() {
    super.Unload();
    this.IsFirstDraw = true;
  }
}
_Series3 = new WeakMap();
_ValueBounds = new WeakMap();
_IndexBounds = new WeakMap();
_PushoutBounds = new WeakMap();
class ChartSeries extends Series {
  constructor(properties) {
    super(properties);
    __publicField(this, "_dataLabelsPaint");
    __publicField(this, "_dataLabelsSize", 16);
    __publicField(this, "_dataLabelsRotation", 0);
    __publicField(this, "_dataLabelsPadding", new Padding(6, 8, 6, 8));
    __privateAdd(this, _IsFirstDraw2, true);
  }
  get DataLabelsPaint() {
    return this._dataLabelsPaint;
  }
  set DataLabelsPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._dataLabelsPaint, ($v) => this._dataLabelsPaint = $v), value);
  }
  get DataLabelsSize() {
    return this._dataLabelsSize;
  }
  set DataLabelsSize(value) {
    this.SetProperty(new System.Ref(() => this._dataLabelsSize, ($v) => this._dataLabelsSize = $v), value);
  }
  get DataLabelsRotation() {
    return this._dataLabelsRotation;
  }
  set DataLabelsRotation(value) {
    this.SetProperty(new System.Ref(() => this._dataLabelsRotation, ($v) => this._dataLabelsRotation = $v), value);
  }
  get DataLabelsPadding() {
    return this._dataLabelsPadding;
  }
  set DataLabelsPadding(value) {
    this.SetProperty(new System.Ref(() => this._dataLabelsPadding, ($v) => this._dataLabelsPadding = $v), value);
  }
  get IsFirstDraw() {
    return __privateGet(this, _IsFirstDraw2);
  }
  set IsFirstDraw(value) {
    __privateSet(this, _IsFirstDraw2, value);
  }
  OnDataPointerDown(chart, points, pointer) {
    this.OnDataPointerDown(chart, points, pointer.Clone());
  }
}
_IsFirstDraw2 = new WeakMap();
const _CartesianChart = class extends Chart {
  constructor(view, defaultPlatformConfig, canvas, zoomingSection) {
    super(canvas, defaultPlatformConfig, view);
    __publicField(this, "_chartView");
    __publicField(this, "_zoomingSection");
    __publicField(this, "_nextSeries", 0);
    __publicField(this, "_zoomingSpeed", 0);
    __publicField(this, "_zoomMode", 0);
    __publicField(this, "_previousDrawMarginFrame");
    __publicField(this, "_crosshair", new System.HashSet());
    __privateAdd(this, _XAxes, []);
    __privateAdd(this, _YAxes, []);
    __privateAdd(this, _Series4, []);
    __privateAdd(this, _Sections, []);
    __privateAdd(this, _IsZoomingOrPanning, false);
    __publicField(this, "_sectionZoomingStart", null);
    if (zoomingSection == null)
      throw new System.Exception(`${"zoomingSection"} is required.`);
    this._chartView = view;
    this._zoomingSection = zoomingSection;
    this._zoomingSection.X = -1;
    this._zoomingSection.Y = -1;
    this._zoomingSection.Width = 0;
    this._zoomingSection.Height = 0;
  }
  get XAxes() {
    return __privateGet(this, _XAxes);
  }
  set XAxes(value) {
    __privateSet(this, _XAxes, value);
  }
  get YAxes() {
    return __privateGet(this, _YAxes);
  }
  set YAxes(value) {
    __privateSet(this, _YAxes, value);
  }
  get Series() {
    return __privateGet(this, _Series4);
  }
  set Series(value) {
    __privateSet(this, _Series4, value);
  }
  get Sections() {
    return __privateGet(this, _Sections);
  }
  set Sections(value) {
    __privateSet(this, _Sections, value);
  }
  get ChartSeries() {
    return this.Series;
  }
  get IsZoomingOrPanning() {
    return __privateGet(this, _IsZoomingOrPanning);
  }
  set IsZoomingOrPanning(value) {
    __privateSet(this, _IsZoomingOrPanning, value);
  }
  get View() {
    return this._chartView;
  }
  FindHoveredPointsBy(pointerPosition) {
    let actualStrategy = this.TooltipFindingStrategy;
    if (actualStrategy == TooltipFindingStrategy.Automatic)
      actualStrategy = Extensions.GetTooltipFindingStrategy(this.Series);
    return this.ChartSeries.Where((series) => series.IsHoverable).SelectMany((series) => series.FindHitPoints(this, pointerPosition.Clone(), actualStrategy));
  }
  ScaleUIPoint(point, xAxisIndex = 0, yAxisIndex = 0) {
    let xAxis = this.XAxes[xAxisIndex];
    let yAxis = this.YAxes[yAxisIndex];
    let xScaler = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), xAxis);
    let yScaler = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), yAxis);
    return new Float64Array([xScaler.ToChartValues(point.X), yScaler.ToChartValues(point.Y)]);
  }
  Zoom(pivot, direction, scaleFactor = null, isActive = false) {
    if (this.YAxes == null || this.XAxes == null)
      return;
    let speed = this._zoomingSpeed < 0.1 ? 0.1 : this._zoomingSpeed > 0.95 ? 0.95 : this._zoomingSpeed;
    speed = 1 - speed;
    if (scaleFactor != null && direction != ZoomDirection.DefinedByScaleFactor)
      throw new System.InvalidOperationException(`When the scale factor is defined, the zoom direction must be ${"ZoomDirection.DefinedByScaleFactor"}... it just makes sense.`);
    let m = direction == ZoomDirection.ZoomIn ? speed : 1 / speed;
    if ((this._zoomMode & ZoomAndPanMode.X) == ZoomAndPanMode.X) {
      for (let index = 0; index < this.XAxes.length; index++) {
        let xi = this.XAxes[index];
        let px = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), xi).ToChartValues(pivot.X);
        let max = xi.MaxLimit == null ? xi.DataBounds.Max : xi.MaxLimit;
        let min = xi.MinLimit == null ? xi.DataBounds.Min : xi.MinLimit;
        let mint = 0;
        let maxt = 0;
        let l = max - min;
        if (scaleFactor == null) {
          let rMin = (px - min) / l;
          let rMax = 1 - rMin;
          let target = l * m;
          mint = px - target * rMin;
          maxt = px + target * rMax;
        } else {
          let delta = 1 - scaleFactor;
          let dir = 0;
          if (delta < 0) {
            dir = -1;
            direction = ZoomDirection.ZoomIn;
          } else {
            dir = 1;
            direction = ZoomDirection.ZoomOut;
          }
          let ld = l * Math.abs(delta);
          mint = min - ld * 0.5 * dir;
          maxt = max + ld * 0.5 * dir;
        }
        let minZoomDelta = xi.MinZoomDelta ?? xi.DataBounds.MinDelta * 3;
        if (direction == ZoomDirection.ZoomIn && maxt - mint < minZoomDelta)
          continue;
        let xm = (max - min) * (isActive ? _CartesianChart.MaxAxisActiveBound : _CartesianChart.MaxAxisBound);
        if (maxt > xi.DataBounds.Max && direction == ZoomDirection.ZoomOut)
          maxt = xi.DataBounds.Max + xm;
        if (mint < xi.DataBounds.Min && direction == ZoomDirection.ZoomOut)
          mint = xi.DataBounds.Min - xm;
        xi.MaxLimit = maxt;
        xi.MinLimit = mint;
      }
    }
    if ((this._zoomMode & ZoomAndPanMode.Y) == ZoomAndPanMode.Y) {
      for (let index = 0; index < this.YAxes.length; index++) {
        let yi = this.YAxes[index];
        let px = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), yi).ToChartValues(pivot.Y);
        let max = yi.MaxLimit == null ? yi.DataBounds.Max : yi.MaxLimit;
        let min = yi.MinLimit == null ? yi.DataBounds.Min : yi.MinLimit;
        let mint = 0;
        let maxt = 0;
        let l = max - min;
        if (scaleFactor == null) {
          let rMin = (px - min) / l;
          let rMax = 1 - rMin;
          let target = l * m;
          mint = px - target * rMin;
          maxt = px + target * rMax;
        } else {
          let delta = 1 - scaleFactor;
          let dir = 0;
          if (delta < 0) {
            dir = -1;
            direction = ZoomDirection.ZoomIn;
          } else {
            dir = 1;
            direction = ZoomDirection.ZoomOut;
          }
          let ld = l * Math.abs(delta);
          mint = min - ld * 0.5 * dir;
          maxt = max + ld * 0.5 * dir;
        }
        let minZoomDelta = yi.MinZoomDelta ?? yi.DataBounds.MinDelta * 3;
        if (direction == ZoomDirection.ZoomIn && maxt - mint < minZoomDelta)
          continue;
        let ym = (max - min) * (isActive ? _CartesianChart.MaxAxisActiveBound : _CartesianChart.MaxAxisBound);
        if (maxt > yi.DataBounds.Max && direction == ZoomDirection.ZoomOut)
          maxt = yi.DataBounds.Max + ym;
        if (mint < yi.DataBounds.Min && direction == ZoomDirection.ZoomOut)
          mint = yi.DataBounds.Min - ym;
        yi.MaxLimit = maxt;
        yi.MinLimit = mint;
      }
    }
    this.IsZoomingOrPanning = true;
  }
  Pan(delta, isActive) {
    if ((this._zoomMode & ZoomAndPanMode.X) == ZoomAndPanMode.X) {
      for (let index = 0; index < this.XAxes.length; index++) {
        let xi = this.XAxes[index];
        let scale = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), xi);
        let dx = scale.ToChartValues(-delta.X) - scale.ToChartValues(0);
        let max = xi.MaxLimit == null ? xi.DataBounds.Max : xi.MaxLimit;
        let min = xi.MinLimit == null ? xi.DataBounds.Min : xi.MinLimit;
        let xm = max - min;
        xm = isActive ? xm * _CartesianChart.MaxAxisActiveBound : xm * _CartesianChart.MaxAxisBound;
        if (max + dx > xi.DataBounds.Max && delta.X < 0) {
          xi.MaxLimit = xi.DataBounds.Max + xm;
          xi.MinLimit = xi.DataBounds.Max - (max - xm - min);
          continue;
        }
        if (min + dx < xi.DataBounds.Min && delta.X > 0) {
          xi.MinLimit = xi.DataBounds.Min - xm;
          xi.MaxLimit = xi.DataBounds.Min + max - min - xm;
          continue;
        }
        xi.MaxLimit = max + dx;
        xi.MinLimit = min + dx;
      }
    }
    if ((this._zoomMode & ZoomAndPanMode.Y) == ZoomAndPanMode.Y) {
      for (let index = 0; index < this.YAxes.length; index++) {
        let yi = this.YAxes[index];
        let scale = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), yi);
        let dy = -(scale.ToChartValues(delta.Y) - scale.ToChartValues(0));
        let max = yi.MaxLimit == null ? yi.DataBounds.Max : yi.MaxLimit;
        let min = yi.MinLimit == null ? yi.DataBounds.Min : yi.MinLimit;
        let ym = max - min;
        ym = isActive ? ym * _CartesianChart.MaxAxisActiveBound : ym * _CartesianChart.MaxAxisBound;
        if (max + dy > yi.DataBounds.Max) {
          yi.MaxLimit = yi.DataBounds.Max + ym;
          yi.MinLimit = yi.DataBounds.Max - (max - ym - min);
          continue;
        }
        if (min + dy < yi.DataBounds.Min) {
          yi.MinLimit = yi.DataBounds.Min - ym;
          yi.MaxLimit = yi.DataBounds.Min + max - min - ym;
          continue;
        }
        yi.MaxLimit = max + dy;
        yi.MinLimit = min + dy;
      }
    }
    this.IsZoomingOrPanning = true;
  }
  Measure() {
    if (!this.IsLoaded)
      return;
    this.InvokeOnMeasuring();
    if (this._preserveFirstDraw) {
      this.IsFirstDraw = true;
      this._preserveFirstDraw = false;
    }
    this.MeasureWork = {};
    let viewDrawMargin = this._chartView.DrawMargin;
    this.ControlSize = this._chartView.ControlSize.Clone();
    this.YAxes = this._chartView.YAxes.Cast().Select((x) => x).ToArray();
    this.XAxes = this._chartView.XAxes.Cast().Select((x) => x).ToArray();
    this._zoomingSpeed = this._chartView.ZoomingSpeed;
    this._zoomMode = this._chartView.ZoomMode;
    let theme = LiveCharts.DefaultSettings.GetTheme();
    this.LegendPosition = this._chartView.LegendPosition;
    this.Legend = this._chartView.Legend;
    this.TooltipPosition = this._chartView.TooltipPosition;
    this.TooltipFindingStrategy = this._chartView.TooltipFindingStrategy;
    this.Tooltip = this._chartView.Tooltip;
    this.AnimationsSpeed = this._chartView.AnimationsSpeed;
    this.EasingFunction = this._chartView.EasingFunction;
    let actualSeries = this._chartView.Series == null ? [] : this._chartView.Series.Where((x) => x.IsVisible);
    this.Series = actualSeries.Cast().ToArray();
    this.Sections = this._chartView.Sections?.Where((x) => x.IsVisible).ToArray() ?? [];
    this.VisualElements = this._chartView.VisualElements?.ToArray() ?? [];
    this.SeriesContext = new SeriesContext(this.Series);
    let isNewTheme = LiveCharts.DefaultSettings.CurrentThemeId != this.ThemeId;
    for (const axis of this.XAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      axis.Initialize(AxisOrientation.X);
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToAxis(axis);
        ce._isThemeSet = true;
      }
      ce._isInternalSet = false;
      if (axis.CrosshairPaint != null)
        this._crosshair.Add(axis);
    }
    for (const axis of this.YAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      axis.Initialize(AxisOrientation.Y);
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToAxis(axis);
        ce._isThemeSet = true;
      }
      ce._isInternalSet = false;
      if (axis.CrosshairPaint != null)
        this._crosshair.Add(axis);
    }
    this.SetDrawMargin(this.ControlSize.Clone(), Margin.Empty());
    for (const series of this.Series) {
      if (series.SeriesId == -1)
        series.SeriesId = this._nextSeries++;
      let ce = series;
      ce._isInternalSet = true;
      if (!ce._isThemeSet || isNewTheme) {
        theme.ApplyStyleToSeries(series);
        ce._isThemeSet = true;
      }
      let xAxis = this.XAxes[series.ScalesXAt];
      let yAxis = this.YAxes[series.ScalesYAt];
      let seriesBounds = series.GetBounds(this, xAxis, yAxis).Bounds;
      if (seriesBounds.IsEmpty)
        continue;
      xAxis.DataBounds.AppendValueByBounds(seriesBounds.SecondaryBounds);
      yAxis.DataBounds.AppendValueByBounds(seriesBounds.PrimaryBounds);
      xAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.VisibleSecondaryBounds);
      yAxis.VisibleDataBounds.AppendValueByBounds(seriesBounds.VisiblePrimaryBounds);
      ce._isInternalSet = false;
    }
    for (const axis of this.XAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      if (!axis.DataBounds.IsEmpty) {
        ce._isInternalSet = false;
        continue;
      }
      let min = 0;
      let max = 10 * axis.UnitWidth;
      axis.DataBounds.AppendValue(max);
      axis.DataBounds.AppendValue(min);
      axis.VisibleDataBounds.AppendValue(max);
      axis.VisibleDataBounds.AppendValue(min);
      if (axis.DataBounds.MinDelta < max)
        axis.DataBounds.MinDelta = max;
      ce._isInternalSet = false;
    }
    for (const axis of this.YAxes) {
      let ce = axis;
      ce._isInternalSet = true;
      if (!axis.DataBounds.IsEmpty) {
        ce._isInternalSet = false;
        continue;
      }
      let min = 0;
      let max = 10 * axis.UnitWidth;
      axis.DataBounds.AppendValue(max);
      axis.DataBounds.AppendValue(min);
      axis.VisibleDataBounds.AppendValue(max);
      axis.VisibleDataBounds.AppendValue(min);
      if (axis.DataBounds.MinDelta < max)
        axis.DataBounds.MinDelta = max;
      ce._isInternalSet = false;
    }
    this.InitializeVisualsCollector();
    let seriesInLegend = this.Series.Where((x) => x.IsVisibleAtLegend).ToArray();
    this.DrawLegend(seriesInLegend);
    let title = this.View.Title;
    let m = Margin.Empty();
    let ts = 0;
    let bs = 0;
    let ls = 0;
    let rs = 0;
    if (title != null) {
      let titleSize = title.Measure(this, null, null);
      m.Top = titleSize.Height;
      ts = titleSize.Height;
    }
    this.SetDrawMargin(this.ControlSize.Clone(), m);
    for (const axis of this.XAxes) {
      if (!axis.IsVisible)
        continue;
      if (axis.DataBounds.Max == axis.DataBounds.Min) {
        let c = axis.UnitWidth * 0.5;
        axis.DataBounds.Min = axis.DataBounds.Min - c;
        axis.DataBounds.Max = axis.DataBounds.Max + c;
        axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - c;
        axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + c;
      }
      let drawablePlane = axis;
      let ns = drawablePlane.GetNameLabelSize(this);
      let s = drawablePlane.GetPossibleSize(this);
      axis.Size = s.Clone();
      if (axis.Position == AxisPosition.Start) {
        if (axis.InLineNamePlacement) {
          let h = s.Height > ns.Height ? s.Height : ns.Height;
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(0, this.ControlSize.Height - h), new LvcSize(ns.Width, h));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(0, axis.NameDesiredSize.Y - h), new LvcSize(this.ControlSize.Width, s.Height));
          axis.Yo = m.Bottom + h * 0.5;
          bs = h;
          m.Bottom = bs;
          m.Left = ns.Width;
        } else {
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(0, this.ControlSize.Height - bs - ns.Height), new LvcSize(this.ControlSize.Width, ns.Height));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(0, axis.NameDesiredSize.Y - s.Height), new LvcSize(this.ControlSize.Width, s.Height));
          axis.Yo = m.Bottom + s.Height * 0.5 + ns.Height;
          bs += s.Height + ns.Height;
          m.Bottom = bs;
          if (s.Width * 0.5 > m.Left)
            m.Left = s.Width * 0.5;
          if (s.Width * 0.5 > m.Right)
            m.Right = s.Width * 0.5;
        }
      } else {
        if (axis.InLineNamePlacement) {
          let h = s.Height > ns.Height ? s.Height : ns.Height;
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(0, 0), new LvcSize(ns.Width, h));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(0, axis.NameDesiredSize.Y - h), new LvcSize(this.ControlSize.Width, s.Height));
          axis.Yo = m.Top + h * 0.5;
          ts = h;
          m.Top = ts;
          m.Left = ns.Width;
        } else {
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(0, ts), new LvcSize(this.ControlSize.Width, ns.Height));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(0, ts + ns.Height), new LvcSize(this.ControlSize.Width, s.Height));
          axis.Yo = ts + s.Height * 0.5 + ns.Height;
          ts += s.Height + ns.Height;
          m.Top = ts;
          if (ls + s.Width * 0.5 > m.Left)
            m.Left = ls + s.Width * 0.5;
          if (rs + s.Width * 0.5 > m.Right)
            m.Right = rs + s.Width * 0.5;
        }
      }
    }
    for (const axis of this.YAxes) {
      if (!axis.IsVisible)
        continue;
      if (axis.DataBounds.Max == axis.DataBounds.Min) {
        let c = axis.UnitWidth * 0.5;
        axis.DataBounds.Min = axis.DataBounds.Min - c;
        axis.DataBounds.Max = axis.DataBounds.Max + c;
        axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - c;
        axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + c;
      }
      let drawablePlane = axis;
      let ns = drawablePlane.GetNameLabelSize(this);
      let s = drawablePlane.GetPossibleSize(this);
      axis.Size = s.Clone();
      let w = s.Width;
      if (axis.Position == AxisPosition.Start) {
        if (axis.InLineNamePlacement) {
          if (w < ns.Width)
            w = ns.Width;
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(ls, 0), new LvcSize(ns.Width, ns.Height));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(ls, 0), new LvcSize(s.Width, this.ControlSize.Height));
          axis.Xo = ls + w * 0.5;
          ls += w;
          m.Top = ns.Height;
          m.Left = ls;
        } else {
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(ls, 0), new LvcSize(ns.Width, this.ControlSize.Height));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(ls + ns.Width, 0), new LvcSize(s.Width, this.ControlSize.Height));
          axis.Xo = ls + w * 0.5 + ns.Width;
          ls += w + ns.Width;
          m.Left = ls;
          if (s.Height * 0.5 > m.Top) {
            m.Top = s.Height * 0.5;
          }
          if (s.Height * 0.5 > m.Bottom) {
            m.Bottom = s.Height * 0.5;
          }
        }
      } else {
        if (axis.InLineNamePlacement) {
          if (w < ns.Width)
            w = ns.Width;
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(this.ControlSize.Width - rs - ns.Width, 0), new LvcSize(ns.Width, ns.Height));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(axis.NameDesiredSize.X - s.Width, 0), new LvcSize(s.Width, this.ControlSize.Height));
          axis.Xo = rs + w * 0.5;
          rs += w;
          m.Top = ns.Height;
          m.Right = rs;
        } else {
          axis.NameDesiredSize = new LvcRectangle(new LvcPoint(this.ControlSize.Width - rs - ns.Width, 0), new LvcSize(ns.Width, this.ControlSize.Height));
          axis.LabelsDesiredSize = new LvcRectangle(new LvcPoint(axis.NameDesiredSize.X - s.Width, 0), new LvcSize(s.Width, this.ControlSize.Height));
          axis.Xo = rs + w * 0.5 + ns.Width;
          rs += w + ns.Width;
          m.Right = rs;
          if (ts + s.Height * 0.5 > m.Top)
            m.Top = ts + s.Height * 0.5;
          if (bs + s.Height * 0.5 > m.Bottom)
            m.Bottom = bs + s.Height * 0.5;
        }
      }
    }
    let rm = viewDrawMargin ?? Margin.All(Margin.Auto);
    let actualMargin = new Margin(Margin.IsAuto(rm.Left) ? m.Left : rm.Left, Margin.IsAuto(rm.Top) ? m.Top : rm.Top, Margin.IsAuto(rm.Right) ? m.Right : rm.Right, Margin.IsAuto(rm.Bottom) ? m.Bottom : rm.Bottom);
    this.SetDrawMargin(this.ControlSize.Clone(), actualMargin);
    if (this.DrawMarginSize.Width <= 0 || this.DrawMarginSize.Height <= 0)
      return;
    this.UpdateBounds();
    if (title != null) {
      let titleSize = title.Measure(this, null, null);
      title.AlignToTopLeftCorner();
      title.X = this.ControlSize.Width * 0.5 - titleSize.Width * 0.5;
      title.Y = 0;
      this.AddVisual(title);
    }
    let totalAxes = this.XAxes.Concat(this.YAxes).ToArray();
    for (const axis of totalAxes) {
      if (axis.DataBounds.Max == axis.DataBounds.Min) {
        let c = axis.DataBounds.Min * 0.3;
        axis.DataBounds.Min = axis.DataBounds.Min - c;
        axis.DataBounds.Max = axis.DataBounds.Max + c;
      }
      if (axis.MinLimit == null) {
        let s = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), axis);
        let p = Math.abs(s.ToChartValues(axis.DataBounds.RequestedGeometrySize) - s.ToChartValues(0));
        if (axis.DataBounds.PaddingMin > p)
          p = axis.DataBounds.PaddingMin;
        let ce = axis;
        ce._isInternalSet = true;
        axis.DataBounds.Min = axis.DataBounds.Min - p;
        axis.VisibleDataBounds.Min = axis.VisibleDataBounds.Min - p;
        ce._isInternalSet = false;
      }
      if (axis.MaxLimit == null) {
        let s = Scaler.Make(this.DrawMarginLocation.Clone(), this.DrawMarginSize.Clone(), axis);
        let p = Math.abs(s.ToChartValues(axis.DataBounds.RequestedGeometrySize) - s.ToChartValues(0));
        if (axis.DataBounds.PaddingMax > p)
          p = axis.DataBounds.PaddingMax;
        let ce = axis;
        ce._isInternalSet = true;
        axis.DataBounds.Max = axis.DataBounds.Max + p;
        axis.VisibleDataBounds.Max = axis.VisibleDataBounds.Max + p;
        ce._isInternalSet = false;
      }
      if (axis.IsVisible)
        this.AddVisual(axis);
      axis.RemoveOldPaints(this.View);
    }
    for (const section of this.Sections)
      this.AddVisual(section);
    for (const visual of this.VisualElements)
      this.AddVisual(visual);
    for (const series of this.Series)
      this.AddVisual(series);
    if (this._previousDrawMarginFrame != null && this._chartView.DrawMarginFrame != this._previousDrawMarginFrame) {
      this._previousDrawMarginFrame.RemoveFromUI(this);
      this._previousDrawMarginFrame = null;
    }
    if (this._chartView.DrawMarginFrame != null) {
      this.AddVisual(this._chartView.DrawMarginFrame);
      this._previousDrawMarginFrame = this._chartView.DrawMarginFrame;
    }
    this.CollectVisuals();
    for (const axis of totalAxes) {
      if (!axis.IsVisible)
        continue;
      let ce = axis;
      ce._isInternalSet = true;
      axis.ActualBounds.HasPreviousState = true;
      ce._isInternalSet = false;
    }
    this.ActualBounds.HasPreviousState = true;
    this.IsZoomingOrPanning = false;
    this.InvokeOnUpdateStarted();
    this.IsFirstDraw = false;
    this.ThemeId = LiveCharts.DefaultSettings.CurrentThemeId;
    this.PreviousSeriesAtLegend = this.Series.Where((x) => x.IsVisibleAtLegend).ToArray();
    this.PreviousLegendPosition = this.LegendPosition;
    this.Canvas.Invalidate();
  }
  Unload() {
    super.Unload();
    this._crosshair = new System.HashSet();
    this.IsFirstDraw = true;
  }
  InvokePointerDown(point, isSecondaryAction) {
    if (isSecondaryAction && this._zoomMode != ZoomAndPanMode.None) {
      this._sectionZoomingStart = point.Clone();
      let x = point.X;
      let y = point.Y;
      if (x < this.DrawMarginLocation.X || x > this.DrawMarginLocation.X + this.DrawMarginSize.Width || y < this.DrawMarginLocation.Y || y > this.DrawMarginLocation.Y + this.DrawMarginSize.Height) {
        this._sectionZoomingStart = null;
        return;
      }
      this._zoomingSection.X = x;
      this._zoomingSection.Y = y;
      let xMode = (this._zoomMode & ZoomAndPanMode.X) == ZoomAndPanMode.X;
      let yMode = (this._zoomMode & ZoomAndPanMode.Y) == ZoomAndPanMode.Y;
      if (!xMode) {
        this._zoomingSection.X = this.DrawMarginLocation.X;
        this._zoomingSection.Width = this.DrawMarginSize.Width;
      }
      if (!yMode) {
        this._zoomingSection.Y = this.DrawMarginLocation.Y;
        this._zoomingSection.Height = this.DrawMarginSize.Height;
      }
      return;
    }
    super.InvokePointerDown(point.Clone(), isSecondaryAction);
  }
  InvokePointerMove(point) {
    for (const axis of this._crosshair) {
      axis.InvalidateCrosshair(this, point.Clone());
    }
    if (this._sectionZoomingStart != null) {
      let xMode = (this._zoomMode & ZoomAndPanMode.X) == ZoomAndPanMode.X;
      let yMode = (this._zoomMode & ZoomAndPanMode.Y) == ZoomAndPanMode.Y;
      let x = point.X;
      let y = point.Y;
      if (x < this.DrawMarginLocation.X)
        x = this.DrawMarginLocation.X;
      if (x > this.DrawMarginLocation.X + this.DrawMarginSize.Width)
        x = this.DrawMarginLocation.X + this.DrawMarginSize.Width;
      if (y < this.DrawMarginLocation.Y)
        y = this.DrawMarginLocation.Y;
      if (y > this.DrawMarginLocation.Y + this.DrawMarginSize.Height)
        y = this.DrawMarginLocation.Y + this.DrawMarginSize.Height;
      if (xMode)
        this._zoomingSection.Width = x - this._sectionZoomingStart.X;
      if (yMode)
        this._zoomingSection.Height = y - this._sectionZoomingStart.Y;
      this.Canvas.Invalidate();
      return;
    }
    super.InvokePointerMove(point.Clone());
  }
  InvokePointerUp(point, isSecondaryAction) {
    if (this._sectionZoomingStart != null) {
      let xy = Math.sqrt(Math.pow(point.X - this._sectionZoomingStart.X, 2) + Math.pow(point.Y - this._sectionZoomingStart.Y, 2));
      if (xy < 15) {
        this._zoomingSection.X = -1;
        this._zoomingSection.Y = -1;
        this._zoomingSection.Width = 0;
        this._zoomingSection.Height = 0;
        this.Update();
        this._sectionZoomingStart = null;
        return;
      }
      if ((this._zoomMode & ZoomAndPanMode.X) == ZoomAndPanMode.X) {
        for (let i = 0; i < this.XAxes.length; i++) {
          let x = this.XAxes[i];
          let xi = this.ScaleUIPoint(this._sectionZoomingStart.Clone(), i, 0)[0];
          let xj = this.ScaleUIPoint(point.Clone(), i, 0)[0];
          let xMax = 0;
          let xMin = 0;
          if (xi > xj) {
            xMax = xi;
            xMin = xj;
          } else {
            xMax = xj;
            xMin = xi;
          }
          if (xMax > (x.MaxLimit ?? Number.MAX_VALUE))
            xMax = x.MaxLimit ?? Number.MAX_VALUE;
          if (xMin < (x.MinLimit ?? Number.MIN_VALUE))
            xMin = x.MinLimit ?? Number.MIN_VALUE;
          let min = x.MinZoomDelta ?? x.DataBounds.MinDelta * 3;
          if (xMax - xMin > min) {
            x.MinLimit = xMin;
            x.MaxLimit = xMax;
          } else {
            if (x.MaxLimit != null && x.MinLimit != null) {
              let d = xMax - xMin;
              let ad = x.MaxLimit - x.MinLimit;
              let c = (ad - d) * 0.5;
              x.MinLimit = xMin - c;
              x.MaxLimit = xMax + c;
            }
          }
        }
      }
      if ((this._zoomMode & ZoomAndPanMode.Y) == ZoomAndPanMode.Y) {
        for (let i = 0; i < this.YAxes.length; i++) {
          let y = this.YAxes[i];
          let yi = this.ScaleUIPoint(this._sectionZoomingStart.Clone(), 0, i)[1];
          let yj = this.ScaleUIPoint(point.Clone(), 0, i)[1];
          let yMax = 0;
          let yMin = 0;
          if (yi > yj) {
            yMax = yi;
            yMin = yj;
          } else {
            yMax = yj;
            yMin = yi;
          }
          if (yMax > (y.MaxLimit ?? Number.MAX_VALUE))
            yMax = y.MaxLimit ?? Number.MAX_VALUE;
          if (yMin < (y.MinLimit ?? Number.MIN_VALUE))
            yMin = y.MinLimit ?? Number.MIN_VALUE;
          let min = y.MinZoomDelta ?? y.DataBounds.MinDelta * 3;
          if (yMax - yMin > min) {
            y.MinLimit = yMin;
            y.MaxLimit = yMax;
          } else {
            if (y.MaxLimit != null && y.MinLimit != null) {
              let d = yMax - yMin;
              let ad = y.MaxLimit - y.MinLimit;
              let c = (ad - d) * 0.5;
              y.MinLimit = yMin - c;
              y.MaxLimit = yMax + c;
            }
          }
        }
      }
      this._zoomingSection.X = -1;
      this._zoomingSection.Y = -1;
      this._zoomingSection.Width = 0;
      this._zoomingSection.Height = 0;
      this._sectionZoomingStart = null;
      return;
    }
    super.InvokePointerUp(point.Clone(), isSecondaryAction);
  }
};
let CartesianChart = _CartesianChart;
_XAxes = new WeakMap();
_YAxes = new WeakMap();
_Series4 = new WeakMap();
_Sections = new WeakMap();
_IsZoomingOrPanning = new WeakMap();
__publicField(CartesianChart, "MaxAxisBound", 0.05);
__publicField(CartesianChart, "MaxAxisActiveBound", 0.15);
class DrawMarginFrame extends ChartElement {
  constructor() {
    super(...arguments);
    __publicField(this, "_stroke", null);
    __publicField(this, "_fill", null);
  }
  get Stroke() {
    return this._stroke;
  }
  set Stroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._stroke, ($v) => this._stroke = $v), value, true);
  }
  get Fill() {
    return this._fill;
  }
  set Fill(value) {
    this.SetPaintProperty(new System.Ref(() => this._fill, ($v) => this._fill = $v), value);
  }
  GetPaintTasks() {
    return [this._stroke, this._fill];
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged(propertyName);
  }
}
class DrawMarginFrame2 extends DrawMarginFrame {
  constructor(sizedGeometryFactory) {
    super();
    __publicField(this, "_sizedGeometryFactory");
    __publicField(this, "_fillSizedGeometry");
    __publicField(this, "_strokeSizedGeometry");
    __publicField(this, "_isInitialized", false);
    this._sizedGeometryFactory = sizedGeometryFactory;
  }
  Invalidate(chart) {
    let drawLocation = chart.DrawMarginLocation.Clone();
    let drawMarginSize = chart.DrawMarginSize.Clone();
    if (this.Fill != null) {
      this.Fill.ZIndex = -3;
      this._fillSizedGeometry ?? (this._fillSizedGeometry = this._sizedGeometryFactory());
      this._fillSizedGeometry.X = drawLocation.X;
      this._fillSizedGeometry.Y = drawLocation.Y;
      this._fillSizedGeometry.Width = drawMarginSize.Width;
      this._fillSizedGeometry.Height = drawMarginSize.Height;
      this.Fill.AddGeometryToPaintTask(chart.Canvas, this._fillSizedGeometry);
      chart.Canvas.AddDrawableTask(this.Fill);
    }
    if (this.Stroke != null) {
      this.Stroke.ZIndex = -2;
      this._strokeSizedGeometry ?? (this._strokeSizedGeometry = this._sizedGeometryFactory());
      this._strokeSizedGeometry.X = drawLocation.X;
      this._strokeSizedGeometry.Y = drawLocation.Y;
      this._strokeSizedGeometry.Width = drawMarginSize.Width;
      this._strokeSizedGeometry.Height = drawMarginSize.Height;
      this.Stroke.AddGeometryToPaintTask(chart.Canvas, this._strokeSizedGeometry);
      chart.Canvas.AddDrawableTask(this.Stroke);
    }
    if (!this._isInitialized) {
      if (this._fillSizedGeometry != null) {
        Extensions.TransitionateProperties(this._fillSizedGeometry, "_fillSizedGeometry.X", "_fillSizedGeometry.Y", "_fillSizedGeometry.Width", "_fillSizedGeometry.Height").WithAnimationBuilder((animation) => animation.WithDuration(chart.AnimationsSpeed).WithEasingFunction(chart.EasingFunction)).CompleteCurrentTransitions();
      }
      if (this._strokeSizedGeometry != null) {
        Extensions.TransitionateProperties(this._strokeSizedGeometry, "_fillSizedGeometry.X", "_fillSizedGeometry.Y", "_fillSizedGeometry.Width", "_fillSizedGeometry.Height").WithAnimationBuilder((animation) => animation.WithDuration(chart.AnimationsSpeed).WithEasingFunction(chart.EasingFunction)).CompleteCurrentTransitions();
      }
      this._isInitialized = true;
    }
  }
}
class StrokeAndFillCartesianSeries extends CartesianSeries {
  constructor(properties) {
    super(properties);
    __publicField(this, "_stroke", null);
    __publicField(this, "_fill", null);
  }
  get Stroke() {
    return this._stroke;
  }
  set Stroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._stroke, ($v) => this._stroke = $v), value, true);
  }
  get Fill() {
    return this._fill;
  }
  set Fill(value) {
    this.SetPaintProperty(new System.Ref(() => this._fill, ($v) => this._fill = $v), value);
  }
  GetPaintTasks() {
    return [this._stroke, this._fill, this.hoverPaint, this.DataLabelsPaint];
  }
  MiniatureEquals(series) {
    if (series instanceof StrokeAndFillCartesianSeries) {
      const sfSeries = series;
      return this.Name == series.Name && !this.PaintsChanged && this.Fill == sfSeries.Fill && this.Stroke == sfSeries.Stroke;
    }
    return false;
  }
}
const _LineSeries = class extends StrokeAndFillCartesianSeries {
  constructor(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory, isStacked = false) {
    super(SeriesProperties.Line | SeriesProperties.PrimaryAxisVerticalOrientation | (isStacked ? SeriesProperties.Stacked : 0) | SeriesProperties.Sketch | SeriesProperties.PrefersXStrategyTooltips);
    __publicField(this, "_fillPathHelperDictionary", new System.Dictionary());
    __publicField(this, "_strokePathHelperDictionary", new System.Dictionary());
    __publicField(this, "_lineSmoothness", 0.65);
    __publicField(this, "_geometrySize", 14);
    __publicField(this, "_enableNullSplitting", true);
    __publicField(this, "_geometryFill");
    __publicField(this, "_geometryStroke");
    __publicField(this, "_visualPointFactory");
    __publicField(this, "_pathGeometryFactory");
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    this._visualPointFactory = visualPointFactory;
    this._pathGeometryFactory = pathGeometryFactory;
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this.DataPadding = new LvcPoint(0.5, 1);
  }
  get GeometrySize() {
    return this._geometrySize;
  }
  set GeometrySize(value) {
    this.SetProperty(new System.Ref(() => this._geometrySize, ($v) => this._geometrySize = $v), value);
  }
  get LineSmoothness() {
    return this._lineSmoothness;
  }
  set LineSmoothness(value) {
    let v = value;
    if (value > 1)
      v = 1;
    if (value < 0)
      v = 0;
    this.SetProperty(new System.Ref(() => this._lineSmoothness, ($v) => this._lineSmoothness = $v), v);
  }
  get EnableNullSplitting() {
    return this._enableNullSplitting;
  }
  set EnableNullSplitting(value) {
    this.SetProperty(new System.Ref(() => this._enableNullSplitting, ($v) => this._enableNullSplitting = $v), value);
  }
  get GeometryFill() {
    return this._geometryFill;
  }
  set GeometryFill(value) {
    this.SetPaintProperty(new System.Ref(() => this._geometryFill, ($v) => this._geometryFill = $v), value);
  }
  get GeometryStroke() {
    return this._geometryStroke;
  }
  set GeometryStroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._geometryStroke, ($v) => this._geometryStroke = $v), value, true);
  }
  Invalidate(chart) {
    let strokePathHelperContainer;
    let fillPathHelperContainer;
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let secondaryScale = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
    let primaryScale = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    Extensions.GetActualScaler(secondaryAxis, cartesianChart);
    Extensions.GetActualScaler(primaryAxis, cartesianChart);
    let gs = this._geometrySize;
    let hgs = gs / 2;
    this.Stroke?.StrokeThickness ?? 0;
    let p = primaryScale.ToPixels(this.pivot);
    let segments = this._enableNullSplitting ? Extensions.SplitByNullGaps(this.Fetch(cartesianChart), (point) => this.DeleteNullPoint(point, secondaryScale, primaryScale)) : new System.List().Init([this.Fetch(cartesianChart)]);
    let stacker = (this.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup()) : null;
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (stacker != null) {
      actualZIndex = 1e3 - stacker.Position;
      if (this.Fill != null)
        this.Fill.ZIndex = actualZIndex;
      if (this.Stroke != null)
        this.Stroke.ZIndex = actualZIndex;
    }
    let dls = this.DataLabelsSize;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    if (!this._strokePathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => strokePathHelperContainer, ($v) => strokePathHelperContainer = $v))) {
      strokePathHelperContainer = new System.List();
      this._strokePathHelperDictionary.SetAt(chart.Canvas.Sync, strokePathHelperContainer);
    }
    if (!this._fillPathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => fillPathHelperContainer, ($v) => fillPathHelperContainer = $v))) {
      fillPathHelperContainer = new System.List();
      this._fillPathHelperDictionary.SetAt(chart.Canvas.Sync, fillPathHelperContainer);
    }
    let uwx = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
    uwx = uwx < gs ? gs : uwx;
    let segmentI = 0;
    for (const segment of segments) {
      let fillPath;
      let strokePath;
      let isNew = false;
      if (segmentI >= fillPathHelperContainer.length) {
        isNew = true;
        fillPath = this._pathGeometryFactory();
        fillPath.ClosingMethod = VectorClosingMethod.CloseToPivot;
        fillPathHelperContainer.Add(fillPath);
      } else {
        fillPath = fillPathHelperContainer[segmentI];
      }
      if (segmentI >= strokePathHelperContainer.length) {
        isNew = true;
        strokePath = this._pathGeometryFactory();
        strokePath.ClosingMethod = VectorClosingMethod.NotClosed;
        strokePathHelperContainer.Add(strokePath);
      } else {
        strokePath = strokePathHelperContainer[segmentI];
      }
      let strokeVector = new VectorManager(strokePath);
      let fillVector = new VectorManager(fillPath);
      if (this.Fill != null) {
        this.Fill.AddGeometryToPaintTask(cartesianChart.Canvas, fillPath);
        cartesianChart.Canvas.AddDrawableTask(this.Fill);
        this.Fill.ZIndex = actualZIndex + 0.1;
        this.Fill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        fillPath.Pivot = p;
        if (isNew) {
          Extensions.TransitionateProperties(fillPath, "fillPath.Pivot").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction)).CompleteCurrentTransitions();
        }
      }
      if (this.Stroke != null) {
        this.Stroke.AddGeometryToPaintTask(cartesianChart.Canvas, strokePath);
        cartesianChart.Canvas.AddDrawableTask(this.Stroke);
        this.Stroke.ZIndex = actualZIndex + 0.2;
        this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        strokePath.Pivot = p;
        if (isNew) {
          Extensions.TransitionateProperties(strokePath, "strokePath.Pivot").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction)).CompleteCurrentTransitions();
        }
      }
      let isSegmentEmpty = true;
      for (const data of this.GetSpline(segment, stacker)) {
        isSegmentEmpty = false;
        let s = 0;
        if (stacker != null)
          s = data.TargetPoint.PrimaryValue > 0 ? stacker.GetStack(data.TargetPoint).Start : stacker.GetStack(data.TargetPoint).NegativeStart;
        let visual = data.TargetPoint.Context.Visual;
        if (visual == null) {
          let v = this._visualPointFactory();
          visual = v;
          if (this.IsFirstDraw) {
            v.Geometry.X = secondaryScale.ToPixels(data.TargetPoint.SecondaryValue);
            v.Geometry.Y = p;
            v.Geometry.Width = 0;
            v.Geometry.Height = 0;
            v.Bezier.Xi = secondaryScale.ToPixels(data.X0);
            v.Bezier.Xm = secondaryScale.ToPixels(data.X1);
            v.Bezier.Xj = secondaryScale.ToPixels(data.X2);
            v.Bezier.Yi = p;
            v.Bezier.Ym = p;
            v.Bezier.Yj = p;
          }
          data.TargetPoint.Context.Visual = v;
          this.OnPointCreated(data.TargetPoint);
        }
        this.everFetched.Add(data.TargetPoint);
        this.GeometryFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);
        this.GeometryStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual.Geometry);
        visual.Bezier.Id = data.TargetPoint.Context.Entity.EntityIndex;
        if (this.Fill != null)
          fillVector.AddConsecutiveSegment(visual.Bezier, !this.IsFirstDraw);
        if (this.Stroke != null)
          strokeVector.AddConsecutiveSegment(visual.Bezier, !this.IsFirstDraw);
        visual.Bezier.Xi = secondaryScale.ToPixels(data.X0);
        visual.Bezier.Xm = secondaryScale.ToPixels(data.X1);
        visual.Bezier.Xj = secondaryScale.ToPixels(data.X2);
        visual.Bezier.Yi = primaryScale.ToPixels(data.Y0);
        visual.Bezier.Ym = primaryScale.ToPixels(data.Y1);
        visual.Bezier.Yj = primaryScale.ToPixels(data.Y2);
        let x = secondaryScale.ToPixels(data.TargetPoint.SecondaryValue);
        let y = primaryScale.ToPixels(data.TargetPoint.PrimaryValue + s);
        visual.Geometry.MotionProperties.GetAt("visual.Geometry.X").CopyFrom(visual.Bezier.MotionProperties.GetAt("visual.Bezier.Xj"));
        visual.Geometry.MotionProperties.GetAt("visual.Geometry.Y").CopyFrom(visual.Bezier.MotionProperties.GetAt("visual.Bezier.Yj"));
        visual.Geometry.TranslateTransform = new LvcPoint(-hgs, -hgs);
        visual.Geometry.Width = gs;
        visual.Geometry.Height = gs;
        visual.Geometry.RemoveOnCompleted = false;
        visual.FillPath = fillPath;
        visual.StrokePath = strokePath;
        let ha;
        if (data.TargetPoint.Context.HoverArea instanceof RectangleHoverArea)
          ha = data.TargetPoint.Context.HoverArea;
        else
          data.TargetPoint.Context.HoverArea = ha = new RectangleHoverArea();
        ha.SetDimensions(x - uwx * 0.5, y - hgs, uwx, gs);
        pointsCleanup.Clean(data.TargetPoint);
        if (this.DataLabelsPaint != null) {
          let label = data.TargetPoint.Context.Label;
          if (label == null) {
            let l = this._labelFactory();
            l.X = x - hgs;
            l.Y = p - hgs;
            l.RotateTransform = this.DataLabelsRotation;
            Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
            l.CompleteTransition(null);
            label = l;
            data.TargetPoint.Context.Label = l;
          }
          this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
          label.Text = this.DataLabelsFormatter(new ChartPoint3(data.TargetPoint));
          label.TextSize = dls;
          label.Padding = this.DataLabelsPadding;
          let m = label.Measure(this.DataLabelsPaint);
          let labelPosition = this.GetLabelPosition(x - hgs, y - hgs, gs, gs, m.Clone(), this.DataLabelsPosition, this.SeriesProperties, data.TargetPoint.PrimaryValue > this.Pivot, drawLocation.Clone(), drawMarginSize.Clone());
          if (this.DataLabelsTranslate != null)
            label.TranslateTransform = new LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
          label.X = labelPosition.X;
          label.Y = labelPosition.Y;
        }
        this.OnPointMeasured(data.TargetPoint);
      }
      strokeVector.End();
      fillVector.End();
      if (this.GeometryFill != null) {
        cartesianChart.Canvas.AddDrawableTask(this.GeometryFill);
        this.GeometryFill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        this.GeometryFill.ZIndex = actualZIndex + 0.3;
      }
      if (this.GeometryStroke != null) {
        cartesianChart.Canvas.AddDrawableTask(this.GeometryStroke);
        this.GeometryStroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        this.GeometryStroke.ZIndex = actualZIndex + 0.4;
      }
      if (!isSegmentEmpty)
        segmentI++;
    }
    let maxSegment = fillPathHelperContainer.length > strokePathHelperContainer.length ? fillPathHelperContainer.length : strokePathHelperContainer.length;
    for (let i = maxSegment - 1; i >= segmentI; i--) {
      if (i < fillPathHelperContainer.length) {
        let segmentFill = fillPathHelperContainer[i];
        this.Fill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, segmentFill);
        segmentFill.ClearCommands();
        fillPathHelperContainer.RemoveAt(i);
      }
      if (i < strokePathHelperContainer.length) {
        let segmentStroke = strokePathHelperContainer[i];
        this.Stroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, segmentStroke);
        segmentStroke.ClearCommands();
        strokePathHelperContainer.RemoveAt(i);
      }
    }
    if (this.DataLabelsPaint != null) {
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.5;
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
    this.IsFirstDraw = false;
  }
  GetRequestedGeometrySize() {
    return (this.GeometrySize + (this.GeometryStroke?.StrokeThickness ?? 0)) * 0.5;
  }
  MiniatureEquals(series) {
    if (series instanceof _LineSeries) {
      const lineSeries = series;
      return this.Name == series.Name && !this.PaintsChanged && this.Fill == lineSeries.Fill && this.Stroke == lineSeries.Stroke && this.GeometryFill == lineSeries.GeometryFill && this.GeometryStroke == lineSeries.GeometryStroke;
    }
    return false;
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.GeometryFill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.GeometryFill, this._visualFactory()));
    else if (this.Fill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
    if (this.GeometryStroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.GeometryStroke, this._visualFactory()));
    else if (this.Stroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
  SoftDeleteOrDispose(chart) {
    super.SoftDeleteOrDispose(chart);
    let canvas = chart.CoreCanvas;
    if (this.Fill != null) {
      for (const activeChartContainer of this._fillPathHelperDictionary)
        for (const pathHelper of activeChartContainer.Value)
          this.Fill.RemoveGeometryFromPainTask(canvas, pathHelper);
    }
    if (this.Stroke != null) {
      for (const activeChartContainer of this._strokePathHelperDictionary)
        for (const pathHelper of activeChartContainer.Value)
          this.Stroke.RemoveGeometryFromPainTask(canvas, pathHelper);
    }
    if (this.GeometryFill != null)
      canvas.RemovePaintTask(this.GeometryFill);
    if (this.GeometryStroke != null)
      canvas.RemovePaintTask(this.GeometryStroke);
  }
  RemoveFromUI(chart) {
    super.RemoveFromUI(chart);
    this._fillPathHelperDictionary.Remove(chart.Canvas.Sync);
    this._strokePathHelperDictionary.Remove(chart.Canvas.Sync);
  }
  GetPaintTasks() {
    return [this.Stroke, this.Fill, this._geometryFill, this._geometryStroke, this.DataLabelsPaint, this.hoverPaint];
  }
  GetSpline(points, stacker) {
    const _$generator = function* (points2, stacker2) {
      for (const item of Extensions.AsSplineData(points2)) {
        if (item.IsFirst) {
          let c = item.Current;
          let sc = (item.Current.PrimaryValue > 0 ? stacker2?.GetStack(c).Start : stacker2?.GetStack(c).NegativeStart) ?? 0;
          yield new BezierData(item.Next).Init({
            X0: c.SecondaryValue,
            Y0: c.PrimaryValue + sc,
            X1: c.SecondaryValue,
            Y1: c.PrimaryValue + sc,
            X2: c.SecondaryValue,
            Y2: c.PrimaryValue + sc
          });
          continue;
        }
        let pys = 0;
        let cys = 0;
        let nys = 0;
        let nnys = 0;
        if (stacker2 != null) {
          pys = item.Previous.PrimaryValue > 0 ? stacker2.GetStack(item.Previous).Start : stacker2.GetStack(item.Previous).NegativeStart;
          cys = item.Current.PrimaryValue > 0 ? stacker2.GetStack(item.Current).Start : stacker2.GetStack(item.Current).NegativeStart;
          nys = item.Next.PrimaryValue > 0 ? stacker2.GetStack(item.Next).Start : stacker2.GetStack(item.Next).NegativeStart;
          nnys = item.AfterNext.PrimaryValue > 0 ? stacker2.GetStack(item.AfterNext).Start : stacker2.GetStack(item.AfterNext).NegativeStart;
        }
        let xc1 = (item.Previous.SecondaryValue + item.Current.SecondaryValue) / 2;
        let yc1 = (item.Previous.PrimaryValue + pys + item.Current.PrimaryValue + cys) / 2;
        let xc2 = (item.Current.SecondaryValue + item.Next.SecondaryValue) / 2;
        let yc2 = (item.Current.PrimaryValue + cys + item.Next.PrimaryValue + nys) / 2;
        let xc3 = (item.Next.SecondaryValue + item.AfterNext.SecondaryValue) / 2;
        let yc3 = (item.Next.PrimaryValue + nys + item.AfterNext.PrimaryValue + nnys) / 2;
        let len1 = Math.sqrt((item.Current.SecondaryValue - item.Previous.SecondaryValue) * (item.Current.SecondaryValue - item.Previous.SecondaryValue) + (item.Current.PrimaryValue + cys - item.Previous.PrimaryValue + pys) * (item.Current.PrimaryValue + cys - item.Previous.PrimaryValue + pys));
        let len2 = Math.sqrt((item.Next.SecondaryValue - item.Current.SecondaryValue) * (item.Next.SecondaryValue - item.Current.SecondaryValue) + (item.Next.PrimaryValue + nys - item.Current.PrimaryValue + cys) * (item.Next.PrimaryValue + nys - item.Current.PrimaryValue + cys));
        let len3 = Math.sqrt((item.AfterNext.SecondaryValue - item.Next.SecondaryValue) * (item.AfterNext.SecondaryValue - item.Next.SecondaryValue) + (item.AfterNext.PrimaryValue + nnys - item.Next.PrimaryValue + nys) * (item.AfterNext.PrimaryValue + nnys - item.Next.PrimaryValue + nys));
        let k1 = len1 / (len1 + len2);
        let k2 = len2 / (len2 + len3);
        if (Number.isNaN(k1))
          k1 = 0;
        if (Number.isNaN(k2))
          k2 = 0;
        let xm1 = xc1 + (xc2 - xc1) * k1;
        let ym1 = yc1 + (yc2 - yc1) * k1;
        let xm2 = xc2 + (xc3 - xc2) * k2;
        let ym2 = yc2 + (yc3 - yc2) * k2;
        let c1X = xm1 + (xc2 - xm1) * this._lineSmoothness + item.Current.SecondaryValue - xm1;
        let c1Y = ym1 + (yc2 - ym1) * this._lineSmoothness + item.Current.PrimaryValue + cys - ym1;
        let c2X = xm2 + (xc2 - xm2) * this._lineSmoothness + item.Next.SecondaryValue - xm2;
        let c2Y = ym2 + (yc2 - ym2) * this._lineSmoothness + item.Next.PrimaryValue + nys - ym2;
        yield new BezierData(item.Next).Init({
          X0: c1X,
          Y0: c1Y,
          X1: c2X,
          Y1: c2Y,
          X2: item.Next.SecondaryValue,
          Y2: item.Next.PrimaryValue + nys
        });
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(points, stacker));
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual.Geometry, "visual.Geometry.X", "visual.Geometry.Y", "visual.Geometry.Width", "visual.Geometry.Height", "visual.Geometry.TranslateTransform").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
    Extensions.TransitionateProperties(visual.Bezier, "visual.Bezier.Xi", "visual.Bezier.Yi", "visual.Bezier.Xm", "visual.Bezier.Ym", "visual.Bezier.Xj", "visual.Bezier.Yj").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let x = secondaryScale.ToPixels(point.SecondaryValue);
    let y = primaryScale.ToPixels(point.PrimaryValue);
    visual.Geometry.X = x;
    visual.Geometry.Y = y;
    visual.Geometry.Height = 0;
    visual.Geometry.Width = 0;
    visual.Geometry.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
  DeleteNullPoint(point, xScale, yScale) {
    let visual;
    if (point.Context.Visual instanceof BezierVisualPoint)
      visual = point.Context.Visual;
    else
      return;
    let x = xScale.ToPixels(point.SecondaryValue);
    let y = yScale.ToPixels(point.PrimaryValue);
    let gs = this._geometrySize;
    let hgs = gs / 2;
    visual.Geometry.X = x - hgs;
    visual.Geometry.Y = y - hgs;
    visual.Geometry.Width = gs;
    visual.Geometry.Height = gs;
    visual.Geometry.RemoveOnCompleted = true;
    point.Context.Visual = null;
  }
};
let LineSeries = _LineSeries;
__publicField(LineSeries, "SplineData", class {
  constructor(start) {
    __publicField(this, "Previous");
    __publicField(this, "Current");
    __publicField(this, "Next");
    __publicField(this, "AfterNext");
    __publicField(this, "IsFirst", true);
    this.Previous = start;
    this.Current = start;
    this.Next = start;
    this.AfterNext = start;
  }
  GoNext(point) {
    this.Previous = this.Current;
    this.Current = this.Next;
    this.Next = this.AfterNext;
    this.AfterNext = point;
  }
});
class BarSeries extends StrokeAndFillCartesianSeries {
  constructor(properties, visualFactory, labelFactory) {
    super(properties);
    __publicField(this, "_pading", 5);
    __publicField(this, "_maxBarWidth", 50);
    __publicField(this, "_ignoresBarPosition", false);
    __publicField(this, "_rx", 0);
    __publicField(this, "_ry", 0);
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
  }
  get Padding() {
    return this._pading;
  }
  set Padding(value) {
    this.SetProperty(new System.Ref(() => this._pading, ($v) => this._pading = $v), value);
  }
  get MaxBarWidth() {
    return this._maxBarWidth;
  }
  set MaxBarWidth(value) {
    this.SetProperty(new System.Ref(() => this._maxBarWidth, ($v) => this._maxBarWidth = $v), value);
  }
  get IgnoresBarPosition() {
    return this._ignoresBarPosition;
  }
  set IgnoresBarPosition(value) {
    this.SetProperty(new System.Ref(() => this._ignoresBarPosition, ($v) => this._ignoresBarPosition = $v), value);
  }
  get Rx() {
    return this._rx;
  }
  set Rx(value) {
    this.SetProperty(new System.Ref(() => this._rx, ($v) => this._rx = $v), value);
  }
  get Ry() {
    return this._ry;
  }
  set Ry(value) {
    this.SetProperty(new System.Ref(() => this._ry, ($v) => this._ry = $v), value);
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.Fill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
    if (this.Stroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
}
__publicField(BarSeries, "MeasureHelper", class {
  constructor(scaler, cartesianChart, barSeries, axis, p, minP, maxP, isStacked) {
    __publicField(this, "uw", 0);
    __publicField(this, "uwm", 0);
    __publicField(this, "cp", 0);
    __publicField(this, "p", 0);
    __publicField(this, "actualUw", 0);
    this.p = p;
    if (p < minP)
      this.p = minP;
    if (p > maxP)
      this.p = maxP;
    this.uw = scaler.MeasureInPixels(axis.UnitWidth);
    this.actualUw = this.uw;
    let gp = barSeries.Padding;
    if (this.uw - gp < 1)
      gp -= this.uw - gp;
    this.uw -= gp;
    this.uwm = 0.5 * this.uw;
    let pos = 0;
    let count = 0;
    if (isStacked) {
      pos = cartesianChart.SeriesContext.GetStackedColumnPostion(barSeries);
      count = cartesianChart.SeriesContext.GetStackedColumnSeriesCount();
    } else {
      pos = cartesianChart.SeriesContext.GetColumnPostion(barSeries);
      count = cartesianChart.SeriesContext.GetColumnSeriesCount();
    }
    this.cp = 0;
    let padding = barSeries.Padding;
    this.uw /= count;
    let mw = barSeries.MaxBarWidth;
    if (this.uw > mw)
      this.uw = mw;
    this.uwm = 0.5 * this.uw;
    this.cp = barSeries.IgnoresBarPosition ? 0 : (pos - count / 2) * this.uw + this.uwm;
    this.uw -= padding;
    this.cp += padding * 0.5;
    if (this.uw < 1) {
      this.uw = 1;
      this.uwm = 0.5;
    }
  }
});
class HeatFunctions {
  static BuildColorStops(heatMap, colorStops) {
    if (heatMap.length < 2)
      throw new System.Exception("At least 2 colors are required in a heat map.");
    if (colorStops == null) {
      let s = 1 / (heatMap.length - 1);
      colorStops = new Float64Array(heatMap.length);
      let x = 0;
      for (let i = 0; i < heatMap.length; i++) {
        colorStops[i] = x;
        x += s;
      }
    }
    if (colorStops.length != heatMap.length)
      throw new System.Exception(`ColorStops and HeatMap must have the same length.`);
    let heatStops = new System.List();
    for (let i = 0; i < colorStops.length; i++) {
      heatStops.Add(new ColorStop(colorStops[i], heatMap[i].Clone()));
    }
    return heatStops;
  }
  static InterpolateColor(weight, weightBounds, heatMap, heatStops) {
    let range = weightBounds.Max - weightBounds.Min;
    if (range == 0)
      range = Number.EPSILON;
    let p = (weight - weightBounds.Min) / range;
    if (p < 0)
      p = 0;
    if (p > 1)
      p = 1;
    let previous = heatStops[0];
    for (let i = 1; i < heatStops.length; i++) {
      let next = heatStops[i];
      if (next.Value < p) {
        previous = heatStops[i];
        continue;
      }
      let px = (p - previous.Value) / (next.Value - previous.Value);
      return LvcColor.FromArgb(Math.floor(previous.Color.A + px * (next.Color.A - previous.Color.A)) & 255, Math.floor(previous.Color.R + px * (next.Color.R - previous.Color.R)) & 255, Math.floor(previous.Color.G + px * (next.Color.G - previous.Color.G)) & 255, Math.floor(previous.Color.B + px * (next.Color.B - previous.Color.B)) & 255);
    }
    return heatMap[heatMap.length - 1];
  }
}
class StackedAreaSeries extends LineSeries {
  constructor(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory) {
    super(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory, true);
    this.GeometryFill = null;
    this.GeometryStroke = null;
    this.GeometrySize = 0;
  }
}
const _LiveCharts = class {
  static get IsConfigured() {
    return __privateGet(_LiveCharts, _IsConfigured);
  }
  static set IsConfigured(value) {
    __privateSet(_LiveCharts, _IsConfigured, value);
  }
  static get DefaultSettings() {
    return new LiveChartsSettings();
  }
  static get HoverKey() {
    return "HoverKey";
  }
  static get TangentAngle() {
    return 1 << 25;
  }
  static get CotangentAngle() {
    return 1 << 26;
  }
  static Configure(configuration) {
    if (configuration == null)
      throw new System.Exception(`${"LiveChartsSettings"} must not be null.`);
    _LiveCharts.IsConfigured = true;
    configuration(_LiveCharts.DefaultSettings);
  }
};
let LiveCharts = _LiveCharts;
_IsConfigured = new WeakMap();
__publicField(LiveCharts, "EnableLogging", false);
__publicField(LiveCharts, "s_defaultPaintTask", {});
__privateAdd(LiveCharts, _IsConfigured, false);
__publicField(LiveCharts, "DisableAnimations", System.TimeSpan.FromMilliseconds(1));
class StackedRowSeries extends RowSeries {
  constructor(visualFactory, labelFactory) {
    super(visualFactory, labelFactory, true);
    __publicField(this, "_stackGroup", 0);
  }
  get StackGroup() {
    return this._stackGroup;
  }
  set StackGroup(value) {
    this._stackGroup = value;
    this.OnPropertyChanged();
  }
  GetStackGroup() {
    return this._stackGroup;
  }
}
class EasingFunctions {
  static get BackIn() {
    return (t) => BackEasingFunction.In(t);
  }
  static get BackOut() {
    return (t) => BackEasingFunction.Out(t);
  }
  static get BackInOut() {
    return (t) => BackEasingFunction.InOut(t);
  }
  static get BounceIn() {
    return BounceEasingFunction.In;
  }
  static get BounceOut() {
    return BounceEasingFunction.Out;
  }
  static get BounceInOut() {
    return BounceEasingFunction.InOut;
  }
  static get CircleIn() {
    return CircleEasingFunction.In;
  }
  static get CircleOut() {
    return CircleEasingFunction.Out;
  }
  static get CircleInOut() {
    return CircleEasingFunction.InOut;
  }
  static get CubicIn() {
    return CubicEasingFunction.In;
  }
  static get CubicOut() {
    return CubicEasingFunction.Out;
  }
  static get CubicInOut() {
    return CubicEasingFunction.InOut;
  }
  static get Ease() {
    return EasingFunctions.BuildCubicBezier(0.25, 0.1, 0.25, 1);
  }
  static get EaseIn() {
    return EasingFunctions.BuildCubicBezier(0.42, 0, 1, 1);
  }
  static get EaseOut() {
    return EasingFunctions.BuildCubicBezier(0, 0, 0.58, 1);
  }
  static get EaseInOut() {
    return EasingFunctions.BuildCubicBezier(0.42, 0, 0.58, 1);
  }
  static get ElasticIn() {
    return (t) => ElasticEasingFunction.In(t);
  }
  static get ElasticOut() {
    return (t) => ElasticEasingFunction.Out(t);
  }
  static get ElasticInOut() {
    return (t) => ElasticEasingFunction.InOut(t);
  }
  static get ExponentialIn() {
    return ExponentialEasingFunction.In;
  }
  static get ExponentialOut() {
    return ExponentialEasingFunction.Out;
  }
  static get ExponentialInOut() {
    return ExponentialEasingFunction.InOut;
  }
  static get Lineal() {
    return (t) => t;
  }
  static get PolinominalIn() {
    return (t) => PolinominalEasingFunction.In(t);
  }
  static get PolinominalOut() {
    return (t) => PolinominalEasingFunction.Out(t);
  }
  static get PolinominalInOut() {
    return (t) => PolinominalEasingFunction.InOut(t);
  }
  static get QuadraticIn() {
    return (t) => t * t;
  }
  static get QuadraticOut() {
    return (t) => t * (2 - t);
  }
  static get QuadraticInOut() {
    return (t) => ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
  }
  static get SinIn() {
    return (t) => +t == 1 ? 1 : 1 - Math.cos(t * Math.PI / 2);
  }
  static get SinOut() {
    return (t) => Math.sin(t * Math.PI / 2);
  }
  static get SinInOut() {
    return (t) => (1 - Math.cos(Math.PI * t)) / 2;
  }
  static get BuildFunctionUsingKeyFrames() {
    return (keyFrames) => {
      if (keyFrames.length < 2)
        throw new System.Exception("At least 2 key frames are required.");
      if (keyFrames[keyFrames.length - 1].Time < 1) {
        let newKeyFrames = new System.List(keyFrames).Init([
          new KeyFrame().Init({
            Time: 1,
            Value: keyFrames[keyFrames.length - 1].Value
          })
        ]);
        keyFrames = newKeyFrames.ToArray();
      }
      return (t) => {
        let i = 0;
        let current = keyFrames[i];
        let next = keyFrames[i + 1];
        while (next.Time < t && i < keyFrames.length - 2) {
          i++;
          current = keyFrames[i];
          next = keyFrames[i + 1];
        }
        let dt = next.Time - current.Time;
        let dv = next.Value - current.Value;
        let p = (t - current.Time) / dt;
        return current.Value + next.EasingFunction(p) * dv;
      };
    };
  }
  static get BuildCustomBackIn() {
    return (overshoot) => (t) => BackEasingFunction.In(t, overshoot);
  }
  static get BuildCustomBackOut() {
    return (overshoot) => (t) => BackEasingFunction.Out(t, overshoot);
  }
  static get BuildCustomBackInOut() {
    return (overshoot) => (t) => BackEasingFunction.InOut(t, overshoot);
  }
  static get BuildCustomElasticIn() {
    return (amplitude, period) => (t) => ElasticEasingFunction.In(t, amplitude, period);
  }
  static get BuildCustomElasticOut() {
    return (amplitude, period) => (t) => ElasticEasingFunction.Out(t, amplitude, period);
  }
  static get BuildCustomElasticInOut() {
    return (amplitude, period) => (t) => ElasticEasingFunction.InOut(t, amplitude, period);
  }
  static get BuildCustomPolinominalIn() {
    return (exponent) => (t) => PolinominalEasingFunction.In(t, exponent);
  }
  static get BuildCustomPolinominalOut() {
    return (exponent) => (t) => PolinominalEasingFunction.Out(t, exponent);
  }
  static get BuildCustomPolinominalInOut() {
    return (exponent) => (t) => PolinominalEasingFunction.InOut(t, exponent);
  }
  static get BuildCubicBezier() {
    return (mX1, mY1, mX2, mY2) => CubicBezierEasingFunction.BuildBezierEasingFunction(mX1, mY1, mX2, mY2);
  }
}
class ScatterSeries extends StrokeAndFillCartesianSeries {
  constructor(visualFactory, labelFactory) {
    super(SeriesProperties.Scatter | SeriesProperties.Solid | SeriesProperties.PrefersXYStrategyTooltips);
    __publicField(this, "_weightBounds", new Bounds());
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    __publicField(this, "MinGeometrySize", 6);
    __publicField(this, "GeometrySize", 24);
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this.DataPadding = new LvcPoint(1, 1);
    this.DataLabelsFormatter = (point) => `${point.SecondaryValue}, ${point.PrimaryValue}`;
    this.TooltipLabelFormatter = (point) => `${point.Context.Series.Name} ${point.SecondaryValue}, ${point.PrimaryValue}`;
  }
  Invalidate(chart) {
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let xScale = Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), secondaryAxis);
    let yScale = Scaler.Make(drawLocation.Clone(), drawMarginSize.Clone(), primaryAxis);
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (this.Fill != null) {
      this.Fill.ZIndex = actualZIndex + 0.1;
      this.Fill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.Fill);
    }
    if (this.Stroke != null) {
      this.Stroke.ZIndex = actualZIndex + 0.2;
      this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.Stroke);
    }
    if (this.DataLabelsPaint != null) {
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
    }
    let dls = this.DataLabelsSize;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    let gs = this.GeometrySize;
    let hgs = gs / 2;
    this.Stroke?.StrokeThickness ?? 0;
    let requiresWScale = this._weightBounds.Max - this._weightBounds.Min > 0;
    let wm = -(this.GeometrySize - this.MinGeometrySize) / (this._weightBounds.Max - this._weightBounds.Min);
    let uwx = xScale.MeasureInPixels(secondaryAxis.UnitWidth);
    let uwy = yScale.MeasureInPixels(secondaryAxis.UnitWidth);
    uwx = uwx < gs ? gs : uwx;
    uwy = uwy < gs ? gs : uwy;
    for (const point of this.Fetch(cartesianChart)) {
      let visual = point.Context.Visual;
      let x = xScale.ToPixels(point.SecondaryValue);
      let y = yScale.ToPixels(point.PrimaryValue);
      if (point.IsEmpty) {
        if (visual != null) {
          visual.X = x - hgs;
          visual.Y = y - hgs;
          visual.Width = 0;
          visual.Height = 0;
          visual.RemoveOnCompleted = true;
          point.Context.Visual = null;
        }
        continue;
      }
      if (requiresWScale) {
        gs = wm * (this._weightBounds.Max - point.TertiaryValue) + this.GeometrySize;
        hgs = gs / 2;
      }
      if (visual == null) {
        let r = this._visualFactory();
        r.X = x;
        r.Y = y;
        r.Width = 0;
        r.Height = 0;
        visual = r;
        point.Context.Visual = visual;
        this.OnPointCreated(point);
        this.everFetched.Add(point);
      }
      this.Fill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      this.Stroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      let sizedGeometry = visual;
      sizedGeometry.X = x - hgs;
      sizedGeometry.Y = y - hgs;
      sizedGeometry.Width = gs;
      sizedGeometry.Height = gs;
      sizedGeometry.RemoveOnCompleted = false;
      let ha;
      if (point.Context.HoverArea instanceof RectangleHoverArea)
        ha = point.Context.HoverArea;
      else
        point.Context.HoverArea = ha = new RectangleHoverArea();
      ha.SetDimensions(x - uwx * 0.5, y - uwy * 0.5, uwx, uwy);
      pointsCleanup.Clean(point);
      if (this.DataLabelsPaint != null) {
        let label;
        if (IsInterfaceOfILabelGeometry(point.Context.Label))
          label = point.Context.Label;
        else {
          let l = this._labelFactory();
          l.X = x - hgs;
          l.Y = y - hgs;
          l.RotateTransform = this.DataLabelsRotation;
          Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
          l.CompleteTransition(null);
          label = l;
          point.Context.Label = l;
        }
        this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
        label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
        label.TextSize = dls;
        label.Padding = this.DataLabelsPadding;
        let m = label.Measure(this.DataLabelsPaint);
        let labelPosition = this.GetLabelPosition(x - hgs, y - hgs, gs, gs, m.Clone(), this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > 0, drawLocation.Clone(), drawMarginSize.Clone());
        if (this.DataLabelsTranslate != null)
          label.TranslateTransform = new LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
        label.X = labelPosition.X;
        label.Y = labelPosition.Y;
      }
      this.OnPointMeasured(point);
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, yScale, xScale, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetBounds(chart, secondaryAxis, primaryAxis) {
    let seriesBounds = super.GetBounds(chart, secondaryAxis, primaryAxis);
    this._weightBounds = seriesBounds.Bounds.TertiaryBounds;
    return seriesBounds;
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.Fill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
    if (this.Stroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
  SetDefaultPointTransitions(chartPoint) {
    let visual = chartPoint.Context.Visual;
    let chart = chartPoint.Context.Chart;
    if (visual == null)
      throw new System.Exception("Unable to initialize the point instance.");
    Extensions.TransitionateProperties(visual, "visual.X", "visual.Y", "visual.Width", "visual.Height").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let chartView = point.Context.Chart;
    if (chartView.Core.IsZoomingOrPanning) {
      visual.CompleteTransition(null);
      visual.RemoveOnCompleted = true;
      this.DataFactory.DisposePoint(point);
      return;
    }
    let x = secondaryScale.ToPixels(point.SecondaryValue);
    let y = primaryScale.ToPixels(point.PrimaryValue);
    visual.X = x;
    visual.Y = y;
    visual.Height = 0;
    visual.Width = 0;
    visual.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
}
class HeatSeries extends CartesianSeries {
  constructor(visualFactory, labelFactory) {
    super(SeriesProperties.Heat | SeriesProperties.PrimaryAxisVerticalOrientation | SeriesProperties.Solid | SeriesProperties.PrefersXYStrategyTooltips);
    __publicField(this, "_paintTaks");
    __publicField(this, "_weightBounds", new Bounds());
    __publicField(this, "_heatKnownLength", 0);
    __publicField(this, "_heatStops", new System.List());
    __publicField(this, "_heatMap", [
      LvcColor.FromArgb(255, 87, 103, 222),
      LvcColor.FromArgb(255, 95, 207, 249)
    ]);
    __publicField(this, "_colorStops");
    __publicField(this, "_pointPadding", Padding.All(4));
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this.DataPadding = new LvcPoint(0, 0);
    this.TooltipLabelFormatter = (point) => `${this.Name}: ${point.TertiaryValue}`;
  }
  get HeatMap() {
    return this._heatMap;
  }
  set HeatMap(value) {
    this.OnMiniatureChanged();
    this.SetProperty(new System.Ref(() => this._heatMap, ($v) => this._heatMap = $v), value);
  }
  get ColorStops() {
    return this._colorStops;
  }
  set ColorStops(value) {
    this.SetProperty(new System.Ref(() => this._colorStops, ($v) => this._colorStops = $v), value);
  }
  get PointPadding() {
    return this._pointPadding;
  }
  set PointPadding(value) {
    this.SetProperty(new System.Ref(() => this._pointPadding, ($v) => this._pointPadding = $v), value);
  }
  Invalidate(chart) {
    this._paintTaks ?? (this._paintTaks = LiveCharts.DefaultSettings.GetProvider().GetSolidColorPaint());
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let secondaryScale = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
    let primaryScale = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    let previousPrimaryScale = Extensions.GetActualScaler(primaryAxis, cartesianChart);
    let previousSecondaryScale = Extensions.GetActualScaler(secondaryAxis, cartesianChart);
    let uws = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
    let uwp = primaryScale.MeasureInPixels(primaryAxis.UnitWidth);
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (this._paintTaks != null) {
      this._paintTaks.ZIndex = actualZIndex + 0.2;
      this._paintTaks.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this._paintTaks);
    }
    if (this.DataLabelsPaint != null) {
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
    }
    let dls = this.DataLabelsSize;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    let p = this.PointPadding;
    if (this._heatKnownLength != this.HeatMap.length) {
      this._heatStops = HeatFunctions.BuildColorStops(this.HeatMap, this.ColorStops);
      this._heatKnownLength = this.HeatMap.length;
    }
    for (const point of this.Fetch(cartesianChart)) {
      let visual = point.Context.Visual;
      let primary = primaryScale.ToPixels(point.PrimaryValue);
      let secondary = secondaryScale.ToPixels(point.SecondaryValue);
      let tertiary = point.TertiaryValue;
      let baseColor = HeatFunctions.InterpolateColor(tertiary, this._weightBounds, this.HeatMap, this._heatStops);
      if (point.IsEmpty) {
        if (visual != null) {
          visual.X = secondary - uws * 0.5;
          visual.Y = primary - uwp * 0.5;
          visual.Width = uws;
          visual.Height = uwp;
          visual.RemoveOnCompleted = true;
          visual.Color = LvcColor.FromColorWithAlpha(0, visual.Color.Clone());
          point.Context.Visual = null;
        }
        continue;
      }
      if (visual == null) {
        let xi = secondary - uws * 0.5;
        let yi = primary - uwp * 0.5;
        if (previousSecondaryScale != null && previousPrimaryScale != null) {
          let previousP = previousPrimaryScale.ToPixels(this.pivot);
          let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
          let bp = Math.abs(previousPrimary - previousP);
          point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;
          xi = previousSecondaryScale.ToPixels(point.SecondaryValue) - uws * 0.5;
          yi = previousPrimaryScale.ToPixels(point.PrimaryValue) - uwp * 0.5;
        }
        let r = this._visualFactory();
        r.X = xi + p.Left;
        r.Y = yi + p.Top;
        r.Width = uws - p.Left - p.Right;
        r.Height = uwp - p.Top - p.Bottom;
        r.Color = LvcColor.FromArgb(0, baseColor.R, baseColor.G, baseColor.B);
        visual = r;
        point.Context.Visual = visual;
        this.OnPointCreated(point);
        this.everFetched.Add(point);
      }
      this._paintTaks?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      visual.X = secondary - uws * 0.5 + p.Left;
      visual.Y = primary - uwp * 0.5 + p.Top;
      visual.Width = uws - p.Left - p.Right;
      visual.Height = uwp - p.Top - p.Bottom;
      visual.Color = LvcColor.FromArgb(baseColor.A, baseColor.R, baseColor.G, baseColor.B);
      visual.RemoveOnCompleted = false;
      let ha;
      if (point.Context.HoverArea instanceof RectangleHoverArea)
        ha = point.Context.HoverArea;
      else
        point.Context.HoverArea = ha = new RectangleHoverArea();
      ha.SetDimensions(secondary - uws * 0.5, primary - uwp * 0.5, uws, uwp);
      pointsCleanup.Clean(point);
      if (this.DataLabelsPaint != null) {
        let label = point.Context.Label;
        if (label == null) {
          let l = this._labelFactory();
          l.X = secondary - uws * 0.5;
          l.Y = primary - uws * 0.5;
          l.RotateTransform = this.DataLabelsRotation;
          Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
          l.CompleteTransition(null);
          label = l;
          point.Context.Label = l;
        }
        this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
        label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
        label.TextSize = dls;
        label.Padding = this.DataLabelsPadding;
        let labelPosition = this.GetLabelPosition(secondary, primary, uws, uws, label.Measure(this.DataLabelsPaint), this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > this.Pivot, drawLocation.Clone(), drawMarginSize.Clone());
        label.X = labelPosition.X;
        label.Y = labelPosition.Y;
      }
      this.OnPointMeasured(point);
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetBounds(chart, secondaryAxis, primaryAxis) {
    let seriesBounds = super.GetBounds(chart, secondaryAxis, primaryAxis);
    this._weightBounds = seriesBounds.Bounds.TertiaryBounds;
    return seriesBounds;
  }
  GetRequestedSecondaryOffset() {
    return 0.5;
  }
  GetRequestedPrimaryOffset() {
    return 0.5;
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual, "visual.X", "visual.Width", "visual.Y", "visual.Height", "visual.Color").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let chartView = point.Context.Chart;
    if (chartView.Core.IsZoomingOrPanning) {
      visual.CompleteTransition(null);
      visual.RemoveOnCompleted = true;
      this.DataFactory.DisposePoint(point);
      return;
    }
    visual.Color = LvcColor.FromColorWithAlpha(255, visual.Color.Clone());
    visual.RemoveOnCompleted = true;
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    let strokeClone = LiveCharts.DefaultSettings.GetProvider().GetSolidColorPaint();
    let st = strokeClone.StrokeThickness;
    if (st > Series.MAX_MINIATURE_STROKE_WIDTH) {
      st = Series.MAX_MINIATURE_STROKE_WIDTH;
      strokeClone.StrokeThickness = Series.MAX_MINIATURE_STROKE_WIDTH;
    }
    let visual = this._visualFactory();
    visual.X = st * 0.5;
    visual.Y = st * 0.5;
    visual.Height = this.MiniatureShapeSize;
    visual.Width = this.MiniatureShapeSize;
    visual.Color = this.HeatMap[0].Clone();
    strokeClone.ZIndex = 1;
    schedules.Add(new PaintSchedule(strokeClone, visual));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
  MiniatureEquals(instance) {
    if (instance instanceof HeatSeries) {
      const hSeries = instance;
      return this.Name == instance.Name && this.HeatMap == hSeries.HeatMap;
    }
    return false;
  }
  GetPaintTasks() {
    return [this._paintTaks, this.hoverPaint];
  }
}
class ColorStop {
  constructor(value, color) {
    __publicField(this, "Value");
    __publicField(this, "Color");
    this.Value = value;
    this.Color = color.Clone();
  }
}
class StackedStepAreaSeries extends StepLineSeries {
  constructor(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory) {
    super(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory, true);
    this.GeometryFill = null;
    this.GeometryStroke = null;
    this.GeometrySize = 0;
  }
}
class ColumnSeries extends BarSeries {
  constructor(visualFactory, labelFactory, isStacked = false) {
    super(SeriesProperties.Bar | SeriesProperties.PrimaryAxisVerticalOrientation | SeriesProperties.Solid | SeriesProperties.PrefersXStrategyTooltips | (isStacked ? SeriesProperties.Stacked : 0), visualFactory, labelFactory);
    this.DataPadding = new LvcPoint(0, 1);
  }
  Invalidate(chart) {
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let secondaryScale = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
    let primaryScale = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    let previousPrimaryScale = Extensions.GetActualScaler(primaryAxis, cartesianChart);
    let previousSecondaryScale = Extensions.GetActualScaler(secondaryAxis, cartesianChart);
    let isStacked = (this.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked;
    let helper = new BarSeries.MeasureHelper(secondaryScale, cartesianChart, this, secondaryAxis, primaryScale.ToPixels(this.pivot), cartesianChart.DrawMarginLocation.Y, cartesianChart.DrawMarginLocation.Y + cartesianChart.DrawMarginSize.Height, isStacked);
    let pHelper = previousSecondaryScale == null || previousPrimaryScale == null ? null : new BarSeries.MeasureHelper(previousSecondaryScale, cartesianChart, this, secondaryAxis, previousPrimaryScale.ToPixels(this.pivot), cartesianChart.DrawMarginLocation.Y, cartesianChart.DrawMarginLocation.Y + cartesianChart.DrawMarginSize.Height, isStacked);
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (this.Fill != null) {
      this.Fill.ZIndex = actualZIndex + 0.1;
      this.Fill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.Fill);
    }
    if (this.Stroke != null) {
      this.Stroke.ZIndex = actualZIndex + 0.2;
      this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.Stroke);
    }
    if (this.DataLabelsPaint != null) {
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
    }
    let dls = this.DataLabelsSize;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    let rx = this.Rx;
    let ry = this.Ry;
    let stacker = isStacked ? cartesianChart.SeriesContext.GetStackPosition(this, this.GetStackGroup()) : null;
    for (const point of this.Fetch(cartesianChart)) {
      let visual = point.Context.Visual;
      let primary = primaryScale.ToPixels(point.PrimaryValue);
      let secondary = secondaryScale.ToPixels(point.SecondaryValue);
      let b = Math.abs(primary - helper.p);
      if (point.IsEmpty) {
        if (visual != null) {
          visual.X = secondary - helper.uwm + helper.cp;
          visual.Y = helper.p;
          visual.Width = helper.uw;
          visual.Height = 0;
          visual.RemoveOnCompleted = true;
          point.Context.Visual = null;
        }
        continue;
      }
      if (visual == null) {
        let xi = secondary - helper.uwm + helper.cp;
        let pi = helper.p;
        let uwi = helper.uw;
        let hi = 0;
        if (previousSecondaryScale != null && previousPrimaryScale != null && pHelper != null) {
          let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
          let bp = Math.abs(previousPrimary - pHelper.p);
          let cyp = point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;
          xi = previousSecondaryScale.ToPixels(point.SecondaryValue) - pHelper.uwm + pHelper.cp;
          pi = cartesianChart.IsZoomingOrPanning ? cyp : pHelper.p;
          uwi = pHelper.uw;
          hi = cartesianChart.IsZoomingOrPanning ? bp : 0;
        }
        let r = this._visualFactory();
        r.X = xi;
        r.Y = pi;
        r.Width = uwi;
        r.Height = hi;
        if (IsInterfaceOfIRoundedRectangleChartPoint(r)) {
          const rr1 = r;
          rr1.Rx = rx;
          rr1.Ry = ry;
        }
        visual = r;
        point.Context.Visual = visual;
        this.OnPointCreated(point);
        this.everFetched.Add(point);
      }
      this.Fill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      this.Stroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
      let cy = primaryAxis.IsInverted ? point.PrimaryValue > this.pivot ? primary - b : primary : point.PrimaryValue > this.pivot ? primary : primary - b;
      let x = secondary - helper.uwm + helper.cp;
      if (stacker != null) {
        let sy = stacker.GetStack(point);
        let primaryI = 0;
        let primaryJ = 0;
        if (point.PrimaryValue >= 0) {
          primaryI = primaryScale.ToPixels(sy.Start);
          primaryJ = primaryScale.ToPixels(sy.End);
        } else {
          primaryI = primaryScale.ToPixels(sy.NegativeStart);
          primaryJ = primaryScale.ToPixels(sy.NegativeEnd);
        }
        cy = primaryJ;
        b = primaryI - primaryJ;
      }
      visual.X = x;
      visual.Y = cy;
      visual.Width = helper.uw;
      visual.Height = b;
      if (IsInterfaceOfIRoundedRectangleChartPoint(visual)) {
        const rr2 = visual;
        rr2.Rx = rx;
        rr2.Ry = ry;
      }
      visual.RemoveOnCompleted = false;
      let ha;
      if (point.Context.HoverArea instanceof RectangleHoverArea)
        ha = point.Context.HoverArea;
      else
        point.Context.HoverArea = ha = new RectangleHoverArea();
      ha.SetDimensions(secondary - helper.actualUw * 0.5, cy, helper.actualUw, b);
      pointsCleanup.Clean(point);
      if (this.DataLabelsPaint != null) {
        let label = point.Context.Label;
        if (label == null) {
          let l = this._labelFactory();
          l.X = secondary - helper.uwm + helper.cp;
          l.Y = helper.p;
          l.RotateTransform = this.DataLabelsRotation;
          Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
          l.CompleteTransition(null);
          label = l;
          point.Context.Label = l;
        }
        this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
        label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
        label.TextSize = dls;
        label.Padding = this.DataLabelsPadding;
        let m = label.Measure(this.DataLabelsPaint);
        let labelPosition = this.GetLabelPosition(x, cy, helper.uw, b, m.Clone(), this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > this.Pivot, drawLocation.Clone(), drawMarginSize.Clone());
        if (this.DataLabelsTranslate != null)
          label.TranslateTransform = new LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
        label.X = labelPosition.X;
        label.Y = labelPosition.Y;
      }
      this.OnPointMeasured(point);
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetRequestedSecondaryOffset() {
    return 0.5;
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual, "visual.X", "visual.Width", "visual.Y", "visual.Height").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let chartView = point.Context.Chart;
    if (chartView.Core.IsZoomingOrPanning) {
      visual.CompleteTransition(null);
      visual.RemoveOnCompleted = true;
      this.DataFactory.DisposePoint(point);
      return;
    }
    let p = primaryScale.ToPixels(this.pivot);
    let secondary = secondaryScale.ToPixels(point.SecondaryValue);
    visual.X = secondary;
    visual.Y = p;
    visual.Height = 0;
    visual.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
}
class PolarLineSeries extends ChartSeries {
  constructor(visualFactory, labelFactory, pathGeometryFactory, visualPointFactory, isStacked = false) {
    super(SeriesProperties.Polar | SeriesProperties.PolarLine | (isStacked ? SeriesProperties.Stacked : 0) | SeriesProperties.Sketch | SeriesProperties.PrefersXStrategyTooltips);
    __publicField(this, "_fillPathHelperDictionary", new System.Dictionary());
    __publicField(this, "_strokePathHelperDictionary", new System.Dictionary());
    __publicField(this, "_lineSmoothness", 0.65);
    __publicField(this, "_geometrySize", 14);
    __publicField(this, "_enableNullSplitting", true);
    __publicField(this, "_geometryFill");
    __publicField(this, "_geometryStroke");
    __publicField(this, "_stroke", null);
    __publicField(this, "_fill", null);
    __publicField(this, "_scalesAngleAt", 0);
    __publicField(this, "_scalesRadiusAt", 0);
    __publicField(this, "_isClosed", true);
    __publicField(this, "_labelsPosition", 0);
    __publicField(this, "_visualPointFactory");
    __publicField(this, "_pathGeometryFactory");
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    this._visualPointFactory = visualPointFactory;
    this._pathGeometryFactory = pathGeometryFactory;
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this.DataPadding = new LvcPoint(1, 1.5);
  }
  get Stroke() {
    return this._stroke;
  }
  set Stroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._stroke, ($v) => this._stroke = $v), value, true);
  }
  get Fill() {
    return this._fill;
  }
  set Fill(value) {
    this.SetPaintProperty(new System.Ref(() => this._fill, ($v) => this._fill = $v), value);
  }
  get GeometrySize() {
    return this._geometrySize;
  }
  set GeometrySize(value) {
    this.SetProperty(new System.Ref(() => this._geometrySize, ($v) => this._geometrySize = $v), value);
  }
  get ScalesAngleAt() {
    return this._scalesAngleAt;
  }
  set ScalesAngleAt(value) {
    this.SetProperty(new System.Ref(() => this._scalesAngleAt, ($v) => this._scalesAngleAt = $v), value);
  }
  get ScalesRadiusAt() {
    return this._scalesRadiusAt;
  }
  set ScalesRadiusAt(value) {
    this.SetProperty(new System.Ref(() => this._scalesRadiusAt, ($v) => this._scalesRadiusAt = $v), value);
  }
  get LineSmoothness() {
    return this._lineSmoothness;
  }
  set LineSmoothness(value) {
    let v = value;
    if (value > 1)
      v = 1;
    if (value < 0)
      v = 0;
    this.SetProperty(new System.Ref(() => this._lineSmoothness, ($v) => this._lineSmoothness = $v), v);
  }
  get EnableNullSplitting() {
    return this._enableNullSplitting;
  }
  set EnableNullSplitting(value) {
    this.SetProperty(new System.Ref(() => this._enableNullSplitting, ($v) => this._enableNullSplitting = $v), value);
  }
  get GeometryFill() {
    return this._geometryFill;
  }
  set GeometryFill(value) {
    this.SetPaintProperty(new System.Ref(() => this._geometryFill, ($v) => this._geometryFill = $v), value);
  }
  get GeometryStroke() {
    return this._geometryStroke;
  }
  set GeometryStroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._geometryStroke, ($v) => this._geometryStroke = $v), value, true);
  }
  get IsClosed() {
    return this._isClosed;
  }
  set IsClosed(value) {
    this.SetProperty(new System.Ref(() => this._isClosed, ($v) => this._isClosed = $v), value);
  }
  get DataLabelsPosition() {
    return this._labelsPosition;
  }
  set DataLabelsPosition(value) {
    this.SetProperty(new System.Ref(() => this._labelsPosition, ($v) => this._labelsPosition = $v), value);
  }
  Invalidate(chart) {
    let strokePathHelperContainer;
    let fillPathHelperContainer;
    let polarChart = chart;
    let angleAxis = polarChart.AngleAxes[this.ScalesAngleAt];
    let radiusAxis = polarChart.RadiusAxes[this.ScalesRadiusAt];
    let drawLocation = polarChart.DrawMarginLocation.Clone();
    let drawMarginSize = polarChart.DrawMarginSize.Clone();
    let scaler = new PolarScaler(drawLocation.Clone(), drawMarginSize.Clone(), angleAxis, radiusAxis, polarChart.InnerRadius, polarChart.InitialRotation, polarChart.TotalAnge);
    let gs = this._geometrySize;
    let hgs = gs / 2;
    this.Stroke?.StrokeThickness ?? 0;
    let points = this.Fetch(polarChart).ToArray();
    let segments = this._enableNullSplitting ? this.SplitEachNull(points, scaler) : [points];
    let stacker = (this.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked ? polarChart.SeriesContext.GetStackPosition(this, this.GetStackGroup()) : null;
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (stacker != null) {
      actualZIndex = 1e3 - stacker.Position;
      if (this.Fill != null)
        this.Fill.ZIndex = actualZIndex;
      if (this.Stroke != null)
        this.Stroke.ZIndex = actualZIndex;
    }
    let dls = this.DataLabelsSize;
    let segmentI = 0;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    if (!this._strokePathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => strokePathHelperContainer, ($v) => strokePathHelperContainer = $v))) {
      strokePathHelperContainer = new System.List();
      this._strokePathHelperDictionary.SetAt(chart.Canvas.Sync, strokePathHelperContainer);
    }
    if (!this._fillPathHelperDictionary.TryGetValue(chart.Canvas.Sync, new System.Out(() => fillPathHelperContainer, ($v) => fillPathHelperContainer = $v))) {
      fillPathHelperContainer = new System.List();
      this._fillPathHelperDictionary.SetAt(chart.Canvas.Sync, fillPathHelperContainer);
    }
    for (const item of strokePathHelperContainer)
      item.ClearCommands();
    for (const item of fillPathHelperContainer)
      item.ClearCommands();
    let r = this.DataLabelsRotation;
    let isTangent = false;
    let isCotangent = false;
    if ((Math.floor(r) & 4294967295 & LiveCharts.TangentAngle) != 0) {
      r -= LiveCharts.TangentAngle;
      isTangent = true;
    }
    if ((Math.floor(r) & 4294967295 & LiveCharts.CotangentAngle) != 0) {
      r -= LiveCharts.CotangentAngle;
      isCotangent = true;
    }
    for (const segment of segments) {
      let fillPath;
      let strokePath;
      if (segmentI >= fillPathHelperContainer.length) {
        fillPath = this._pathGeometryFactory();
        fillPath.ClosingMethod = VectorClosingMethod.NotClosed;
        strokePath = this._pathGeometryFactory();
        strokePath.ClosingMethod = VectorClosingMethod.NotClosed;
        fillPathHelperContainer.Add(fillPath);
        strokePathHelperContainer.Add(strokePath);
      } else {
        fillPath = fillPathHelperContainer[segmentI];
        strokePath = strokePathHelperContainer[segmentI];
      }
      if (this.Fill != null) {
        this.Fill.AddGeometryToPaintTask(polarChart.Canvas, fillPath);
        polarChart.Canvas.AddDrawableTask(this.Fill);
        this.Fill.ZIndex = actualZIndex + 0.1;
        this.Fill.SetClipRectangle(polarChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      }
      if (this.Stroke != null) {
        this.Stroke.AddGeometryToPaintTask(polarChart.Canvas, strokePath);
        polarChart.Canvas.AddDrawableTask(this.Stroke);
        this.Stroke.ZIndex = actualZIndex + 0.2;
        this.Stroke.SetClipRectangle(polarChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      }
      for (const data of this.GetSpline(segment, scaler, stacker)) {
        let s = 0;
        if (stacker != null) {
          s = stacker.GetStack(data.TargetPoint).Start;
        }
        let cp = scaler.ToPixels(data.TargetPoint.SecondaryValue, data.TargetPoint.PrimaryValue + s);
        let x = cp.X;
        let y = cp.Y;
        let visual = data.TargetPoint.Context.Visual;
        if (visual == null) {
          let v = this._visualPointFactory();
          visual = v;
          let x0b = scaler.CenterX - hgs;
          let x1b = scaler.CenterX - hgs;
          let x2b = scaler.CenterX - hgs;
          let y0b = scaler.CenterY - hgs;
          let y1b = scaler.CenterY - hgs;
          let y2b = scaler.CenterY - hgs;
          v.Geometry.X = scaler.CenterX;
          v.Geometry.Y = scaler.CenterY;
          v.Geometry.Width = gs;
          v.Geometry.Height = gs;
          v.Bezier.Xi = x0b;
          v.Bezier.Yi = y0b;
          v.Bezier.Xm = x1b;
          v.Bezier.Ym = y1b;
          v.Bezier.Xj = x2b;
          v.Bezier.Yj = y2b;
          data.TargetPoint.Context.Visual = v;
          this.OnPointCreated(data.TargetPoint);
        }
        this.everFetched.Add(data.TargetPoint);
        this.GeometryFill?.AddGeometryToPaintTask(polarChart.Canvas, visual.Geometry);
        this.GeometryStroke?.AddGeometryToPaintTask(polarChart.Canvas, visual.Geometry);
        visual.Bezier.Xi = data.X0;
        visual.Bezier.Yi = data.Y0;
        visual.Bezier.Xm = data.X1;
        visual.Bezier.Ym = data.Y1;
        visual.Bezier.Xj = data.X2;
        visual.Bezier.Yj = data.Y2;
        if (this.Fill != null)
          fillPath.AddLast(visual.Bezier);
        if (this.Stroke != null)
          strokePath.AddLast(visual.Bezier);
        visual.Geometry.X = x - hgs;
        visual.Geometry.Y = y - hgs;
        visual.Geometry.Width = gs;
        visual.Geometry.Height = gs;
        visual.Geometry.RemoveOnCompleted = false;
        visual.FillPath = fillPath;
        visual.StrokePath = strokePath;
        let hags = gs < 16 ? 16 : gs;
        let ha;
        if (data.TargetPoint.Context.HoverArea instanceof RectangleHoverArea)
          ha = data.TargetPoint.Context.HoverArea;
        else
          data.TargetPoint.Context.HoverArea = ha = new RectangleHoverArea();
        ha.SetDimensions(x - hags * 0.5, y - hags * 0.5, hags, hags);
        pointsCleanup.Clean(data.TargetPoint);
        if (this.DataLabelsPaint != null) {
          let label = data.TargetPoint.Context.Label;
          let actualRotation = r + (isTangent ? scaler.GetAngle(data.TargetPoint.SecondaryValue) - 90 : 0) + (isCotangent ? scaler.GetAngle(data.TargetPoint.SecondaryValue) : 0);
          if ((isTangent || isCotangent) && (actualRotation + 90) % 360 > 180)
            actualRotation += 180;
          if (label == null) {
            let l = this._labelFactory();
            l.X = x - hgs;
            l.Y = scaler.CenterY - hgs;
            l.RotateTransform = actualRotation;
            Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));
            l.CompleteTransition(null);
            label = l;
            data.TargetPoint.Context.Label = l;
          }
          this.DataLabelsPaint.AddGeometryToPaintTask(polarChart.Canvas, label);
          label.Text = this.DataLabelsFormatter(new ChartPoint3(data.TargetPoint));
          label.TextSize = dls;
          label.Padding = this.DataLabelsPadding;
          label.RotateTransform = actualRotation;
          let rad = Math.sqrt(Math.pow(cp.X - scaler.CenterX, 2) + Math.pow(cp.Y - scaler.CenterY, 2));
          let labelPosition = this.GetLabelPolarPosition(scaler.CenterX, scaler.CenterY, rad, scaler.GetAngle(data.TargetPoint.SecondaryValue), label.Measure(this.DataLabelsPaint), this.GeometrySize, this.DataLabelsPosition);
          label.X = labelPosition.X;
          label.Y = labelPosition.Y;
        }
        this.OnPointMeasured(data.TargetPoint);
      }
      if (this.GeometryFill != null) {
        polarChart.Canvas.AddDrawableTask(this.GeometryFill);
        this.GeometryFill.SetClipRectangle(polarChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        this.GeometryFill.ZIndex = actualZIndex + 0.3;
      }
      if (this.GeometryStroke != null) {
        polarChart.Canvas.AddDrawableTask(this.GeometryStroke);
        this.GeometryStroke.SetClipRectangle(polarChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
        this.GeometryStroke.ZIndex = actualZIndex + 0.4;
      }
      segmentI++;
    }
    while (segmentI > fillPathHelperContainer.length) {
      let iFill = fillPathHelperContainer.length - 1;
      let fillHelper = fillPathHelperContainer[iFill];
      this.Fill?.RemoveGeometryFromPainTask(polarChart.Canvas, fillHelper);
      fillPathHelperContainer.RemoveAt(iFill);
      let iStroke = strokePathHelperContainer.length - 1;
      let strokeHelper = strokePathHelperContainer[iStroke];
      this.Stroke?.RemoveGeometryFromPainTask(polarChart.Canvas, strokeHelper);
      strokePathHelperContainer.RemoveAt(iStroke);
    }
    if (this.DataLabelsPaint != null) {
      polarChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.5;
    }
    pointsCleanup.CollectPointsForPolar(this.everFetched, polarChart.View, scaler, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetBounds(chart, angleAxis, radiusAxis) {
    if (this.DataFactory == null)
      throw new System.Exception("A data provider is required");
    let baseSeriesBounds = this.DataFactory.GetCartesianBounds(chart, this, angleAxis, radiusAxis);
    if (baseSeriesBounds.HasData)
      return baseSeriesBounds;
    let baseBounds = baseSeriesBounds.Bounds;
    let tickPrimary = Extensions.GetTickForPolar(radiusAxis, chart, baseBounds.VisiblePrimaryBounds);
    let tp = tickPrimary.Value * this.DataPadding.Y;
    if (baseBounds.VisiblePrimaryBounds.Delta == 0) {
      let mp = baseBounds.VisiblePrimaryBounds.Min == 0 ? 1 : baseBounds.VisiblePrimaryBounds.Min;
      tp = 0.1 * mp * this.DataPadding.Y;
    }
    let rgs = this.GeometrySize * 0.5 + (this.Stroke?.StrokeThickness ?? 0);
    return new SeriesBounds(new DimensionalBounds().Init({
      SecondaryBounds: new Bounds().Init({
        Max: baseBounds.SecondaryBounds.Max,
        Min: baseBounds.SecondaryBounds.Min,
        MinDelta: baseBounds.SecondaryBounds.MinDelta,
        PaddingMax: 1,
        PaddingMin: 0,
        RequestedGeometrySize: rgs
      }),
      PrimaryBounds: new Bounds().Init({
        Max: baseBounds.PrimaryBounds.Max,
        Min: baseBounds.PrimaryBounds.Min,
        MinDelta: baseBounds.PrimaryBounds.MinDelta,
        PaddingMax: tp,
        PaddingMin: tp,
        RequestedGeometrySize: rgs
      }),
      VisibleSecondaryBounds: new Bounds().Init({
        Max: baseBounds.VisibleSecondaryBounds.Max,
        Min: baseBounds.VisibleSecondaryBounds.Min
      }),
      VisiblePrimaryBounds: new Bounds().Init({
        Max: baseBounds.VisiblePrimaryBounds.Max,
        Min: baseBounds.VisiblePrimaryBounds.Min
      })
    }), false);
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.GeometryFill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.GeometryFill, this._visualFactory()));
    else if (this.Fill != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
    if (this.GeometryStroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.GeometryStroke, this._visualFactory()));
    else if (this.Stroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
  MiniatureEquals(series) {
    if (series instanceof StrokeAndFillCartesianSeries) {
      const sfSeries = series;
      return this.Name == series.Name && this.Fill == sfSeries.Fill && this.Stroke == sfSeries.Stroke;
    }
    return false;
  }
  GetSpline(points, scaler, stacker) {
    const _$generator = function* (points2, scaler2, stacker2) {
      if (points2.length == 0)
        return;
      let previous = LvcPoint.Empty.Clone();
      let current = LvcPoint.Empty.Clone();
      let next = LvcPoint.Empty.Clone();
      let next2 = LvcPoint.Empty.Clone();
      for (let i = 0; i < points2.length; i++) {
        let isClosed = this.IsClosed && points2.length > 3;
        let a1 = i + 1 - points2.length;
        let a2 = i + 2 - points2.length;
        let p0 = points2[i - 1 < 0 ? isClosed ? points2.length - 1 : 0 : i - 1];
        let p1 = points2[i];
        let p2 = points2[i + 1 > points2.length - 1 ? isClosed ? a1 : points2.length - 1 : i + 1];
        let p3 = points2[i + 2 > points2.length - 1 ? isClosed ? a2 : points2.length - 1 : i + 2];
        previous = scaler2.ToPixels(p0.SecondaryValue, p0.PrimaryValue);
        current = scaler2.ToPixels(p1.SecondaryValue, p1.PrimaryValue);
        next = scaler2.ToPixels(p2.SecondaryValue, p2.PrimaryValue);
        next2 = scaler2.ToPixels(p3.SecondaryValue, p3.PrimaryValue);
        let pys = 0;
        let cys = 0;
        let nys = 0;
        let nnys = 0;
        if (stacker2 != null) {
          pys = scaler2.ToPixels(0, stacker2.GetStack(p0).Start).Y;
          cys = scaler2.ToPixels(0, stacker2.GetStack(p1).Start).Y;
          nys = scaler2.ToPixels(0, stacker2.GetStack(p2).Start).Y;
          nnys = scaler2.ToPixels(0, stacker2.GetStack(p3).Start).Y;
        }
        let xc1 = (previous.X + current.X) / 2;
        let yc1 = (previous.Y + pys + current.Y + cys) / 2;
        let xc2 = (current.X + next.X) / 2;
        let yc2 = (current.Y + cys + next.Y + nys) / 2;
        let xc3 = (next.X + next2.X) / 2;
        let yc3 = (next.Y + nys + next2.Y + nnys) / 2;
        let len1 = Math.sqrt((current.X - previous.X) * (current.X - previous.X) + (current.Y + cys - previous.Y + pys) * (current.Y + cys - previous.Y + pys));
        let len2 = Math.sqrt((next.X - current.X) * (next.X - current.X) + (next.Y + nys - current.Y + cys) * (next.Y + nys - current.Y + cys));
        let len3 = Math.sqrt((next2.X - next.X) * (next2.X - next.X) + (next2.Y + nnys - next.Y + nys) * (next2.Y + nnys - next.Y + nys));
        let k1 = len1 / (len1 + len2);
        let k2 = len2 / (len2 + len3);
        if (Number.isNaN(k1))
          k1 = 0;
        if (Number.isNaN(k2))
          k2 = 0;
        let xm1 = xc1 + (xc2 - xc1) * k1;
        let ym1 = yc1 + (yc2 - yc1) * k1;
        let xm2 = xc2 + (xc3 - xc2) * k2;
        let ym2 = yc2 + (yc3 - yc2) * k2;
        let c1X = xm1 + (xc2 - xm1) * this._lineSmoothness + current.X - xm1;
        let c1Y = ym1 + (yc2 - ym1) * this._lineSmoothness + current.Y + cys - ym1;
        let c2X = xm2 + (xc2 - xm2) * this._lineSmoothness + next.X - xm2;
        let c2Y = ym2 + (yc2 - ym2) * this._lineSmoothness + next.Y + nys - ym2;
        let x0 = 0;
        let y0 = 0;
        if (i == 0) {
          x0 = current.X;
          y0 = current.Y + cys;
        } else {
          x0 = c1X;
          y0 = c1Y;
        }
        yield new BezierData(points2[i]).Init({
          X0: x0,
          Y0: y0,
          X1: c2X,
          Y1: c2Y,
          X2: next.X,
          Y2: next.Y
        });
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(points, scaler, stacker));
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual.Geometry, "visual.Geometry.X", "visual.Geometry.Y", "visual.Geometry.Width", "visual.Geometry.Height").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
    Extensions.TransitionateProperties(visual.Bezier, "visual.Bezier.Xi", "visual.Bezier.Yi", "visual.Bezier.Xm", "visual.Bezier.Ym", "visual.Bezier.Xj", "visual.Bezier.Yj").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, scaler) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let p = scaler.ToPixelsFromCharPoint(point);
    let x = p.X;
    let y = p.Y;
    visual.Geometry.X = x;
    visual.Geometry.Y = y;
    visual.Geometry.Height = 0;
    visual.Geometry.Width = 0;
    visual.Geometry.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
  SoftDeleteOrDispose(chart) {
    let core = chart.Core;
    let scale = new PolarScaler(core.DrawMarginLocation.Clone(), core.DrawMarginSize.Clone(), core.AngleAxes[this.ScalesAngleAt], core.RadiusAxes[this.ScalesRadiusAt], core.InnerRadius, core.InitialRotation, core.TotalAnge);
    let deleted = new System.List();
    for (const point of this.everFetched) {
      if (point.Context.Chart != chart)
        continue;
      this.SoftDeleteOrDisposePoint(point, scale);
      deleted.Add(point);
    }
    for (const pt of this.GetPaintTasks()) {
      if (pt != null)
        core.Canvas.RemovePaintTask(pt);
    }
    for (const item of deleted)
      this.everFetched.Remove(item);
    let canvas = chart.CoreCanvas;
    if (this.Fill != null) {
      for (const activeChartContainer of this._fillPathHelperDictionary)
        for (const pathHelper of activeChartContainer.Value)
          this.Fill.RemoveGeometryFromPainTask(canvas, pathHelper);
    }
    if (this.Stroke != null) {
      for (const activeChartContainer of this._strokePathHelperDictionary)
        for (const pathHelper of activeChartContainer.Value)
          this.Stroke.RemoveGeometryFromPainTask(canvas, pathHelper);
    }
    if (this.GeometryFill != null)
      canvas.RemovePaintTask(this.GeometryFill);
    if (this.GeometryStroke != null)
      canvas.RemovePaintTask(this.GeometryStroke);
    this.OnVisibilityChanged();
  }
  GetPaintTasks() {
    return [this.Stroke, this.Fill, this._geometryFill, this._geometryStroke, this.DataLabelsPaint, this.hoverPaint];
  }
  GetLabelPolarPosition(centerX, centerY, radius, angle, labelSize, geometrySize, position) {
    let toRadians = Math.PI / 180;
    let actualAngle = 0;
    switch (position) {
      case PolarLabelsPosition.End:
        actualAngle = angle;
        radius += Math.sqrt(Math.pow(labelSize.Width + geometrySize * 0.5, 2) + Math.pow(labelSize.Height + geometrySize * 0.5, 2)) * 0.5;
        break;
      case PolarLabelsPosition.Start:
        actualAngle = angle;
        radius -= Math.sqrt(Math.pow(labelSize.Width + geometrySize * 0.5, 2) + Math.pow(labelSize.Height + geometrySize * 0.5, 2)) * 0.5;
        break;
      case PolarLabelsPosition.Outer:
        actualAngle = angle;
        radius *= 2;
        break;
      case PolarLabelsPosition.Middle:
        actualAngle = angle;
        break;
      case PolarLabelsPosition.ChartCenter:
        return new LvcPoint(centerX, centerY);
    }
    actualAngle %= 360;
    if (actualAngle < 0)
      actualAngle += 360;
    actualAngle *= toRadians;
    return new LvcPoint(centerX + Math.cos(actualAngle) * radius, centerY + Math.sin(actualAngle) * radius);
  }
  SplitEachNull(points, scaler) {
    const _$generator = function* (points2, scaler2) {
      let l = new System.List(points2.length);
      for (const point of points2) {
        if (point.IsEmpty) {
          if (point.Context.Visual instanceof BezierVisualPoint) {
            const visual = point.Context.Visual;
            let s = scaler2.ToPixelsFromCharPoint(point);
            let x = s.X;
            let y = s.Y;
            let gs = this._geometrySize;
            let hgs = gs / 2;
            this.Stroke?.StrokeThickness ?? 0;
            visual.Geometry.X = x - hgs;
            visual.Geometry.Y = y - hgs;
            visual.Geometry.Width = gs;
            visual.Geometry.Height = gs;
            visual.Geometry.RemoveOnCompleted = true;
            point.Context.Visual = null;
          }
          if (l.length > 0)
            yield l.ToArray();
          l = new System.List(points2.length);
          continue;
        }
        l.Add(point);
      }
      if (l.length > 0)
        yield l.ToArray();
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(points, scaler));
  }
}
const _Labelers = class {
  static get Default() {
    return __privateGet(_Labelers, _Default);
  }
  static set Default(value) {
    __privateSet(_Labelers, _Default, value);
  }
  static get SixRepresentativeDigits() {
    return _Labelers.Log10_6;
  }
  static get Currency() {
    return (value) => value.toString();
  }
  static SetDefaultLabeler(labeler) {
    _Labelers.Default = labeler;
  }
  static FormatCurrency(value, thousands, decimals, symbol) {
    return value.toString();
  }
  static BuildNamedLabeler(labels) {
    return new NamedLabeler(labels);
  }
  static Log10_6(value) {
    return value.toString();
  }
};
let Labelers = _Labelers;
_Default = new WeakMap();
__privateAdd(Labelers, _Default, _Labelers.Log10_6);
class FinancialSeries extends CartesianSeries {
  constructor(visualFactory, labelFactory, miniatureGeometryFactory) {
    super(SeriesProperties.Financial | SeriesProperties.PrimaryAxisVerticalOrientation | SeriesProperties.Solid | SeriesProperties.PrefersXStrategyTooltips);
    __publicField(this, "_upStroke", null);
    __publicField(this, "_upFill", null);
    __publicField(this, "_downStroke", null);
    __publicField(this, "_downFill", null);
    __publicField(this, "_maxBarWidth", 25);
    __publicField(this, "_visualFactory");
    __publicField(this, "_labelFactory");
    __publicField(this, "_miniatureGeometryFactory");
    this._visualFactory = visualFactory;
    this._labelFactory = labelFactory;
    this._miniatureGeometryFactory = miniatureGeometryFactory;
    this.TooltipLabelFormatter = (p) => `${this.Name}, H: ${p.PrimaryValue}, O: ${p.TertiaryValue}, C: ${p.QuaternaryValue}, L: ${p.QuinaryValue}`;
  }
  get MaxBarWidth() {
    return this._maxBarWidth;
  }
  set MaxBarWidth(value) {
    this.SetProperty(new System.Ref(() => this._maxBarWidth, ($v) => this._maxBarWidth = $v), value);
  }
  get UpStroke() {
    return this._upStroke;
  }
  set UpStroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._upStroke, ($v) => this._upStroke = $v), value, true);
  }
  get UpFill() {
    return this._upFill;
  }
  set UpFill(value) {
    this.SetPaintProperty(new System.Ref(() => this._upFill, ($v) => this._upFill = $v), value);
  }
  get DownStroke() {
    return this._downStroke;
  }
  set DownStroke(value) {
    this.SetPaintProperty(new System.Ref(() => this._downStroke, ($v) => this._downStroke = $v), value, true);
  }
  get DownFill() {
    return this._downFill;
  }
  set DownFill(value) {
    this.SetPaintProperty(new System.Ref(() => this._downFill, ($v) => this._downFill = $v), value);
  }
  Invalidate(chart) {
    let cartesianChart = chart;
    let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
    let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
    let drawLocation = cartesianChart.DrawMarginLocation.Clone();
    let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
    let secondaryScale = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
    let primaryScale = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    let previousPrimaryScale = Extensions.GetActualScaler(primaryAxis, cartesianChart);
    let previousSecondaryScale = Extensions.GetActualScaler(secondaryAxis, cartesianChart);
    let uw = secondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
    let puw = previousSecondaryScale == null ? 0 : previousSecondaryScale.MeasureInPixels(secondaryAxis.UnitWidth);
    let uwm = 0.5 * uw;
    if (uw > this.MaxBarWidth) {
      uw = this.MaxBarWidth;
      uwm = uw * 0.5;
      puw = uw;
    }
    let actualZIndex = this.ZIndex == 0 ? this.SeriesId : this.ZIndex;
    if (this.UpFill != null) {
      this.UpFill.ZIndex = actualZIndex + 0.1;
      this.UpFill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.UpFill);
    }
    if (this.DownFill != null) {
      this.DownFill.ZIndex = actualZIndex + 0.1;
      this.DownFill.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.DownFill);
    }
    if (this.UpStroke != null) {
      this.UpStroke.ZIndex = actualZIndex + 0.2;
      this.UpStroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.UpStroke);
    }
    if (this.DownStroke != null) {
      this.DownStroke.ZIndex = actualZIndex + 0.2;
      this.DownStroke.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      cartesianChart.Canvas.AddDrawableTask(this.DownStroke);
    }
    if (this.DataLabelsPaint != null) {
      this.DataLabelsPaint.ZIndex = actualZIndex + 0.3;
      cartesianChart.Canvas.AddDrawableTask(this.DataLabelsPaint);
    }
    let dls = this.DataLabelsSize;
    let pointsCleanup = ChartPointCleanupContext.For(this.everFetched);
    for (const point of this.Fetch(cartesianChart)) {
      let visual = point.Context.Visual;
      let secondary = secondaryScale.ToPixels(point.SecondaryValue);
      let high = primaryScale.ToPixels(point.PrimaryValue);
      let open = primaryScale.ToPixels(point.TertiaryValue);
      let close = primaryScale.ToPixels(point.QuaternaryValue);
      let low = primaryScale.ToPixels(point.QuinaryValue);
      let middle = open;
      if (point.IsEmpty) {
        if (visual != null) {
          visual.X = secondary - uwm;
          visual.Width = uw;
          visual.Y = middle;
          visual.Open = middle;
          visual.Close = middle;
          visual.Low = middle;
          visual.RemoveOnCompleted = true;
          point.Context.Visual = null;
        }
        continue;
      }
      if (visual == null) {
        let xi = secondary - uwm;
        let uwi = uw;
        if (previousSecondaryScale != null && previousPrimaryScale != null) {
          let previousP = previousPrimaryScale.ToPixels(this.pivot);
          let previousPrimary = previousPrimaryScale.ToPixels(point.PrimaryValue);
          let bp = Math.abs(previousPrimary - previousP);
          point.PrimaryValue > this.pivot ? previousPrimary : previousPrimary - bp;
          xi = previousSecondaryScale.ToPixels(point.SecondaryValue) - uwm;
          uwi = puw;
          cartesianChart.IsZoomingOrPanning ? bp : 0;
        }
        let r = this._visualFactory();
        r.X = xi;
        r.Width = uwi;
        r.Y = middle;
        r.Open = middle;
        r.Close = middle;
        r.Low = middle;
        visual = r;
        point.Context.Visual = visual;
        this.OnPointCreated(point);
        this.everFetched.Add(point);
      }
      if (open > close) {
        this.UpFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
        this.UpStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
        this.DownFill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
        this.DownStroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
      } else {
        this.DownFill?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
        this.DownStroke?.AddGeometryToPaintTask(cartesianChart.Canvas, visual);
        this.UpFill?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
        this.UpStroke?.RemoveGeometryFromPainTask(cartesianChart.Canvas, visual);
      }
      let x = secondary - uwm;
      visual.X = x;
      visual.Width = uw;
      visual.Y = high;
      visual.Open = open;
      visual.Close = close;
      visual.Low = low;
      visual.RemoveOnCompleted = false;
      let ha;
      if (point.Context.HoverArea instanceof RectangleHoverArea)
        ha = point.Context.HoverArea;
      else
        point.Context.HoverArea = ha = new RectangleHoverArea();
      ha.SetDimensions(secondary - uwm, high, uw, Math.abs(low - high));
      pointsCleanup.Clean(point);
      if (this.DataLabelsPaint != null) {
        let label = point.Context.Label;
        if (label == null) {
          let l = this._labelFactory();
          l.X = secondary - uwm;
          l.Y = high;
          l.RotateTransform = this.DataLabelsRotation;
          Extensions.TransitionateProperties(l, "l.X", "l.Y").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
          l.CompleteTransition(null);
          label = l;
          point.Context.Label = l;
        }
        this.DataLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, label);
        label.Text = this.DataLabelsFormatter(new ChartPoint3(point));
        label.TextSize = dls;
        label.Padding = this.DataLabelsPadding;
        let m = label.Measure(this.DataLabelsPaint);
        let labelPosition = this.GetLabelPosition(x, high, uw, Math.abs(low - high), m.Clone(), this.DataLabelsPosition, this.SeriesProperties, point.PrimaryValue > this.Pivot, drawLocation.Clone(), drawMarginSize.Clone());
        if (this.DataLabelsTranslate != null)
          label.TranslateTransform = new LvcPoint(m.Width * this.DataLabelsTranslate.X, m.Height * this.DataLabelsTranslate.Y);
        label.X = labelPosition.X;
        label.Y = labelPosition.Y;
      }
      this.OnPointMeasured(point);
    }
    pointsCleanup.CollectPoints(this.everFetched, cartesianChart.View, primaryScale, secondaryScale, this.SoftDeleteOrDisposePoint.bind(this));
  }
  GetBounds(chart, secondaryAxis, primaryAxis) {
    let rawBounds = this.DataFactory.GetFinancialBounds(chart, this, secondaryAxis, primaryAxis);
    if (rawBounds.HasData)
      return rawBounds;
    let rawBaseBounds = rawBounds.Bounds;
    let tickPrimary = Extensions.GetTick(primaryAxis, chart.ControlSize.Clone(), rawBaseBounds.VisiblePrimaryBounds);
    let tickSecondary = Extensions.GetTick(secondaryAxis, chart.ControlSize.Clone(), rawBaseBounds.VisibleSecondaryBounds);
    let ts = tickSecondary.Value * this.DataPadding.X;
    let tp = tickPrimary.Value * this.DataPadding.Y;
    if (rawBaseBounds.VisibleSecondaryBounds.Delta == 0)
      ts = secondaryAxis.UnitWidth * this.DataPadding.X;
    if (rawBaseBounds.VisiblePrimaryBounds.Delta == 0)
      tp = rawBaseBounds.VisiblePrimaryBounds.Max * 0.25;
    let rgs = this.GetRequestedGeometrySize();
    let rso = this.GetRequestedSecondaryOffset();
    let rpo = this.GetRequestedPrimaryOffset();
    let dimensionalBounds = new DimensionalBounds().Init({
      SecondaryBounds: new Bounds().Init({
        Max: rawBaseBounds.SecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.SecondaryBounds.Min - rso * secondaryAxis.UnitWidth,
        MinDelta: rawBaseBounds.SecondaryBounds.MinDelta,
        PaddingMax: ts,
        PaddingMin: ts,
        RequestedGeometrySize: rgs
      }),
      PrimaryBounds: new Bounds().Init({
        Max: rawBaseBounds.PrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.PrimaryBounds.Min - rpo * secondaryAxis.UnitWidth,
        MinDelta: rawBaseBounds.PrimaryBounds.MinDelta,
        PaddingMax: tp,
        PaddingMin: tp,
        RequestedGeometrySize: rgs
      }),
      VisibleSecondaryBounds: new Bounds().Init({
        Max: rawBaseBounds.VisibleSecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.VisibleSecondaryBounds.Min - rso * secondaryAxis.UnitWidth
      }),
      VisiblePrimaryBounds: new Bounds().Init({
        Max: rawBaseBounds.VisiblePrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.VisiblePrimaryBounds.Min - rpo * secondaryAxis.UnitWidth
      }),
      TertiaryBounds: rawBaseBounds.TertiaryBounds,
      VisibleTertiaryBounds: rawBaseBounds.VisibleTertiaryBounds
    });
    if (this.GetIsInvertedBounds()) {
      let tempSb = dimensionalBounds.SecondaryBounds;
      let tempPb = dimensionalBounds.PrimaryBounds;
      let tempVsb = dimensionalBounds.VisibleSecondaryBounds;
      let tempVpb = dimensionalBounds.VisiblePrimaryBounds;
      dimensionalBounds.SecondaryBounds = tempPb;
      dimensionalBounds.PrimaryBounds = tempSb;
      dimensionalBounds.VisibleSecondaryBounds = tempVpb;
      dimensionalBounds.VisiblePrimaryBounds = tempVsb;
    }
    return new SeriesBounds(dimensionalBounds, false);
  }
  GetRequestedSecondaryOffset() {
    return 0.5;
  }
  SetDefaultPointTransitions(chartPoint) {
    let chart = chartPoint.Context.Chart;
    let visual = chartPoint.Context.Visual;
    Extensions.TransitionateProperties(visual, "visual.X", "visual.Width", "visual.Y", "visual.Open", "visual.Close", "visual.Low").WithAnimationBuilder((animation) => animation.WithDuration(this.AnimationsSpeed ?? chart.AnimationsSpeed).WithEasingFunction(this.EasingFunction ?? chart.EasingFunction)).CompleteCurrentTransitions();
  }
  SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale) {
    let visual = point.Context.Visual;
    if (visual == null)
      return;
    if (this.DataFactory == null)
      throw new System.Exception("Data provider not found");
    let chartView = point.Context.Chart;
    if (chartView.Core.IsZoomingOrPanning) {
      visual.CompleteTransition(null);
      visual.RemoveOnCompleted = true;
      this.DataFactory.DisposePoint(point);
      return;
    }
    let p = primaryScale.ToPixels(this.pivot);
    let secondary = secondaryScale.ToPixels(point.SecondaryValue);
    visual.X = secondary;
    visual.Y = p;
    visual.Open = p;
    visual.Close = p;
    visual.Low = p;
    visual.RemoveOnCompleted = true;
    this.DataFactory.DisposePoint(point);
    let label = point.Context.Label;
    if (label == null)
      return;
    label.TextSize = 1;
    label.RemoveOnCompleted = true;
  }
  GetPaintTasks() {
    return [this._upFill, this._upStroke, this._downFill, this._downStroke, this.DataLabelsPaint, this.hoverPaint];
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged();
  }
  MiniatureEquals(series) {
    if (series instanceof FinancialSeries) {
      const financial = series;
      return this.Name == series.Name && this.UpFill == financial.UpFill && this.UpStroke == financial.UpStroke && this.DownFill == financial.DownFill && this.DownStroke == financial.DownStroke;
    }
    return false;
  }
  GetMiniatresSketch() {
    let schedules = new System.List();
    if (this.UpStroke != null)
      schedules.Add(this.BuildMiniatureSchedule(this.UpStroke, this._miniatureGeometryFactory()));
    return new Sketch().Init({
      Height: this.MiniatureShapeSize,
      Width: this.MiniatureShapeSize,
      PaintSchedules: schedules
    });
  }
}
class CartesianSeries extends ChartSeries {
  constructor(properties) {
    super(properties);
    __publicField(this, "_scalesXAt", 0);
    __publicField(this, "_scalesYAt", 0);
    __publicField(this, "_labelsPosition", 0);
    __publicField(this, "_labelsTranslate", null);
  }
  get ScalesXAt() {
    return this._scalesXAt;
  }
  set ScalesXAt(value) {
    this.SetProperty(new System.Ref(() => this._scalesXAt, ($v) => this._scalesXAt = $v), value);
  }
  get ScalesYAt() {
    return this._scalesYAt;
  }
  set ScalesYAt(value) {
    this.SetProperty(new System.Ref(() => this._scalesYAt, ($v) => this._scalesYAt = $v), value);
  }
  get DataLabelsPosition() {
    return this._labelsPosition;
  }
  set DataLabelsPosition(value) {
    this.SetProperty(new System.Ref(() => this._labelsPosition, ($v) => this._labelsPosition = $v), value);
  }
  get DataLabelsTranslate() {
    return this._labelsTranslate;
  }
  set DataLabelsTranslate(value) {
    this.SetProperty(new System.Ref(() => this._labelsTranslate, ($v) => this._labelsTranslate = $v), value?.Clone());
  }
  GetBounds(chart, secondaryAxis, primaryAxis) {
    let rawBounds = this.DataFactory.GetCartesianBounds(chart, this, secondaryAxis, primaryAxis);
    if (rawBounds.HasData)
      return rawBounds;
    let rawBaseBounds = rawBounds.Bounds;
    let tickPrimary = Extensions.GetTick(primaryAxis, chart.ControlSize.Clone(), rawBaseBounds.VisiblePrimaryBounds);
    let tickSecondary = Extensions.GetTick(secondaryAxis, chart.ControlSize.Clone(), rawBaseBounds.VisibleSecondaryBounds);
    let ts = tickSecondary.Value * this.DataPadding.X;
    let tp = tickPrimary.Value * this.DataPadding.Y;
    if (rawBaseBounds.VisibleSecondaryBounds.Delta == 0)
      ts = secondaryAxis.UnitWidth * this.DataPadding.X;
    if (rawBaseBounds.VisiblePrimaryBounds.Delta == 0)
      tp = rawBaseBounds.VisiblePrimaryBounds.Max * 0.25;
    let rgs = this.GetRequestedGeometrySize();
    let rso = this.GetRequestedSecondaryOffset();
    let rpo = this.GetRequestedPrimaryOffset();
    let dimensionalBounds = new DimensionalBounds().Init({
      SecondaryBounds: new Bounds().Init({
        Max: rawBaseBounds.SecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.SecondaryBounds.Min - rso * secondaryAxis.UnitWidth,
        MinDelta: rawBaseBounds.SecondaryBounds.MinDelta,
        PaddingMax: ts,
        PaddingMin: ts,
        RequestedGeometrySize: rgs
      }),
      PrimaryBounds: new Bounds().Init({
        Max: rawBaseBounds.PrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.PrimaryBounds.Min - rpo * secondaryAxis.UnitWidth,
        MinDelta: rawBaseBounds.PrimaryBounds.MinDelta,
        PaddingMax: tp,
        PaddingMin: tp,
        RequestedGeometrySize: rgs
      }),
      VisibleSecondaryBounds: new Bounds().Init({
        Max: rawBaseBounds.VisibleSecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.VisibleSecondaryBounds.Min - rso * secondaryAxis.UnitWidth
      }),
      VisiblePrimaryBounds: new Bounds().Init({
        Max: rawBaseBounds.VisiblePrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
        Min: rawBaseBounds.VisiblePrimaryBounds.Min - rpo * secondaryAxis.UnitWidth
      }),
      TertiaryBounds: rawBaseBounds.TertiaryBounds,
      VisibleTertiaryBounds: rawBaseBounds.VisibleTertiaryBounds
    });
    if (this.GetIsInvertedBounds()) {
      let tempSb = dimensionalBounds.SecondaryBounds;
      let tempPb = dimensionalBounds.PrimaryBounds;
      let tempVsb = dimensionalBounds.VisibleSecondaryBounds;
      let tempVpb = dimensionalBounds.VisiblePrimaryBounds;
      dimensionalBounds.SecondaryBounds = tempPb;
      dimensionalBounds.PrimaryBounds = tempSb;
      dimensionalBounds.VisibleSecondaryBounds = tempVpb;
      dimensionalBounds.VisiblePrimaryBounds = tempVsb;
    }
    return new SeriesBounds(dimensionalBounds, false);
  }
  GetRequestedGeometrySize() {
    return 0;
  }
  GetRequestedSecondaryOffset() {
    return 0;
  }
  GetRequestedPrimaryOffset() {
    return 0;
  }
  GetIsInvertedBounds() {
    return false;
  }
  SoftDeleteOrDispose(chart) {
    let core = chart.Core;
    let secondaryAxis = core.XAxes.length > this.ScalesXAt ? core.XAxes[this.ScalesXAt] : null;
    let primaryAxis = core.YAxes.length > this.ScalesYAt ? core.YAxes[this.ScalesYAt] : null;
    let secondaryScale = secondaryAxis == null ? Scaler.MakeDefault() : Scaler.Make(core.DrawMarginLocation.Clone(), core.DrawMarginSize.Clone(), secondaryAxis);
    let primaryScale = primaryAxis == null ? Scaler.MakeDefault() : Scaler.Make(core.DrawMarginLocation.Clone(), core.DrawMarginSize.Clone(), primaryAxis);
    let deleted = new System.List();
    for (const point of this.everFetched) {
      if (point.Context.Chart != chart)
        continue;
      this.SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale);
      deleted.Add(point);
    }
    for (const pt of this.GetPaintTasks()) {
      if (pt != null)
        core.Canvas.RemovePaintTask(pt);
    }
    for (const item of deleted)
      this.everFetched.Remove(item);
    this.OnVisibilityChanged();
  }
  GetLabelPosition(x, y, width, height, labelSize, position, seriesProperties, isGreaterThanPivot, drawMarginLocation, drawMarginSize) {
    let middleX = (x + x + width) * 0.5;
    let middleY = (y + y + height) * 0.5;
    return match(position).with(DataLabelsPosition.Middle, () => new LvcPoint(middleX, middleY)).with(DataLabelsPosition.Top, () => new LvcPoint(middleX, y - labelSize.Height * 0.5)).with(DataLabelsPosition.Bottom, () => new LvcPoint(middleX, y + height + labelSize.Height * 0.5)).with(DataLabelsPosition.Left, () => new LvcPoint(x - labelSize.Width * 0.5, middleY)).with(DataLabelsPosition.Right, () => new LvcPoint(x + width + labelSize.Width * 0.5, middleY)).with(DataLabelsPosition.End, () => (seriesProperties & SeriesProperties.PrimaryAxisHorizontalOrientation) == SeriesProperties.PrimaryAxisHorizontalOrientation ? isGreaterThanPivot ? new LvcPoint(x + width + labelSize.Width * 0.5, middleY) : new LvcPoint(x - labelSize.Width * 0.5, middleY) : isGreaterThanPivot ? new LvcPoint(middleX, y - labelSize.Height * 0.5) : new LvcPoint(middleX, y + height + labelSize.Height * 0.5)).with(DataLabelsPosition.Start, () => (seriesProperties & SeriesProperties.PrimaryAxisHorizontalOrientation) == SeriesProperties.PrimaryAxisHorizontalOrientation ? isGreaterThanPivot ? new LvcPoint(x - labelSize.Width * 0.5, middleY) : new LvcPoint(x + width + labelSize.Width * 0.5, middleY) : isGreaterThanPivot ? new LvcPoint(middleX, y + height + labelSize.Height * 0.5) : new LvcPoint(middleX, y - labelSize.Height * 0.5)).otherwise(() => {
      throw new System.Exception("Position not supported");
    });
  }
}
class PolinominalEasingFunction {
  static In(t, e = 3) {
    {
      return Math.pow(t, e);
    }
  }
  static Out(t, e = 3) {
    {
      return 1 - Math.pow(1 - t, e);
    }
  }
  static InOut(t, e = 3) {
    {
      return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
    }
  }
}
class BackEasingFunction {
  static In(t, s = 1.70158) {
    return t * t * (s * (t - 1) + t);
  }
  static Out(t, s = 1.70158) {
    return --t * t * ((t + 1) * s + t) + 1;
  }
  static InOut(t, s = 1.70158) {
    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
  }
}
const _CubicBezierEasingFunction = class {
  static BuildBezierEasingFunction(mX1, mY1, mX2, mY2) {
    if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
      throw new System.Exception("Bezier x values must be in [0, 1] range");
    }
    if (mX1 == mY1 && mX2 == mY2) {
      return _CubicBezierEasingFunction.LinearEasing;
    }
    let sampleValues = new Float32Array(_CubicBezierEasingFunction.s_kSplineTableSize);
    for (let i = 0; i < _CubicBezierEasingFunction.s_kSplineTableSize; ++i) {
      sampleValues[i] = _CubicBezierEasingFunction.CalcBezier(i * _CubicBezierEasingFunction.s_kSampleStepSize, mX1, mX2);
    }
    function getTForX(aX) {
      let intervalStart = 0;
      let currentSample = 1;
      let lastSample = _CubicBezierEasingFunction.s_kSplineTableSize - 1;
      for (; currentSample != lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += _CubicBezierEasingFunction.s_kSampleStepSize;
      }
      --currentSample;
      let dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      let guessForT = intervalStart + dist * _CubicBezierEasingFunction.s_kSampleStepSize;
      let initialSlope = _CubicBezierEasingFunction.GetSlope(guessForT, mX1, mX2);
      return initialSlope >= _CubicBezierEasingFunction.s_minSlope ? _CubicBezierEasingFunction.NewtonRaphsonIterate(aX, guessForT, mX1, mX2) : initialSlope == 0 ? guessForT : _CubicBezierEasingFunction.BinarySubdivide(aX, intervalStart, intervalStart + _CubicBezierEasingFunction.s_kSampleStepSize, mX1, mX2);
    }
    return (t) => {
      return _CubicBezierEasingFunction.CalcBezier(getTForX(t), mY1, mY2);
    };
  }
  static A(aA1, aA2) {
    return 1 - 3 * aA2 + 3 * aA1;
  }
  static B(aA1, aA2) {
    return 3 * aA2 - 6 * aA1;
  }
  static C(aA1) {
    return 3 * aA1;
  }
  static CalcBezier(aT, aA1, aA2) {
    return ((_CubicBezierEasingFunction.A(aA1, aA2) * aT + _CubicBezierEasingFunction.B(aA1, aA2)) * aT + _CubicBezierEasingFunction.C(aA1)) * aT;
  }
  static GetSlope(aT, aA1, aA2) {
    return 3 * _CubicBezierEasingFunction.A(aA1, aA2) * aT * aT + 2 * _CubicBezierEasingFunction.B(aA1, aA2) * aT + _CubicBezierEasingFunction.C(aA1);
  }
  static BinarySubdivide(aX, aA, aB, mX1, mX2) {
    let currentX = 0;
    let currentT = 0;
    let i = 0;
    do {
      currentT = aA + (aB - aA) / 2;
      currentX = _CubicBezierEasingFunction.CalcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (Math.abs(currentX) > _CubicBezierEasingFunction.s_presicion && ++i < _CubicBezierEasingFunction.s_maxIterations);
    return currentT;
  }
  static NewtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (let i = 0; i < _CubicBezierEasingFunction.s_iterations; ++i) {
      let currentSlope = _CubicBezierEasingFunction.GetSlope(aGuessT, mX1, mX2);
      if (currentSlope == 0) {
        return aGuessT;
      }
      let currentX = _CubicBezierEasingFunction.CalcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }
  static LinearEasing(x) {
    return x;
  }
};
let CubicBezierEasingFunction = _CubicBezierEasingFunction;
__publicField(CubicBezierEasingFunction, "s_iterations", 4);
__publicField(CubicBezierEasingFunction, "s_minSlope", 1e-3);
__publicField(CubicBezierEasingFunction, "s_presicion", 1e-7);
__publicField(CubicBezierEasingFunction, "s_maxIterations", 10);
__publicField(CubicBezierEasingFunction, "s_kSplineTableSize", 11);
__publicField(CubicBezierEasingFunction, "s_kSampleStepSize", 1 / (_CubicBezierEasingFunction.s_kSplineTableSize - 1));
class CircleEasingFunction {
  static In(t) {
    {
      return 1 - Math.sqrt(1 - t * t);
    }
  }
  static Out(t) {
    {
      return Math.sqrt(1 - --t * t);
    }
  }
  static InOut(t) {
    return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
  }
}
const _ElasticEasingFunction = class {
  static In(t, a = 1, p = 0.3) {
    let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= _ElasticEasingFunction.tau);
    {
      return a * _ElasticEasingFunction.Tpmt(- --t) * Math.sin((s - t) / p);
    }
  }
  static Out(t, a = 1, p = 0.3) {
    let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= _ElasticEasingFunction.tau);
    {
      return 1 - a * _ElasticEasingFunction.Tpmt(t = +t) * Math.sin((t + s) / p);
    }
  }
  static InOut(t, a = 1, p = 0.3) {
    let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= _ElasticEasingFunction.tau);
    {
      return (t = t * 2 - 1) < 0 ? a * _ElasticEasingFunction.Tpmt(-t) * Math.sin((s - t) / p) : (2 - a * _ElasticEasingFunction.Tpmt(t) * Math.sin((s + t) / p)) / 2;
    }
  }
  static Tpmt(x) {
    {
      return (Math.pow(2, -10 * x) - 9765625e-10) * 1.0009775171065494;
    }
  }
};
let ElasticEasingFunction = _ElasticEasingFunction;
__publicField(ElasticEasingFunction, "tau", 2 * Math.PI);
const _BounceEasingFunction = class {
  static In(t) {
    return 1 - _BounceEasingFunction.Out(1 - t);
  }
  static Out(t) {
    return (t = +t) < _BounceEasingFunction.s_b1 ? _BounceEasingFunction.s_b0 * t * t : t < _BounceEasingFunction.s_b3 ? _BounceEasingFunction.s_b0 * (t -= _BounceEasingFunction.s_b2) * t + _BounceEasingFunction.s_b4 : t < _BounceEasingFunction.s_b6 ? _BounceEasingFunction.s_b0 * (t -= _BounceEasingFunction.s_b5) * t + _BounceEasingFunction.s_b7 : _BounceEasingFunction.s_b0 * (t -= _BounceEasingFunction.s_b8) * t + _BounceEasingFunction.s_b9;
  }
  static InOut(t) {
    return ((t *= 2) <= 1 ? 1 - _BounceEasingFunction.Out(1 - t) : _BounceEasingFunction.Out(t - 1) + 1) / 2;
  }
};
let BounceEasingFunction = _BounceEasingFunction;
__publicField(BounceEasingFunction, "s_b1", 4 / 11);
__publicField(BounceEasingFunction, "s_b2", 6 / 11);
__publicField(BounceEasingFunction, "s_b3", 8 / 11);
__publicField(BounceEasingFunction, "s_b4", 3 / 4);
__publicField(BounceEasingFunction, "s_b5", 9 / 11);
__publicField(BounceEasingFunction, "s_b6", 10 / 11);
__publicField(BounceEasingFunction, "s_b7", 15 / 16);
__publicField(BounceEasingFunction, "s_b8", 21 / 22);
__publicField(BounceEasingFunction, "s_b9", 63 / 64);
__publicField(BounceEasingFunction, "s_b0", 1 / _BounceEasingFunction.s_b1 / _BounceEasingFunction.s_b1);
class ExponentialEasingFunction {
  static In(t) {
    return ExponentialEasingFunction.Tpmt(1 - +t);
  }
  static Out(t) {
    return 1 - ExponentialEasingFunction.Tpmt(t);
  }
  static InOut(t) {
    return ((t *= 2) <= 1 ? ExponentialEasingFunction.Tpmt(1 - t) : 2 - ExponentialEasingFunction.Tpmt(t - 1)) / 2;
  }
  static Tpmt(x) {
    {
      return (Math.pow(2, -10 * x) - 9765625e-10) * 1.0009775171065494;
    }
  }
}
class CubicEasingFunction {
  static In(t) {
    return t * t * t;
  }
  static Out(t) {
    return --t * t * t + 1;
  }
  static InOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }
}
class DelayedFunction {
  constructor(baseFunction, point, perPointDelay = 10) {
    __privateAdd(this, _Function, void 0);
    __privateAdd(this, _Speed, System.TimeSpan.Empty.Clone());
    point.Context.Visual;
    let chart = point.Context.Chart;
    let delay = point.Context.Index * perPointDelay;
    let speed = chart.AnimationsSpeed.TotalMilliseconds + delay;
    let d = delay / speed;
    this.Function = (p) => {
      if (p <= d)
        return 0;
      let p2 = (p - d) / (1 - d);
      return baseFunction(p2);
    };
    this.Speed = System.TimeSpan.FromMilliseconds(speed);
  }
  get Function() {
    return __privateGet(this, _Function);
  }
  set Function(value) {
    __privateSet(this, _Function, value);
  }
  get Speed() {
    return __privateGet(this, _Speed);
  }
  set Speed(value) {
    __privateSet(this, _Speed, value);
  }
}
_Function = new WeakMap();
_Speed = new WeakMap();
class KeyFrame {
  constructor() {
    __publicField(this, "Time", 0);
    __publicField(this, "Value", 0);
    __publicField(this, "EasingFunction", EasingFunctions.Lineal);
  }
}
class TransitionBuilder {
  constructor(target, properties) {
    __publicField(this, "_properties");
    __publicField(this, "_target");
    this._target = target;
    this._properties = properties;
  }
  WithAnimation(animation) {
    this._target.SetTransition(animation, ...this._properties);
    return this;
  }
  WithAnimationBuilder(animationBuilder) {
    let animation = new Animation();
    animationBuilder(animation);
    return this.WithAnimation(animation);
  }
  WithAnimationFromChart(chart) {
    return this.WithAnimation(new Animation().WithDuration(chart.View.AnimationsSpeed).WithEasingFunction(chart.View.EasingFunction));
  }
  CompleteCurrentTransitions() {
    this._target.CompleteTransition(...this._properties);
    return this;
  }
}
class LvcColor {
  constructor(red, green, blue, alpha = 255) {
    __publicField(this, "R", 0);
    __publicField(this, "G", 0);
    __publicField(this, "B", 0);
    __publicField(this, "A", 0);
    this.R = red;
    this.G = green;
    this.B = blue;
    this.A = alpha;
  }
  static get Empty() {
    return new LvcColor(255, 255, 255, 0);
  }
  static op_Equality(left, right) {
    return left.R == right.R && left.G == right.G && left.B == right.B && left.A == right.A;
  }
  static op_Inequality(left, right) {
    return !System.OpEquality(left, right);
  }
  static FromArgb(alpha, red, green, blue) {
    return new LvcColor(red, green, blue, alpha);
  }
  static FromColorWithAlpha(alpha, color) {
    return new LvcColor(color.R, color.G, color.B, alpha);
  }
  Clone() {
    return new LvcColor(this.R, this.G, this.B, this.A);
  }
}
function IsInterfaceOfILabelGeometry(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_ILabelGeometry" in obj.constructor;
}
const _LvcRectangle = class {
  constructor(location, size) {
    __publicField(this, "Location", LvcPoint.Empty.Clone());
    __publicField(this, "Size", LvcSize.Empty.Clone());
    this.Location = location.Clone();
    this.Size = size.Clone();
  }
  get X() {
    return this.Location.X;
  }
  get Y() {
    return this.Location.Y;
  }
  get Width() {
    return this.Size.Width;
  }
  get Height() {
    return this.Size.Height;
  }
  static op_Equality(left, right) {
    return System.OpEquality(left.Location, right.Location) && System.OpEquality(left.Size, right.Size);
  }
  static op_Inequality(left, right) {
    return !System.OpEquality(left, right);
  }
  Clone() {
    return new _LvcRectangle(new LvcPoint(this.Location.X, this.Location.Y), new LvcSize(this.Size.Width, this.Size.Height));
  }
};
let LvcRectangle = _LvcRectangle;
__publicField(LvcRectangle, "Empty", new _LvcRectangle(new LvcPoint(0, 0), new LvcSize(0, 0)).Clone());
class LvcPointD {
  constructor(x, y) {
    __publicField(this, "X", 0);
    __publicField(this, "Y", 0);
    this.X = x;
    this.Y = y;
  }
  static op_Equality(l, r) {
    return l.X == r.X && l.Y == r.Y;
  }
  static op_Inequality(l, r) {
    return !System.OpEquality(l, r);
  }
}
class StepLineVisualPoint {
  constructor(visualFactory) {
    __publicField(this, "Geometry");
    __publicField(this, "StepSegment", new StepLineSegment());
    __publicField(this, "FillPath");
    __publicField(this, "StrokePath");
    this.Geometry = visualFactory();
  }
  get MainGeometry() {
    return this.Geometry?.MainGeometry;
  }
}
class BezierVisualPoint {
  constructor(geometry) {
    __publicField(this, "Geometry");
    __publicField(this, "Bezier", new CubicBezierSegment());
    __publicField(this, "FillPath");
    __publicField(this, "StrokePath");
    this.Geometry = geometry;
  }
  get MainGeometry() {
    return this.Geometry?.MainGeometry;
  }
}
var Align = /* @__PURE__ */ ((Align2) => {
  Align2[Align2["Start"] = 0] = "Start";
  Align2[Align2["End"] = 1] = "End";
  Align2[Align2["Middle"] = 2] = "Middle";
  return Align2;
})(Align || {});
function IsInterfaceOfIAnimatable(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_IAnimatable" in obj.constructor;
}
class DrawingContext {
  OnBegingDraw() {
  }
  OnEndDraw() {
  }
}
const _Padding = class {
  constructor(left, top, right, bottom) {
    __publicField(this, "Left", 0);
    __publicField(this, "Right", 0);
    __publicField(this, "Top", 0);
    __publicField(this, "Bottom", 0);
    this.Left = left;
    this.Top = top;
    this.Right = right;
    this.Bottom = bottom;
  }
  static All(padding) {
    return new _Padding(padding, padding, padding, padding);
  }
};
let Padding = _Padding;
__publicField(Padding, "Default", new _Padding(0, 0, 0, 0));
function IsInterfaceOfIRoundedRectangleChartPoint(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_IRoundedRectangleChartPoint" in obj.constructor;
}
const _LvcSize = class {
  constructor(width = 0, height = 0) {
    __publicField(this, "Width", 0);
    __publicField(this, "Height", 0);
    this.Width = width;
    this.Height = height;
  }
  static op_Equality(left, right) {
    return left.Width == right.Width && left.Height == right.Height;
  }
  static op_Inequality(left, right) {
    return !System.OpEquality(left, right);
  }
  Clone() {
    return new _LvcSize(this.Width, this.Height);
  }
};
let LvcSize = _LvcSize;
__publicField(LvcSize, "Empty", new _LvcSize(0, 0));
const _LvcPoint = class {
  constructor(x = 0, y = 0) {
    __publicField(this, "X", 0);
    __publicField(this, "Y", 0);
    this.X = x;
    this.Y = y;
  }
  static op_Equality(l, r) {
    return l.X == r.X && l.Y == r.Y;
  }
  static op_Inequality(l, r) {
    return !System.OpEquality(l, r);
  }
  Clone() {
    return new _LvcPoint(this.X, this.Y);
  }
};
let LvcPoint = _LvcPoint;
__publicField(LvcPoint, "Empty", new _LvcPoint(0, 0));
class Animation {
  constructor() {
    __publicField(this, "_duration", 0n);
    __publicField(this, "_animationCompletedCount", 0);
    __publicField(this, "_repeatTimes", 0);
    __publicField(this, "EasingFunction");
    this.EasingFunction = (t) => t;
  }
  get Duration() {
    return this._duration;
  }
  set Duration(value) {
    this._duration = value;
  }
  get Repeat() {
    return this._repeatTimes;
  }
  set Repeat(value) {
    this._repeatTimes = value;
  }
  WithEasingFunction(easing) {
    this.EasingFunction = easing;
    return this;
  }
  WithDuration(duration) {
    this._duration = BigInt(duration.TotalMilliseconds.toFixed(0));
    return this;
  }
  RepeatTimes(times) {
    this._repeatTimes = times;
    return this;
  }
  RepeatIndefinitely() {
    this._repeatTimes = 2147483647;
    return this;
  }
}
var ContainerOrientation = /* @__PURE__ */ ((ContainerOrientation2) => {
  ContainerOrientation2[ContainerOrientation2["Horizontal"] = 0] = "Horizontal";
  ContainerOrientation2[ContainerOrientation2["Vertical"] = 1] = "Vertical";
  return ContainerOrientation2;
})(ContainerOrientation || {});
var VectorClosingMethod = /* @__PURE__ */ ((VectorClosingMethod2) => {
  VectorClosingMethod2[VectorClosingMethod2["NotClosed"] = 0] = "NotClosed";
  VectorClosingMethod2[VectorClosingMethod2["CloseToPivot"] = 1] = "CloseToPivot";
  VectorClosingMethod2[VectorClosingMethod2["CloseToStart"] = 2] = "CloseToStart";
  return VectorClosingMethod2;
})(VectorClosingMethod || {});
class Animatable {
  constructor() {
    __publicField(this, "IsValid", true);
    __publicField(this, "CurrentTime", BigInt("-9223372036854775808"));
    __publicField(this, "RemoveOnCompleted", false);
  }
  get MotionProperties() {
    return new System.Dictionary();
  }
  SetTransition(animation, ...propertyName) {
    let a = animation?.Duration == 0n ? null : animation;
    if (propertyName == null || propertyName.length == 0)
      propertyName = this.MotionProperties.Keys.ToArray();
    for (const name of propertyName) {
      this.MotionProperties.GetAt(name).Animation = a;
    }
  }
  RemoveTransition(...propertyName) {
    if (propertyName == null || propertyName.length == 0)
      propertyName = this.MotionProperties.Keys.ToArray();
    for (const name of propertyName) {
      this.MotionProperties.GetAt(name).Animation = null;
    }
  }
  CompleteTransition(...propertyName) {
    if (propertyName == null || propertyName.length == 0)
      propertyName = this.MotionProperties.Keys.ToArray();
    for (const property of propertyName) {
      let transitionProperty;
      if (!this.MotionProperties.TryGetValue(property, new System.Out(() => transitionProperty, ($v) => transitionProperty = $v)))
        throw new System.Exception(`The property ${property} is not a transition property of this instance.`);
      if (transitionProperty.Animation == null)
        continue;
      transitionProperty.IsCompleted = true;
    }
  }
  RegisterMotionProperty(motionProperty) {
    this.MotionProperties.SetAt(motionProperty.PropertyName, motionProperty);
    return motionProperty;
  }
}
__publicField(Animatable, "$meta_LiveChartsCore_IAnimatable", true);
class ConditionalPaintBuilder {
  constructor(series, paint) {
    __publicField(this, "_isPaintInCanvas", false);
    __publicField(this, "_clipFor", {});
    __publicField(this, "_series");
    __publicField(this, "_paint");
    __publicField(this, "_whenPredicate");
    this._series = series;
    this._paint = paint;
  }
  When(predicate) {
    this._whenPredicate = predicate;
    this._series.PointMeasured.Add(this.OnMeasured, this);
    return this._series;
  }
  Unsubscribe() {
    this._series.PointMeasured.Remove(this.OnMeasured, this);
  }
  OnMeasured(point) {
    if (this._whenPredicate == null || point.Visual == null)
      return;
    let isTriggered = this._whenPredicate.call(this, point);
    let canvas = point.Context.Chart.CoreChart.Canvas;
    let drawable = point.Visual.MainGeometry;
    if (drawable == null)
      return;
    if (!this._isPaintInCanvas) {
      canvas.AddDrawableTask(this._paint);
      this._isPaintInCanvas = true;
    }
    if (point.Context.Chart.CoreChart.MeasureWork != this._clipFor) {
      this._clipFor = point.Context.Chart.CoreChart.MeasureWork;
      if (point.Context.Chart.CoreChart instanceof CartesianChart) {
        const cartesianChart = point.Context.Chart.CoreChart;
        let drawLocation = cartesianChart.DrawMarginLocation.Clone();
        let drawMarginSize = cartesianChart.DrawMarginSize.Clone();
        this._paint.SetClipRectangle(cartesianChart.Canvas, new LvcRectangle(drawLocation.Clone(), drawMarginSize.Clone()));
      }
    }
    if (isTriggered) {
      this._paint.AddGeometryToPaintTask(canvas, drawable);
      for (const paint of this._series.GetPaintTasks()) {
        if (paint == null)
          continue;
        paint.RemoveGeometryFromPainTask(canvas, drawable);
      }
    } else {
      this._paint.RemoveGeometryFromPainTask(canvas, drawable);
    }
  }
}
class ConditionalDrawExtensions {
  static WithConditionalPaint(series, paint) {
    return new ConditionalPaintBuilder(series, paint);
  }
}
class CoreMap {
  constructor() {
    __privateAdd(this, _Layers, new System.Dictionary());
  }
  get Layers() {
    return __privateGet(this, _Layers);
  }
  set Layers(value) {
    __privateSet(this, _Layers, value);
  }
  FindLand(shortName, layerName = "default") {
    let land;
    return this.Layers.GetAt(layerName).Lands.TryGetValue(shortName, new System.Out(() => land, ($v) => land = $v)) ? land : null;
  }
  Dispose() {
    this.Layers.Clear();
  }
}
_Layers = new WeakMap();
__publicField(CoreMap, "$meta_System_IDisposable", true);
class MercatorProjector extends MapProjector {
  constructor(mapWidth, mapHeight, offsetX, offsetY) {
    super();
    __publicField(this, "_w");
    __publicField(this, "_h");
    __publicField(this, "_ox");
    __publicField(this, "_oy");
    this._w = mapWidth;
    this._h = mapHeight;
    this._ox = offsetX;
    this._oy = offsetY;
    this.XOffset = this._ox;
    this.YOffset = this._oy;
    this.MapWidth = mapWidth;
    this.MapHeight = mapHeight;
  }
  static get PreferredRatio() {
    return new Float32Array([1, 1]);
  }
  ToMap(point) {
    let lat = point[1];
    let lon = point[0];
    let latRad = lat * Math.PI / 180;
    let mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    let y = this._h / 2 - this._h * mercN / (2 * Math.PI);
    return new Float32Array([
      (lon + 180) * (this._w / 360) + this._ox,
      y + this._oy
    ]);
  }
}
class MapProjector {
  constructor() {
    __privateAdd(this, _MapWidth, 0);
    __privateAdd(this, _MapHeight, 0);
    __privateAdd(this, _XOffset, 0);
    __privateAdd(this, _YOffset, 0);
  }
  get MapWidth() {
    return __privateGet(this, _MapWidth);
  }
  set MapWidth(value) {
    __privateSet(this, _MapWidth, value);
  }
  get MapHeight() {
    return __privateGet(this, _MapHeight);
  }
  set MapHeight(value) {
    __privateSet(this, _MapHeight, value);
  }
  get XOffset() {
    return __privateGet(this, _XOffset);
  }
  set XOffset(value) {
    __privateSet(this, _XOffset, value);
  }
  get YOffset() {
    return __privateGet(this, _YOffset);
  }
  set YOffset(value) {
    __privateSet(this, _YOffset, value);
  }
}
_MapWidth = new WeakMap();
_MapHeight = new WeakMap();
_XOffset = new WeakMap();
_YOffset = new WeakMap();
class Maps {
  static BuildProjector(projection, mapWidth, mapHeight) {
    let mapRatio = projection == MapProjection.Default ? ControlCoordinatesProjector.PreferredRatio : MercatorProjector.PreferredRatio;
    let normalizedW = mapWidth / mapRatio[0];
    let normalizedH = mapHeight / mapRatio[1];
    let ox = 0;
    let oy = 0;
    if (normalizedW < normalizedH) {
      let h = mapWidth * mapRatio[1] / mapRatio[0];
      oy = (mapHeight - h) * 0.5;
      mapHeight = h;
    } else {
      let w = mapHeight * mapRatio[0] / mapRatio[1];
      ox = (mapWidth - w) * 0.5;
      mapWidth = w;
    }
    return projection == MapProjection.Default ? new ControlCoordinatesProjector(mapWidth, mapHeight, ox, oy) : new MercatorProjector(mapWidth, mapHeight, ox, oy);
  }
}
class MultiPoligonGeometry {
  constructor() {
    __publicField(this, "Type");
    __publicField(this, "Coordinates");
  }
}
class GeoJsonFile {
  constructor() {
    __publicField(this, "Type");
    __publicField(this, "Features");
  }
}
class MapShapeContext {
  constructor(chart, heatPaint, heatStops, bounds) {
    __privateAdd(this, _Chart, void 0);
    __privateAdd(this, _HeatPaint, void 0);
    __privateAdd(this, _HeatStops, void 0);
    __privateAdd(this, _Bounds, void 0);
    this.Chart = chart;
    this.HeatPaint = heatPaint;
    this.HeatStops = heatStops;
    this.Bounds = bounds;
  }
  get Chart() {
    return __privateGet(this, _Chart);
  }
  set Chart(value) {
    __privateSet(this, _Chart, value);
  }
  get HeatPaint() {
    return __privateGet(this, _HeatPaint);
  }
  set HeatPaint(value) {
    __privateSet(this, _HeatPaint, value);
  }
  get HeatStops() {
    return __privateGet(this, _HeatStops);
  }
  set HeatStops(value) {
    __privateSet(this, _HeatStops, value);
  }
  get Bounds() {
    return __privateGet(this, _Bounds);
  }
  set Bounds(value) {
    __privateSet(this, _Bounds, value);
  }
}
_Chart = new WeakMap();
_HeatPaint = new WeakMap();
_HeatStops = new WeakMap();
_Bounds = new WeakMap();
class MapContext {
  constructor(core, view, map, projector) {
    __privateAdd(this, _CoreMap, void 0);
    __privateAdd(this, _MapFile, void 0);
    __privateAdd(this, _Projector, void 0);
    __privateAdd(this, _View2, void 0);
    this.CoreMap = core;
    this.MapFile = map;
    this.Projector = projector;
    this.View = view;
  }
  get CoreMap() {
    return __privateGet(this, _CoreMap);
  }
  set CoreMap(value) {
    __privateSet(this, _CoreMap, value);
  }
  get MapFile() {
    return __privateGet(this, _MapFile);
  }
  set MapFile(value) {
    __privateSet(this, _MapFile, value);
  }
  get Projector() {
    return __privateGet(this, _Projector);
  }
  set Projector(value) {
    __privateSet(this, _Projector, value);
  }
  get View() {
    return __privateGet(this, _View2);
  }
  set View(value) {
    __privateSet(this, _View2, value);
  }
}
_CoreMap = new WeakMap();
_MapFile = new WeakMap();
_Projector = new WeakMap();
_View2 = new WeakMap();
class ZoomOnPointerView {
  constructor(pivot, direction) {
    __privateAdd(this, _Pivot, LvcPoint.Empty.Clone());
    __privateAdd(this, _Direction, 0);
    this.Pivot = pivot.Clone();
    this.Direction = direction;
  }
  get Pivot() {
    return __privateGet(this, _Pivot);
  }
  set Pivot(value) {
    __privateSet(this, _Pivot, value);
  }
  get Direction() {
    return __privateGet(this, _Direction);
  }
  set Direction(value) {
    __privateSet(this, _Direction, value);
  }
}
_Pivot = new WeakMap();
_Direction = new WeakMap();
var MapProjection = /* @__PURE__ */ ((MapProjection2) => {
  MapProjection2[MapProjection2["Default"] = 0] = "Default";
  MapProjection2[MapProjection2["Mercator"] = 1] = "Mercator";
  return MapProjection2;
})(MapProjection || {});
class LandData {
  constructor(coordinates) {
    __publicField(this, "MaxBounds", new Float64Array([Number.MIN_VALUE, Number.MIN_VALUE]));
    __publicField(this, "MinBounds", new Float64Array([Number.MAX_VALUE, Number.MAX_VALUE]));
    __privateAdd(this, _BoundsHypotenuse, 0);
    __privateAdd(this, _Coordinates, void 0);
    __publicField(this, "Shape");
    let c = new System.List();
    for (const point of coordinates) {
      let x = point[0];
      let y = point[1];
      if (x > this.MaxBounds[0])
        this.MaxBounds[0] = x;
      if (x < this.MinBounds[0])
        this.MinBounds[0] = x;
      if (y > this.MaxBounds[1])
        this.MaxBounds[1] = y;
      if (y < this.MinBounds[1])
        this.MinBounds[1] = y;
      c.Add(new LvcPointD(x, y));
    }
    this.Coordinates = c.ToArray();
    this.BoundsHypotenuse = Math.sqrt(Math.pow(this.MaxBounds[0] - this.MinBounds[0], 2) + Math.pow(this.MaxBounds[1] - this.MinBounds[1], 2));
  }
  get BoundsHypotenuse() {
    return __privateGet(this, _BoundsHypotenuse);
  }
  set BoundsHypotenuse(value) {
    __privateSet(this, _BoundsHypotenuse, value);
  }
  get Coordinates() {
    return __privateGet(this, _Coordinates);
  }
  set Coordinates(value) {
    __privateSet(this, _Coordinates, value);
  }
}
_BoundsHypotenuse = new WeakMap();
_Coordinates = new WeakMap();
class LandDefinition {
  constructor(shortName, name, setOf) {
    __privateAdd(this, _ShortName, "");
    __privateAdd(this, _Name, "");
    __publicField(this, "SetOf", "");
    __privateAdd(this, _HSize, 0);
    __privateAdd(this, _HCenter, 0);
    __publicField(this, "MaxBounds", new Float64Array([Number.MIN_VALUE, Number.MIN_VALUE]));
    __publicField(this, "MinBounds", new Float64Array([Number.MAX_VALUE, Number.MAX_VALUE]));
    __publicField(this, "Data", []);
    this.Name = name;
    this.ShortName = shortName;
    this.SetOf = setOf;
  }
  get ShortName() {
    return __privateGet(this, _ShortName);
  }
  set ShortName(value) {
    __privateSet(this, _ShortName, value);
  }
  get Name() {
    return __privateGet(this, _Name);
  }
  set Name(value) {
    __privateSet(this, _Name, value);
  }
  get HSize() {
    return __privateGet(this, _HSize);
  }
  set HSize(value) {
    __privateSet(this, _HSize, value);
  }
  get HCenter() {
    return __privateGet(this, _HCenter);
  }
  set HCenter(value) {
    __privateSet(this, _HCenter, value);
  }
}
_ShortName = new WeakMap();
_Name = new WeakMap();
_HSize = new WeakMap();
_HCenter = new WeakMap();
class GeoJsonFeature {
  constructor() {
    __publicField(this, "Type");
    __publicField(this, "Properties");
    __publicField(this, "Geometry");
  }
}
class ControlCoordinatesProjector extends MapProjector {
  constructor(mapWidth, mapHeight, offsetX, offsetY) {
    super();
    __publicField(this, "_w");
    __publicField(this, "_h");
    __publicField(this, "_ox");
    __publicField(this, "_oy");
    this._w = mapWidth;
    this._h = mapHeight;
    this._ox = offsetX;
    this._oy = offsetY;
    this.XOffset = this._ox;
    this.YOffset = this._oy;
    this.MapWidth = mapWidth;
    this.MapHeight = mapHeight;
  }
  static get PreferredRatio() {
    return new Float32Array([2, 1]);
  }
  ToMap(point) {
    return new Float32Array([
      this._ox + (point[0] + 180) / 360 * this._w,
      this._oy + (90 - point[1]) / 180 * this._h
    ]);
  }
}
class MapLayer {
  constructor(layerName, stroke, fill) {
    __publicField(this, "Name", "");
    __publicField(this, "ProcessIndex", 0);
    __publicField(this, "IsVisible", true);
    __publicField(this, "Stroke");
    __publicField(this, "Fill");
    __publicField(this, "Max", new Float64Array());
    __publicField(this, "Min", new Float64Array());
    __privateAdd(this, _Lands, new System.Dictionary());
    __publicField(this, "AddLandWhen");
    this.Name = layerName;
    this.Stroke = stroke;
    this.Fill = fill;
  }
  get Lands() {
    return __privateGet(this, _Lands);
  }
  set Lands(value) {
    __privateSet(this, _Lands, value);
  }
}
_Lands = new WeakMap();
class MotionProperty {
  constructor(propertyName) {
    __publicField(this, "fromValue", null);
    __publicField(this, "toValue", null);
    __publicField(this, "_startTime", 0n);
    __publicField(this, "_endTime", 0n);
    __publicField(this, "_requiresToInitialize", true);
    __publicField(this, "Animation");
    __privateAdd(this, _PropertyName, "");
    __publicField(this, "IsCompleted", false);
    this.PropertyName = propertyName;
  }
  get FromValue() {
    return this.fromValue;
  }
  get ToValue() {
    return this.toValue;
  }
  get PropertyName() {
    return __privateGet(this, _PropertyName);
  }
  set PropertyName(value) {
    __privateSet(this, _PropertyName, value);
  }
  CopyFrom(source) {
    let typedSource = source;
    this.fromValue = typedSource.FromValue;
    this.toValue = typedSource.ToValue;
    this._startTime = typedSource._startTime;
    this._endTime = typedSource._endTime;
    this._requiresToInitialize = typedSource._requiresToInitialize;
    this.Animation = typedSource.Animation;
    this.IsCompleted = typedSource.IsCompleted;
  }
  SetMovement(value, animatable) {
    this.fromValue = this.GetMovement(animatable);
    this.toValue = value;
    if (this.Animation != null) {
      if (animatable.CurrentTime == BigInt("-9223372036854775808")) {
        this._requiresToInitialize = true;
      } else {
        this._startTime = animatable.CurrentTime;
        this._endTime = animatable.CurrentTime + this.Animation._duration;
      }
      this.Animation._animationCompletedCount = 0;
      this.IsCompleted = false;
      this._requiresToInitialize = true;
    }
    animatable.IsValid = false;
  }
  GetMovement(animatable) {
    let fromValueIsNull = this.fromValue == null;
    if (this.Animation == null || this.Animation.EasingFunction == null || fromValueIsNull || this.IsCompleted)
      return this.OnGetMovement(1);
    if (this._requiresToInitialize || this._startTime == BigInt("-9223372036854775808")) {
      this._startTime = animatable.CurrentTime;
      this._endTime = animatable.CurrentTime + this.Animation._duration;
      this._requiresToInitialize = false;
    }
    animatable.IsValid = false;
    let t1 = Number(animatable.CurrentTime - this._startTime);
    let t2 = Number(this._endTime - this._startTime);
    let p = t1 / t2;
    if (p >= 1) {
      p = 1;
      this.Animation._animationCompletedCount++;
      this.IsCompleted = this.Animation._repeatTimes != 2147483647 && this.Animation._repeatTimes < this.Animation._animationCompletedCount;
      if (!this.IsCompleted) {
        this._startTime = animatable.CurrentTime;
        this._endTime = animatable.CurrentTime + this.Animation._duration;
        this.IsCompleted = false;
      }
    }
    let fp = this.Animation.EasingFunction(p);
    return this.OnGetMovement(fp);
  }
  GetCurrentValue(animatable) {
    {
      let t1 = Number(animatable.CurrentTime - this._startTime);
      let t2 = Number(this._endTime - this._startTime);
      let p = t1 / t2;
      if (p >= 1)
        p = 1;
      if (animatable.CurrentTime == BigInt("-9223372036854775808"))
        p = 0;
      let fp = this.Animation?.EasingFunction?.call(this, p) ?? 1;
      return this.OnGetMovement(fp);
    }
  }
}
_PropertyName = new WeakMap();
class PointMotionProperty extends MotionProperty {
  constructor(propertyName, value) {
    super(propertyName);
    this.fromValue = value.Clone();
    this.toValue = value.Clone();
  }
  OnGetMovement(progress) {
    return new LvcPoint(this.fromValue.X + progress * (this.toValue.X - this.fromValue.X), this.fromValue.Y + progress * (this.toValue.Y - this.fromValue.Y));
  }
}
class MotionCanvas {
  constructor() {
    __publicField(this, "_stopwatch", new System.Stopwatch());
    __publicField(this, "_paintTasks", new System.HashSet());
    __publicField(this, "_fpsStack", new System.List());
    __publicField(this, "_previousFrameTime", 0n);
    __publicField(this, "_previousLogTime", 0n);
    __publicField(this, "_sync", {});
    __publicField(this, "DisableAnimations", false);
    __publicField(this, "StartPoint");
    __publicField(this, "Invalidated", new System.Event());
    __publicField(this, "Validated", new System.Event());
    __privateAdd(this, _IsValid, false);
    this._stopwatch.Start();
  }
  get IsValid() {
    return __privateGet(this, _IsValid);
  }
  set IsValid(value) {
    __privateSet(this, _IsValid, value);
  }
  get Sync() {
    return this._sync;
  }
  get Trackers() {
    return new System.HashSet();
  }
  DrawFrame(context) {
    {
      context.OnBegingDraw();
      let isValid = true;
      let frameTime = this._stopwatch.ElapsedMilliseconds;
      let toRemoveGeometries = new System.List();
      for (const task of this._paintTasks.OrderBy((x) => x.ZIndex)) {
        if (this.DisableAnimations)
          task.CompleteTransition(null);
        task.IsValid = true;
        task.CurrentTime = frameTime;
        task.InitializeTask(context);
        for (const geometry of task.GetGeometries(this)) {
          if (geometry == null)
            continue;
          if (this.DisableAnimations)
            geometry.CompleteTransition(null);
          geometry.IsValid = true;
          geometry.CurrentTime = frameTime;
          if (!task.IsPaused)
            geometry.Draw(context);
          isValid = isValid && geometry.IsValid;
          if (geometry.IsValid && geometry.RemoveOnCompleted)
            toRemoveGeometries.Add(new System.Tuple2(task, geometry));
        }
        isValid = isValid && task.IsValid;
        if (task.RemoveOnCompleted && task.IsValid)
          this._paintTasks.Remove(task);
        task.Dispose();
      }
      for (const tracker of this.Trackers) {
        tracker.IsValid = true;
        tracker.CurrentTime = frameTime;
        isValid = isValid && tracker.IsValid;
      }
      for (const tuple of toRemoveGeometries) {
        tuple.Item1.RemoveGeometryFromPainTask(this, tuple.Item2);
        isValid = false;
      }
      this._previousFrameTime = frameTime;
      this.IsValid = isValid;
      context.OnEndDraw();
    }
    if (this.IsValid)
      this.Validated.Invoke(this);
  }
  get DrawablesCount() {
    return this._paintTasks.length;
  }
  Invalidate() {
    this.IsValid = false;
    this.Invalidated.Invoke(this);
  }
  AddDrawableTask(task) {
    this._paintTasks.Add(task);
  }
  SetPaintTasks(tasks) {
    this._paintTasks = tasks;
  }
  RemovePaintTask(task) {
    task.ReleaseCanvas(this);
    this._paintTasks.Remove(task);
  }
  Clear() {
    for (const task of this._paintTasks)
      task.ReleaseCanvas(this);
    this._paintTasks.Clear();
    this.Invalidate();
  }
  CountGeometries() {
    let count = 0;
    for (const task of this._paintTasks)
      for (const geometry of task.GetGeometries(this))
        count++;
    return count;
  }
  Dispose() {
    for (const task of this._paintTasks)
      task.ReleaseCanvas(this);
    this._paintTasks.Clear();
    this.Trackers.Clear();
    this.IsValid = true;
  }
}
_IsValid = new WeakMap();
__publicField(MotionCanvas, "$meta_System_IDisposable", true);
class FloatMotionProperty extends MotionProperty {
  constructor(propertyName, value = 0) {
    super(propertyName);
    this.fromValue = value;
    this.toValue = value;
  }
  OnGetMovement(progress) {
    return this.fromValue + progress * (this.toValue - this.fromValue);
  }
}
class DoubleMotionProperty extends MotionProperty {
  constructor(propertyName, value = 0) {
    super(propertyName);
    this.fromValue = value;
    this.toValue = value;
  }
  OnGetMovement(progress) {
    return this.fromValue + progress * (this.toValue - this.fromValue);
  }
}
class ColorMotionProperty extends MotionProperty {
  constructor(propertyName, value = null) {
    super(propertyName);
    if (value) {
      this.fromValue = value.Clone();
      this.toValue = value.Clone();
    } else {
      this.fromValue = new LvcColor(0, 0, 0, 0);
      this.toValue = new LvcColor(0, 0, 0, 0);
    }
  }
  OnGetMovement(progress) {
    return System.OpEquality(this.toValue, LvcColor.Empty) ? LvcColor.Empty : LvcColor.FromArgb(Math.floor(this.fromValue.A + progress * (this.toValue.A - this.fromValue.A)) & 255, Math.floor(this.fromValue.R + progress * (this.toValue.R - this.fromValue.R)) & 255, Math.floor(this.fromValue.G + progress * (this.toValue.G - this.fromValue.G)) & 255, Math.floor(this.fromValue.B + progress * (this.toValue.B - this.fromValue.B)) & 255);
  }
}
class AnimatableContainer extends Animatable {
  constructor() {
    super();
    __publicField(this, "_locationProperty");
    __publicField(this, "_sizeMotionProperty");
    __privateAdd(this, _HasPreviousState, false);
    this._locationProperty = this.RegisterMotionProperty(new PointMotionProperty("Location", new LvcPoint()));
    this._sizeMotionProperty = this.RegisterMotionProperty(new SizeMotionProperty("Size", new LvcSize()));
  }
  get Location() {
    return this._locationProperty.GetMovement(this);
  }
  set Location(value) {
    this._locationProperty.SetMovement(value.Clone(), this);
  }
  get Size() {
    return this._sizeMotionProperty.GetMovement(this);
  }
  set Size(value) {
    this._sizeMotionProperty.SetMovement(value.Clone(), this);
  }
  get HasPreviousState() {
    return __privateGet(this, _HasPreviousState);
  }
  set HasPreviousState(value) {
    __privateSet(this, _HasPreviousState, value);
  }
}
_HasPreviousState = new WeakMap();
class SizeMotionProperty extends MotionProperty {
  constructor(propertyName, value) {
    super(propertyName);
    this.fromValue = value.Clone();
    this.toValue = value.Clone();
  }
  OnGetMovement(progress) {
    return new LvcSize(this.fromValue.Width + progress * (this.toValue.Width - this.fromValue.Width), this.fromValue.Height + progress * (this.toValue.Height - this.fromValue.Height));
  }
}
class AnimatableAxisBounds extends Animatable {
  constructor() {
    super();
    __publicField(this, "_maxLimitProperty");
    __publicField(this, "_minLimitProperty");
    __publicField(this, "_maxDataBoundProperty");
    __publicField(this, "_minDataBoundProperty");
    __publicField(this, "_maxVisibleBoundProperty");
    __publicField(this, "_minVisibleBoundProperty");
    __privateAdd(this, _HasPreviousState2, false);
    this._maxLimitProperty = this.RegisterMotionProperty(new NullableDoubleMotionProperty("MaxLimit", null));
    this._minLimitProperty = this.RegisterMotionProperty(new NullableDoubleMotionProperty("MinLimit", null));
    this._maxDataBoundProperty = this.RegisterMotionProperty(new DoubleMotionProperty("MaxDataBound", 0));
    this._minDataBoundProperty = this.RegisterMotionProperty(new DoubleMotionProperty("MinDataBound", 0));
    this._maxVisibleBoundProperty = this.RegisterMotionProperty(new DoubleMotionProperty("MaxVisibleBound", 0));
    this._minVisibleBoundProperty = this.RegisterMotionProperty(new DoubleMotionProperty("MinVisibleBound", 0));
  }
  get MaxLimit() {
    return this._maxLimitProperty.GetMovement(this);
  }
  set MaxLimit(value) {
    this._maxLimitProperty.SetMovement(value, this);
  }
  get MinLimit() {
    return this._minLimitProperty.GetMovement(this);
  }
  set MinLimit(value) {
    this._minLimitProperty.SetMovement(value, this);
  }
  get MaxDataBound() {
    return this._maxDataBoundProperty.GetMovement(this);
  }
  set MaxDataBound(value) {
    this._maxDataBoundProperty.SetMovement(value, this);
  }
  get MinDataBound() {
    return this._minDataBoundProperty.GetMovement(this);
  }
  set MinDataBound(value) {
    this._minDataBoundProperty.SetMovement(value, this);
  }
  get MaxVisibleBound() {
    return this._maxVisibleBoundProperty.GetMovement(this);
  }
  set MaxVisibleBound(value) {
    this._maxVisibleBoundProperty.SetMovement(value, this);
  }
  get MinVisibleBound() {
    return this._minVisibleBoundProperty.GetMovement(this);
  }
  set MinVisibleBound(value) {
    this._minVisibleBoundProperty.SetMovement(value, this);
  }
  get HasPreviousState() {
    return __privateGet(this, _HasPreviousState2);
  }
  set HasPreviousState(value) {
    __privateSet(this, _HasPreviousState2, value);
  }
}
_HasPreviousState2 = new WeakMap();
class NullableDoubleMotionProperty extends MotionProperty {
  constructor(propertyName, value) {
    super(propertyName);
    this.fromValue = value;
    this.toValue = value;
  }
  OnGetMovement(progress) {
    return this.fromValue == null || this.toValue == null ? this.toValue : this.fromValue + progress * (this.toValue - this.fromValue);
  }
}
class FinancialPoint {
  constructor(date, high, open, close, low) {
    __publicField(this, "_high");
    __publicField(this, "_open");
    __publicField(this, "_close");
    __publicField(this, "_low");
    __publicField(this, "_date", System.DateTime.Empty.Clone());
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate2, Coordinate.Empty);
    __publicField(this, "PropertyChanged", new System.Event());
    this.Date = date;
    this.High = high;
    this.Open = open;
    this.Close = close;
    this.Low = low;
  }
  get Date() {
    return this._date;
  }
  set Date(value) {
    this._date = value;
    this.OnPropertyChanged();
  }
  get High() {
    return this._high;
  }
  set High(value) {
    this._high = value;
    this.OnPropertyChanged();
  }
  get Open() {
    return this._open;
  }
  set Open(value) {
    this._open = value;
    this.OnPropertyChanged();
  }
  get Close() {
    return this._close;
  }
  set Close(value) {
    this._close = value;
    this.OnPropertyChanged();
  }
  get Low() {
    return this._low;
  }
  set Low(value) {
    this._low = value;
    this.OnPropertyChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate2);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate2, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.Coordinate = this._open == null || this._high == null || this._low == null || this._close == null ? Coordinate.Empty : new Coordinate(this._high, Number(this._date.Ticks), this._open, this._close, this._low);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
_Coordinate2 = new WeakMap();
__publicField(FinancialPoint, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(FinancialPoint, "$meta_System_INotifyPropertyChanged", true);
class MappedChartEntity {
  constructor() {
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate3, Coordinate.Empty);
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate3);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate3, value);
  }
  UpdateCoordinate(chartPoint) {
    this.Coordinate = new Coordinate(chartPoint.PrimaryValue, chartPoint.SecondaryValue, chartPoint.TertiaryValue, chartPoint.QuaternaryValue, chartPoint.QuinaryValue);
  }
}
_Coordinate3 = new WeakMap();
__publicField(MappedChartEntity, "$meta_LiveChartsCore_IChartEntity", true);
class WeightedPoint {
  constructor(x, y, weight) {
    __publicField(this, "_x");
    __publicField(this, "_y");
    __publicField(this, "_weight");
    __publicField(this, "PropertyChanged", new System.Event());
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate4, Coordinate.Empty);
    this.X = x;
    this.Y = y;
    this.Weight = weight;
  }
  get X() {
    return this._x;
  }
  set X(value) {
    this._x = value;
    this.OnPropertyChanged();
  }
  get Y() {
    return this._y;
  }
  set Y(value) {
    this._y = value;
    this.OnPropertyChanged();
  }
  get Weight() {
    return this._weight;
  }
  set Weight(value) {
    this._weight = value;
    this.OnPropertyChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate4);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate4, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.Coordinate = this._x == null || this._y == null ? Coordinate.Empty : Coordinate.MakeByXY(this._x ?? 0, this._y ?? 0, this._weight ?? 0);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
_Coordinate4 = new WeakMap();
__publicField(WeightedPoint, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(WeightedPoint, "$meta_System_INotifyPropertyChanged", true);
class DateTimePoint {
  constructor(dateTime, value) {
    __publicField(this, "_dateTime", System.DateTime.Empty.Clone());
    __publicField(this, "_value");
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate5, Coordinate.Empty);
    __publicField(this, "PropertyChanged", new System.Event());
    this.DateTime = dateTime;
    this.Value = value;
    this.Coordinate = value == null ? Coordinate.Empty : Coordinate.MakeByXY(Number(dateTime.Ticks), value);
  }
  get DateTime() {
    return this._dateTime;
  }
  set DateTime(value) {
    this._dateTime = value;
    this.OnPropertyChanged();
  }
  get Value() {
    return this._value;
  }
  set Value(value) {
    this._value = value;
    this.OnPropertyChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate5);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate5, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.Coordinate = this._value == null ? Coordinate.Empty : Coordinate.MakeByXY(Number(this._dateTime.Ticks), this._value);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
_Coordinate5 = new WeakMap();
__publicField(DateTimePoint, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(DateTimePoint, "$meta_System_INotifyPropertyChanged", true);
class TimeSpanPoint {
  constructor(timeSpan, value) {
    __publicField(this, "_timeSpan", System.TimeSpan.Empty.Clone());
    __publicField(this, "_value");
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate6, Coordinate.Empty);
    __publicField(this, "PropertyChanged", new System.Event());
    this.TimeSpan = timeSpan;
    this.Value = value;
  }
  get TimeSpan() {
    return this._timeSpan;
  }
  set TimeSpan(value) {
    this._timeSpan = value;
    this.OnPropertyChanged();
  }
  get Value() {
    return this._value;
  }
  set Value(value) {
    this._value = value;
    this.OnPropertyChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate6);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate6, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.Coordinate = this._value == null ? Coordinate.Empty : Coordinate.MakeByXY(Number(this._timeSpan.Ticks), this._value ?? 0);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
_Coordinate6 = new WeakMap();
__publicField(TimeSpanPoint, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(TimeSpanPoint, "$meta_System_INotifyPropertyChanged", true);
class ObservablePoint {
  constructor(x, y) {
    __publicField(this, "_x");
    __publicField(this, "_y");
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate7, Coordinate.Empty);
    __publicField(this, "PropertyChanged", new System.Event());
    this.X = x;
    this.Y = y;
  }
  get X() {
    return this._x;
  }
  set X(value) {
    this._x = value;
    this.OnPropertyChanged();
  }
  get Y() {
    return this._y;
  }
  set Y(value) {
    this._y = value;
    this.OnPropertyChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate7);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate7, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.Coordinate = this._x == null || this._y == null ? Coordinate.Empty : Coordinate.MakeByXY(this._x, this._y);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
_Coordinate7 = new WeakMap();
__publicField(ObservablePoint, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(ObservablePoint, "$meta_System_INotifyPropertyChanged", true);
class ObservableValue {
  constructor(value) {
    __publicField(this, "_value");
    __publicField(this, "_entityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate8, Coordinate.Empty);
    __publicField(this, "PropertyChanged", new System.Event());
    this.Value = value;
  }
  get Value() {
    return this._value;
  }
  set Value(value) {
    this._value = value;
    this.OnPropertyChanged();
  }
  get EntityIndex() {
    return this._entityIndex;
  }
  set EntityIndex(value) {
    if (value == this._entityIndex)
      return;
    this._entityIndex = value;
    this.OnCoordinateChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate8);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate8, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.OnCoordinateChanged();
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
  OnCoordinateChanged() {
    this.Coordinate = this._value == null ? Coordinate.Empty : Coordinate.MakeByXY(this.EntityIndex, this._value);
  }
}
_Coordinate8 = new WeakMap();
__publicField(ObservableValue, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(ObservableValue, "$meta_System_INotifyPropertyChanged", true);
class ObservablePolarPoint {
  constructor(angle, radius) {
    __publicField(this, "_angle");
    __publicField(this, "_radius");
    __publicField(this, "EntityIndex", 0);
    __publicField(this, "ChartPoints");
    __privateAdd(this, _Coordinate9, Coordinate.Empty);
    __publicField(this, "PropertyChanged", new System.Event());
    this.Angle = angle;
    this.Radius = radius;
  }
  get Angle() {
    return this._angle;
  }
  set Angle(value) {
    this._angle = value;
    this.OnPropertyChanged();
  }
  get Radius() {
    return this._radius;
  }
  set Radius(value) {
    this._radius = value;
    this.OnPropertyChanged();
  }
  get Coordinate() {
    return __privateGet(this, _Coordinate9);
  }
  set Coordinate(value) {
    __privateSet(this, _Coordinate9, value);
  }
  OnPropertyChanged(propertyName = null) {
    this.Coordinate = this._radius == null || this._angle == null ? Coordinate.Empty : Coordinate.MakeByXY(this._angle, this._radius);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
_Coordinate9 = new WeakMap();
__publicField(ObservablePolarPoint, "$meta_LiveChartsCore_IChartEntity", true);
__publicField(ObservablePolarPoint, "$meta_System_INotifyPropertyChanged", true);
const _Scaler = class {
  constructor(minPx, maxPx, deltaPx, deltaVal, m, mInv, orientation) {
    __publicField(this, "_deltaVal");
    __publicField(this, "_m");
    __publicField(this, "_mInv");
    __publicField(this, "_minPx");
    __publicField(this, "_maxPx");
    __publicField(this, "_deltaPx");
    __publicField(this, "_orientation");
    __privateAdd(this, _MaxVal, 0);
    __privateAdd(this, _MinVal, 0);
    this._minPx = minPx;
    this._maxPx = maxPx;
    this._deltaPx = deltaPx;
    this._deltaVal = deltaVal;
    this._m = m;
    this._mInv = mInv;
    this._orientation = orientation;
  }
  static MakeDefault() {
    let minPx = 0;
    let maxPx = 100;
    let deltaPx = maxPx - minPx;
    let deltaVal = 0 - 100;
    let m = deltaPx / deltaVal;
    let mInv = 1 / m;
    return new _Scaler(minPx, maxPx, deltaPx, deltaVal, m, mInv, AxisOrientation.Unknown).Init({
      MaxVal: 0,
      MinVal: 100
    });
  }
  static Make(drawMarginLocation, drawMarginSize, axis, bounds = null) {
    if (axis.Orientation == AxisOrientation.Unknown)
      throw new System.Exception("The axis is not ready to be scaled.");
    let _orientation = axis.Orientation;
    let _deltaVal = 0;
    let _m = 0;
    let _mInv = 0;
    let _minPx = 0;
    let _maxPx = 0;
    let _deltaPx = 0;
    let MaxVal = 0;
    let MinVal = 0;
    let actualBounds = axis.DataBounds;
    let actualVisibleBounds = axis.VisibleDataBounds;
    let maxLimit = axis.MaxLimit;
    let minLimit = axis.MinLimit;
    if (bounds != null) {
      actualBounds = bounds;
      actualVisibleBounds = bounds;
      minLimit = null;
      maxLimit = null;
    }
    if (!Number.isFinite(actualBounds.Delta) || !Number.isFinite(actualVisibleBounds.Delta)) {
      MaxVal = 0;
      MinVal = 0;
      _deltaVal = 0;
      if (axis.Orientation == AxisOrientation.X) {
        _minPx = drawMarginLocation.X;
        _maxPx = drawMarginLocation.X + drawMarginSize.Width;
        _deltaPx = _maxPx - _minPx;
      } else {
        _minPx = drawMarginLocation.Y;
        _maxPx = drawMarginLocation.Y + drawMarginSize.Height;
        _deltaPx = _maxPx - _minPx;
      }
      _m = 0;
      _mInv = 0;
      return new _Scaler(_minPx, _maxPx, _deltaPx, _deltaVal, _m, _mInv, _orientation).Init({
        MaxVal,
        MinVal
      });
    }
    if (axis.Orientation == AxisOrientation.X) {
      _minPx = drawMarginLocation.X;
      _maxPx = drawMarginLocation.X + drawMarginSize.Width;
      _deltaPx = _maxPx - _minPx;
      MaxVal = axis.IsInverted ? actualBounds.Min : actualBounds.Max;
      MinVal = axis.IsInverted ? actualBounds.Max : actualBounds.Min;
      if (maxLimit != null || minLimit != null) {
        MaxVal = axis.IsInverted ? minLimit ?? MinVal : maxLimit ?? MaxVal;
        MinVal = axis.IsInverted ? maxLimit ?? MaxVal : minLimit ?? MinVal;
      } else {
        let visibleMax = axis.IsInverted ? actualVisibleBounds.Min : actualVisibleBounds.Max;
        let visibleMin = axis.IsInverted ? actualVisibleBounds.Max : actualVisibleBounds.Min;
        if (visibleMax != MaxVal || visibleMin != MinVal) {
          MaxVal = visibleMax;
          MinVal = visibleMin;
        }
      }
      _deltaVal = MaxVal - MinVal;
    } else {
      _minPx = drawMarginLocation.Y;
      _maxPx = drawMarginLocation.Y + drawMarginSize.Height;
      _deltaPx = _maxPx - _minPx;
      MaxVal = axis.IsInverted ? actualBounds.Max : actualBounds.Min;
      MinVal = axis.IsInverted ? actualBounds.Min : actualBounds.Max;
      if (maxLimit != null || minLimit != null) {
        MaxVal = axis.IsInverted ? maxLimit ?? MinVal : minLimit ?? MaxVal;
        MinVal = axis.IsInverted ? minLimit ?? MaxVal : maxLimit ?? MinVal;
      } else {
        let visibleMax = axis.IsInverted ? actualVisibleBounds.Max : actualVisibleBounds.Min;
        let visibleMin = axis.IsInverted ? actualVisibleBounds.Min : actualVisibleBounds.Max;
        if (visibleMax != MaxVal || visibleMin != MinVal) {
          MaxVal = visibleMax;
          MinVal = visibleMin;
        }
      }
      _deltaVal = MaxVal - MinVal;
    }
    _m = _deltaPx / _deltaVal;
    _mInv = 1 / _m;
    if (!Number.isNaN(_m) && !!Number.isFinite(_m))
      return new _Scaler(_minPx, _maxPx, _deltaPx, _deltaVal, _m, _mInv, _orientation).Init({
        MaxVal,
        MinVal
      });
    _m = 0;
    _mInv = 0;
    return new _Scaler(_minPx, _maxPx, _deltaPx, _deltaVal, _m, _mInv, _orientation).Init({
      MaxVal,
      MinVal
    });
  }
  get MaxVal() {
    return __privateGet(this, _MaxVal);
  }
  set MaxVal(value) {
    __privateSet(this, _MaxVal, value);
  }
  get MinVal() {
    return __privateGet(this, _MinVal);
  }
  set MinVal(value) {
    __privateSet(this, _MinVal, value);
  }
  MeasureInPixels(value) {
    {
      return Math.abs(this._orientation == AxisOrientation.X ? this._minPx + (value - this.MinVal) * this._m - (this._minPx + (0 - this.MinVal) * this._m) : this._minPx + (0 - this.MinVal) * this._m - (this._minPx + (value - this.MinVal) * this._m));
    }
  }
  ToPixels(value) {
    return this._minPx + (value - this.MinVal) * this._m;
  }
  ToChartValues(pixels) {
    return this.MinVal + (pixels - this._minPx) * this._mInv;
  }
};
let Scaler = _Scaler;
_MaxVal = new WeakMap();
_MinVal = new WeakMap();
var MeasureUnit = /* @__PURE__ */ ((MeasureUnit2) => {
  MeasureUnit2[MeasureUnit2["Pixels"] = 0] = "Pixels";
  MeasureUnit2[MeasureUnit2["ChartValues"] = 1] = "ChartValues";
  return MeasureUnit2;
})(MeasureUnit || {});
var PolarAxisOrientation = /* @__PURE__ */ ((PolarAxisOrientation2) => {
  PolarAxisOrientation2[PolarAxisOrientation2["Unknown"] = 0] = "Unknown";
  PolarAxisOrientation2[PolarAxisOrientation2["Angle"] = 1] = "Angle";
  PolarAxisOrientation2[PolarAxisOrientation2["Radius"] = 2] = "Radius";
  return PolarAxisOrientation2;
})(PolarAxisOrientation || {});
class Margin {
  constructor(left, top, right, bottom) {
    __publicField(this, "Left", 0);
    __publicField(this, "Top", 0);
    __publicField(this, "Right", 0);
    __publicField(this, "Bottom", 0);
    this.Left = left;
    this.Top = top;
    this.Right = right;
    this.Bottom = bottom;
  }
  static Empty() {
    return new Margin(0, 0, 0, 0);
  }
  static All(all) {
    return new Margin(all, all, all, all);
  }
  static get Auto() {
    return Number.NaN;
  }
  static IsAuto(value) {
    return Number.isNaN(value);
  }
}
var AxisOrientation = /* @__PURE__ */ ((AxisOrientation2) => {
  AxisOrientation2[AxisOrientation2["Unknown"] = 0] = "Unknown";
  AxisOrientation2[AxisOrientation2["X"] = 1] = "X";
  AxisOrientation2[AxisOrientation2["Y"] = 2] = "Y";
  return AxisOrientation2;
})(AxisOrientation || {});
var TooltipPosition = /* @__PURE__ */ ((TooltipPosition2) => {
  TooltipPosition2[TooltipPosition2["Hidden"] = 0] = "Hidden";
  TooltipPosition2[TooltipPosition2["Top"] = 1] = "Top";
  TooltipPosition2[TooltipPosition2["Bottom"] = 2] = "Bottom";
  TooltipPosition2[TooltipPosition2["Left"] = 3] = "Left";
  TooltipPosition2[TooltipPosition2["Right"] = 4] = "Right";
  TooltipPosition2[TooltipPosition2["Center"] = 5] = "Center";
  return TooltipPosition2;
})(TooltipPosition || {});
var TooltipFindingStrategy = /* @__PURE__ */ ((TooltipFindingStrategy2) => {
  TooltipFindingStrategy2[TooltipFindingStrategy2["Automatic"] = 0] = "Automatic";
  TooltipFindingStrategy2[TooltipFindingStrategy2["CompareAll"] = 1] = "CompareAll";
  TooltipFindingStrategy2[TooltipFindingStrategy2["CompareOnlyX"] = 2] = "CompareOnlyX";
  TooltipFindingStrategy2[TooltipFindingStrategy2["CompareOnlyY"] = 3] = "CompareOnlyY";
  TooltipFindingStrategy2[TooltipFindingStrategy2["CompareAllTakeClosest"] = 4] = "CompareAllTakeClosest";
  TooltipFindingStrategy2[TooltipFindingStrategy2["CompareOnlyXTakeClosest"] = 5] = "CompareOnlyXTakeClosest";
  TooltipFindingStrategy2[TooltipFindingStrategy2["CompareOnlyYTakeClosest"] = 6] = "CompareOnlyYTakeClosest";
  return TooltipFindingStrategy2;
})(TooltipFindingStrategy || {});
class StackPosition {
  constructor() {
    __publicField(this, "Stacker", new Stacker());
    __publicField(this, "Position", 0);
  }
  StackPoint(point) {
    return this.Stacker.StackPoint(point, this.Position);
  }
  GetStack(point) {
    return point.StackedValue = this.Stacker.GetStack(point, this.Position);
  }
}
class VectorManager {
  constructor(areaGeometry) {
    __publicField(this, "_nextNode");
    __publicField(this, "_currentNode");
    __privateAdd(this, _AreaGeometry, void 0);
    this.AreaGeometry = areaGeometry;
    this._nextNode = areaGeometry.FirstCommand;
  }
  get AreaGeometry() {
    return __privateGet(this, _AreaGeometry);
  }
  set AreaGeometry(value) {
    __privateSet(this, _AreaGeometry, value);
  }
  AddConsecutiveSegment(segment, followsPrevious) {
    while (this._nextNode != null && this._nextNode.Next != null && segment.Id >= this._nextNode.Next.Value.Id) {
      this._nextNode = this._nextNode.Next;
      if (this._nextNode.Previous == null)
        continue;
      this.AreaGeometry.RemoveCommand(this._nextNode.Previous);
    }
    if (this._nextNode == null) {
      if (this._currentNode != null && followsPrevious)
        segment.Follows(this._currentNode.Value);
      this._currentNode = this.AreaGeometry.AddLast(segment);
      return;
    }
    if (this._nextNode.Value.Id == segment.Id) {
      if (!System.Equals(this._nextNode.Value, segment)) {
        if (followsPrevious)
          segment.Follows(this._nextNode.Value);
        this._nextNode.Value = segment;
      }
      this._currentNode = this._nextNode;
      this._nextNode = this._currentNode.Next;
      return;
    }
    if (this._currentNode == null)
      this._currentNode = this._nextNode;
    if (followsPrevious)
      segment.Follows(this._currentNode.Value);
    this._currentNode = this.AreaGeometry.AddBefore(this._nextNode, segment);
    this._nextNode = this._currentNode.Next;
  }
  Clear() {
    this.AreaGeometry.ClearCommands();
  }
  End() {
    while (this._currentNode?.Next != null) {
      this.AreaGeometry.RemoveCommand(this._currentNode.Next);
    }
  }
  LogPath() {
    let a = "";
    let c = this.AreaGeometry.FirstCommand;
    while (c != null) {
      a += `${c.Value.Id}, `;
      c = c.Next;
    }
  }
}
_AreaGeometry = new WeakMap();
class SeriesBounds {
  constructor(bounds, isPrevious) {
    __publicField(this, "_isPrevious");
    __privateAdd(this, _Bounds2, void 0);
    this.Bounds = bounds;
    this._isPrevious = this.HasData;
  }
  get Bounds() {
    return __privateGet(this, _Bounds2);
  }
  set Bounds(value) {
    __privateSet(this, _Bounds2, value);
  }
  get HasData() {
    return this._isPrevious || this.Bounds.IsEmpty;
  }
}
_Bounds2 = new WeakMap();
var DataLabelsPosition = /* @__PURE__ */ ((DataLabelsPosition2) => {
  DataLabelsPosition2[DataLabelsPosition2["End"] = 0] = "End";
  DataLabelsPosition2[DataLabelsPosition2["Start"] = 1] = "Start";
  DataLabelsPosition2[DataLabelsPosition2["Middle"] = 2] = "Middle";
  DataLabelsPosition2[DataLabelsPosition2["Top"] = 3] = "Top";
  DataLabelsPosition2[DataLabelsPosition2["Bottom"] = 4] = "Bottom";
  DataLabelsPosition2[DataLabelsPosition2["Left"] = 5] = "Left";
  DataLabelsPosition2[DataLabelsPosition2["Right"] = 6] = "Right";
  return DataLabelsPosition2;
})(DataLabelsPosition || {});
var PolarLabelsPosition = /* @__PURE__ */ ((PolarLabelsPosition2) => {
  PolarLabelsPosition2[PolarLabelsPosition2["ChartCenter"] = 0] = "ChartCenter";
  PolarLabelsPosition2[PolarLabelsPosition2["End"] = 1] = "End";
  PolarLabelsPosition2[PolarLabelsPosition2["Start"] = 2] = "Start";
  PolarLabelsPosition2[PolarLabelsPosition2["Middle"] = 3] = "Middle";
  PolarLabelsPosition2[PolarLabelsPosition2["Outer"] = 4] = "Outer";
  return PolarLabelsPosition2;
})(PolarLabelsPosition || {});
var AxisPosition = /* @__PURE__ */ ((AxisPosition2) => {
  AxisPosition2[AxisPosition2["Start"] = 0] = "Start";
  AxisPosition2[AxisPosition2["End"] = 1] = "End";
  return AxisPosition2;
})(AxisPosition || {});
class AxisTick {
  constructor() {
    __publicField(this, "Value", 0);
    __publicField(this, "Magnitude", 0);
  }
}
const _PolarScaler = class {
  constructor(drawMagrinLocation, drawMarginSize, angleAxis, radiusAxis, innerRadius, initialRotation, totalAngle, usePreviousScale = false) {
    __publicField(this, "_deltaRadius");
    __publicField(this, "_innerRadiusOffset");
    __publicField(this, "_outerRadiusOffset");
    __publicField(this, "_scalableRadius");
    __publicField(this, "_initialRotation");
    __publicField(this, "_deltaAngleVal");
    __publicField(this, "_circumference");
    __privateAdd(this, _CenterX, 0);
    __privateAdd(this, _CenterY, 0);
    __privateAdd(this, _InnerRadius2, 0);
    __privateAdd(this, _MaxRadius, 0);
    __privateAdd(this, _MinRadius, 0);
    __privateAdd(this, _MinAngle, 0);
    __privateAdd(this, _MaxAngle, 0);
    let actualAngleBounds;
    let actualAngleVisibleBounds;
    let actualRadiusBounds;
    let actualRadiusVisibleBounds;
    if (usePreviousScale) {
      actualAngleBounds = angleAxis.DataBounds;
      actualAngleVisibleBounds = angleAxis.VisibleDataBounds;
      actualRadiusBounds = radiusAxis.DataBounds;
      actualRadiusVisibleBounds = radiusAxis.VisibleDataBounds;
    } else {
      actualAngleBounds = angleAxis.DataBounds;
      actualAngleVisibleBounds = angleAxis.VisibleDataBounds;
      actualRadiusBounds = radiusAxis.DataBounds;
      actualRadiusVisibleBounds = radiusAxis.VisibleDataBounds;
    }
    if (actualAngleBounds == null || actualAngleVisibleBounds == null)
      throw new System.Exception("angle bounds not found");
    if (actualRadiusBounds == null || actualRadiusVisibleBounds == null)
      throw new System.Exception("radius bounds not found");
    this.CenterX = drawMagrinLocation.X + drawMarginSize.Width * 0.5;
    this.CenterY = drawMagrinLocation.Y + drawMarginSize.Height * 0.5;
    this.MinRadius = radiusAxis.MinLimit ?? actualRadiusVisibleBounds.Min;
    this.MaxRadius = radiusAxis.MaxLimit ?? actualRadiusVisibleBounds.Max;
    this._deltaRadius = this.MaxRadius - this.MinRadius;
    let minDimension = drawMarginSize.Width < drawMarginSize.Height ? drawMarginSize.Width : drawMarginSize.Height;
    this._innerRadiusOffset = innerRadius;
    this.InnerRadius = innerRadius;
    this._outerRadiusOffset = 0;
    this._scalableRadius = minDimension * 0.5 - this._innerRadiusOffset - this._outerRadiusOffset;
    this.MinAngle = angleAxis.MinLimit ?? actualAngleBounds.Min;
    this.MaxAngle = angleAxis.MaxLimit ?? actualAngleBounds.Max;
    this._deltaAngleVal = this.MaxAngle - this.MinAngle;
    this._initialRotation = initialRotation;
    this._circumference = totalAngle;
  }
  get CenterX() {
    return __privateGet(this, _CenterX);
  }
  set CenterX(value) {
    __privateSet(this, _CenterX, value);
  }
  get CenterY() {
    return __privateGet(this, _CenterY);
  }
  set CenterY(value) {
    __privateSet(this, _CenterY, value);
  }
  get InnerRadius() {
    return __privateGet(this, _InnerRadius2);
  }
  set InnerRadius(value) {
    __privateSet(this, _InnerRadius2, value);
  }
  get MaxRadius() {
    return __privateGet(this, _MaxRadius);
  }
  set MaxRadius(value) {
    __privateSet(this, _MaxRadius, value);
  }
  get MinRadius() {
    return __privateGet(this, _MinRadius);
  }
  set MinRadius(value) {
    __privateSet(this, _MinRadius, value);
  }
  get MinAngle() {
    return __privateGet(this, _MinAngle);
  }
  set MinAngle(value) {
    __privateSet(this, _MinAngle, value);
  }
  get MaxAngle() {
    return __privateGet(this, _MaxAngle);
  }
  set MaxAngle(value) {
    __privateSet(this, _MaxAngle, value);
  }
  ToPixelsFromCharPoint(polarPoint) {
    return this.ToPixels(polarPoint.SecondaryValue, polarPoint.PrimaryValue);
  }
  ToPixels(angle, radius) {
    let p = (radius - this.MinRadius) / this._deltaRadius;
    let r = this._innerRadiusOffset + this._scalableRadius * p;
    let a = this._circumference * angle / this._deltaAngleVal;
    a += this._initialRotation;
    a *= _PolarScaler.ToRadians;
    {
      return new LvcPoint(this.CenterX + Math.cos(a) * r, this.CenterY + Math.sin(a) * r);
    }
  }
  ToChartValues(x, y) {
    let dx = x - this.CenterX;
    let dy = y - this.CenterY;
    let hyp = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) - this._innerRadiusOffset;
    let r = hyp / this._scalableRadius;
    let a = Math.atan(dy / dx) * (1 / _PolarScaler.ToRadians);
    if (dx < 0 && dy > 0)
      a = 180 + a;
    if (dx < 0 && dy <= 0)
      a = 180 + a;
    if (dx > 0 && dy <= 0)
      a = 360 + a;
    a -= this._initialRotation;
    if (a < 0)
      a = 360 - a;
    return new LvcPointD(this.MinAngle + this._deltaAngleVal * a / this._circumference, this.MinRadius + r * (this.MaxRadius - this.MinRadius));
  }
  ToPixelsWithAngleInDegrees(angle, radius) {
    let p = (radius - this.MinRadius) / this._deltaRadius;
    let r = this._innerRadiusOffset + this._scalableRadius * p;
    let a = angle * _PolarScaler.ToRadians;
    {
      return new LvcPoint(this.CenterX + Math.cos(a) * r, this.CenterY + Math.sin(a) * r);
    }
  }
  GetAngle(angle) {
    return this._initialRotation + this._circumference * angle / this._deltaAngleVal;
  }
};
let PolarScaler = _PolarScaler;
_CenterX = new WeakMap();
_CenterY = new WeakMap();
_InnerRadius2 = new WeakMap();
_MaxRadius = new WeakMap();
_MinRadius = new WeakMap();
_MinAngle = new WeakMap();
_MaxAngle = new WeakMap();
__publicField(PolarScaler, "ToRadians", Math.PI / 180);
class Bounds {
  constructor() {
    __privateAdd(this, _IsEmpty, true);
    __privateAdd(this, _Max, Number.MIN_VALUE);
    __privateAdd(this, _Min, Number.MAX_VALUE);
    __privateAdd(this, _PaddingMax, 0);
    __privateAdd(this, _PaddingMin, 0);
    __privateAdd(this, _RequestedGeometrySize, 0);
    __privateAdd(this, _MinDelta, Number.MAX_VALUE);
  }
  get IsEmpty() {
    return __privateGet(this, _IsEmpty);
  }
  set IsEmpty(value) {
    __privateSet(this, _IsEmpty, value);
  }
  get Max() {
    return __privateGet(this, _Max);
  }
  set Max(value) {
    __privateSet(this, _Max, value);
  }
  get Min() {
    return __privateGet(this, _Min);
  }
  set Min(value) {
    __privateSet(this, _Min, value);
  }
  get PaddingMax() {
    return __privateGet(this, _PaddingMax);
  }
  set PaddingMax(value) {
    __privateSet(this, _PaddingMax, value);
  }
  get PaddingMin() {
    return __privateGet(this, _PaddingMin);
  }
  set PaddingMin(value) {
    __privateSet(this, _PaddingMin, value);
  }
  get RequestedGeometrySize() {
    return __privateGet(this, _RequestedGeometrySize);
  }
  set RequestedGeometrySize(value) {
    __privateSet(this, _RequestedGeometrySize, value);
  }
  get Delta() {
    return this.Max - this.Min;
  }
  get MinDelta() {
    return __privateGet(this, _MinDelta);
  }
  set MinDelta(value) {
    __privateSet(this, _MinDelta, value);
  }
  AppendValue(value) {
    if (this.Max <= value)
      this.Max = value;
    if (this.Min >= value)
      this.Min = value;
    this.IsEmpty = false;
  }
  AppendValueByBounds(bounds) {
    if (this.Max <= bounds.Max)
      this.Max = bounds.Max;
    if (this.Min >= bounds.Min)
      this.Min = bounds.Min;
    if (bounds.MinDelta < this.MinDelta)
      this.MinDelta = bounds.MinDelta;
    if (this.RequestedGeometrySize < bounds.RequestedGeometrySize)
      this.RequestedGeometrySize = bounds.RequestedGeometrySize;
    if (this.PaddingMin < bounds.PaddingMin)
      this.PaddingMin = bounds.PaddingMin;
    if (this.PaddingMax < bounds.PaddingMax)
      this.PaddingMax = bounds.PaddingMax;
    this.IsEmpty = false;
  }
  HasSameLimitTo(bounds) {
    return this.Max == bounds.Max && this.Min == bounds.Min;
  }
}
_IsEmpty = new WeakMap();
_Max = new WeakMap();
_Min = new WeakMap();
_PaddingMax = new WeakMap();
_PaddingMin = new WeakMap();
_RequestedGeometrySize = new WeakMap();
_MinDelta = new WeakMap();
var LegendOrientation = /* @__PURE__ */ ((LegendOrientation2) => {
  LegendOrientation2[LegendOrientation2["Auto"] = 0] = "Auto";
  LegendOrientation2[LegendOrientation2["Horizontal"] = 1] = "Horizontal";
  LegendOrientation2[LegendOrientation2["Vertical"] = 2] = "Vertical";
  return LegendOrientation2;
})(LegendOrientation || {});
class DimensionalBounds {
  constructor(setMinBounds = false) {
    __privateAdd(this, _IsEmpty2, false);
    __publicField(this, "PrimaryBounds");
    __publicField(this, "SecondaryBounds");
    __publicField(this, "TertiaryBounds");
    __publicField(this, "VisiblePrimaryBounds");
    __publicField(this, "VisibleSecondaryBounds");
    __publicField(this, "VisibleTertiaryBounds");
    this.PrimaryBounds = new Bounds();
    this.SecondaryBounds = new Bounds();
    this.TertiaryBounds = new Bounds();
    this.VisiblePrimaryBounds = new Bounds();
    this.VisibleSecondaryBounds = new Bounds();
    this.VisibleTertiaryBounds = new Bounds();
    if (!setMinBounds)
      return;
    this.VisiblePrimaryBounds.AppendValue(0);
    this.VisiblePrimaryBounds.AppendValue(10);
    this.PrimaryBounds.AppendValue(0);
    this.PrimaryBounds.AppendValue(10);
    this.VisibleSecondaryBounds.AppendValue(0);
    this.VisibleSecondaryBounds.AppendValue(10);
    this.SecondaryBounds.AppendValue(0);
    this.SecondaryBounds.AppendValue(10);
    this.VisibleTertiaryBounds.AppendValue(1);
    this.TertiaryBounds.AppendValue(1);
    this.IsEmpty = true;
  }
  get IsEmpty() {
    return __privateGet(this, _IsEmpty2);
  }
  set IsEmpty(value) {
    __privateSet(this, _IsEmpty2, value);
  }
}
_IsEmpty2 = new WeakMap();
var LegendPosition = /* @__PURE__ */ ((LegendPosition2) => {
  LegendPosition2[LegendPosition2["Hidden"] = 0] = "Hidden";
  LegendPosition2[LegendPosition2["Top"] = 1] = "Top";
  LegendPosition2[LegendPosition2["Left"] = 2] = "Left";
  LegendPosition2[LegendPosition2["Right"] = 3] = "Right";
  LegendPosition2[LegendPosition2["Bottom"] = 4] = "Bottom";
  return LegendPosition2;
})(LegendPosition || {});
var ZoomAndPanMode = /* @__PURE__ */ ((ZoomAndPanMode2) => {
  ZoomAndPanMode2[ZoomAndPanMode2["None"] = 0] = "None";
  ZoomAndPanMode2[ZoomAndPanMode2["X"] = 1] = "X";
  ZoomAndPanMode2[ZoomAndPanMode2["Y"] = 2] = "Y";
  ZoomAndPanMode2[ZoomAndPanMode2["Both"] = 3] = "Both";
  return ZoomAndPanMode2;
})(ZoomAndPanMode || {});
var ZoomDirection = /* @__PURE__ */ ((ZoomDirection2) => {
  ZoomDirection2[ZoomDirection2["ZoomIn"] = 0] = "ZoomIn";
  ZoomDirection2[ZoomDirection2["ZoomOut"] = 1] = "ZoomOut";
  ZoomDirection2[ZoomDirection2["DefinedByScaleFactor"] = 2] = "DefinedByScaleFactor";
  return ZoomDirection2;
})(ZoomDirection || {});
var RadialAlignment = /* @__PURE__ */ ((RadialAlignment2) => {
  RadialAlignment2[RadialAlignment2["Outer"] = 0] = "Outer";
  RadialAlignment2[RadialAlignment2["Center"] = 1] = "Center";
  RadialAlignment2[RadialAlignment2["Inner"] = 2] = "Inner";
  return RadialAlignment2;
})(RadialAlignment || {});
class RelativePanel extends VisualElement {
  constructor() {
    super(...arguments);
    __publicField(this, "_targetPosition", LvcPoint.Empty.Clone());
    __publicField(this, "Size", LvcSize.Empty.Clone());
  }
  get Children() {
    return new System.HashSet();
  }
  GetTargetLocation() {
    return this._targetPosition;
  }
  GetTargetSize() {
    return this.Size;
  }
  Measure(chart, primaryScaler, secondaryScaler) {
    for (const child of this.Children)
      child.Measure(chart, primaryScaler, secondaryScaler);
    return this.GetTargetSize();
  }
  RemoveFromUI(chart) {
    for (const child of this.Children) {
      child.RemoveFromUI(chart);
    }
    super.RemoveFromUI(chart);
  }
  OnInvalidated(chart, primaryScaler, secondaryScaler) {
    this._targetPosition = new LvcPoint(this.X + this._xc, this.Y + this._yc).Clone();
    for (const child of this.Children) {
      child._parent = this._parent;
      child._xc = this._xc;
      child._yc = this._yc;
      child._x = this.X;
      child._y = this.Y;
      child.OnInvalidated(chart, primaryScaler, secondaryScaler);
    }
  }
  GetPaintTasks() {
    return [];
  }
}
class StackPanel extends VisualElement {
  constructor(backgroundGeometryFactory) {
    super();
    __publicField(this, "_backgroundGeometryFactory");
    __publicField(this, "_targetPosition", LvcPoint.Empty.Clone());
    __publicField(this, "_backgroundPaint");
    __publicField(this, "_backgroundGeometry");
    __publicField(this, "Orientation", 0);
    __publicField(this, "VerticalAlignment", Align.Middle);
    __publicField(this, "HorizontalAlignment", Align.Middle);
    __publicField(this, "Padding", new Padding(0, 0, 0, 0));
    this._backgroundGeometryFactory = backgroundGeometryFactory;
  }
  get Children() {
    return new System.HashSet();
  }
  get BackgroundPaint() {
    return this._backgroundPaint;
  }
  set BackgroundPaint(value) {
    this.SetPaintProperty(new System.Ref(() => this._backgroundPaint, ($v) => this._backgroundPaint = $v), value);
  }
  GetTargetLocation() {
    return this._targetPosition;
  }
  GetTargetSize() {
    let size = (this.Orientation == ContainerOrientation.Horizontal ? this.Children.Aggregate(new LvcSize(0, 0), (current, next) => {
      let size2 = next.GetTargetSize();
      return new LvcSize(current.Width + size2.Width, size2.Height > current.Height ? size2.Height : current.Height);
    }) : this.Children.Aggregate(new LvcSize(0, 0), (current, next) => {
      let size2 = next.GetTargetSize();
      return new LvcSize(size2.Width > current.Width ? size2.Width : current.Width, current.Height + size2.Height);
    })).Clone();
    return new LvcSize(this.Padding.Left + this.Padding.Right + size.Width, this.Padding.Top + this.Padding.Bottom + size.Height);
  }
  Measure(chart, primaryScaler, secondaryScaler) {
    for (const child of this.Children)
      child.Measure(chart, primaryScaler, secondaryScaler);
    return this.GetTargetSize();
  }
  RemoveFromUI(chart) {
    for (const child of this.Children) {
      child.RemoveFromUI(chart);
    }
    super.RemoveFromUI(chart);
  }
  OnInvalidated(chart, primaryScaler, secondaryScaler) {
    let xl = this.Padding.Left;
    let yl = this.Padding.Top;
    this._targetPosition = new LvcPoint(this.X + this._xc, this.Y + this._yc).Clone();
    let controlSize = this.Measure(chart, primaryScaler, secondaryScaler);
    if (this._backgroundGeometry == null) {
      let cp = this.GetPositionRelativeToParent();
      this._backgroundGeometry = this._backgroundGeometryFactory();
      this._backgroundGeometry.X = cp.X;
      this._backgroundGeometry.Y = cp.Y;
      this._backgroundGeometry.Width = controlSize.Width;
      this._backgroundGeometry.Height = controlSize.Height;
      Extensions.TransitionateProperties(this._backgroundGeometry).WithAnimationFromChart(chart).CompleteCurrentTransitions();
    }
    this.BackgroundPaint ?? (this.BackgroundPaint = LiveCharts.DefaultSettings.GetProvider().GetSolidColorPaint(new LvcColor(0, 0, 0, 0)));
    chart.Canvas.AddDrawableTask(this.BackgroundPaint);
    this._backgroundGeometry.X = this._targetPosition.X;
    this._backgroundGeometry.Y = this._targetPosition.Y;
    this._backgroundGeometry.Width = controlSize.Width;
    this._backgroundGeometry.Height = controlSize.Height;
    this.BackgroundPaint.AddGeometryToPaintTask(chart.Canvas, this._backgroundGeometry);
    if (this.Orientation == ContainerOrientation.Horizontal) {
      for (const child of this.Children) {
        child.Measure(chart, primaryScaler, secondaryScaler);
        let childSize = child.GetTargetSize();
        if (this._backgroundGeometry == null)
          throw new System.Exception("Background is required.");
        child._parent = this._backgroundGeometry;
        child._xc = this._targetPosition.X;
        child._yc = this._targetPosition.Y;
        child._x = xl;
        child._y = this.VerticalAlignment == Align.Middle ? yl + (controlSize.Height - this.Padding.Top - this.Padding.Bottom - childSize.Height) / 2 : this.VerticalAlignment == Align.End ? yl + controlSize.Height - this.Padding.Top - this.Padding.Bottom - childSize.Height : yl;
        child.OnInvalidated(chart, primaryScaler, secondaryScaler);
        xl += childSize.Width;
      }
    } else {
      for (const child of this.Children) {
        child.Measure(chart, primaryScaler, secondaryScaler);
        let childSize = child.GetTargetSize();
        if (this._backgroundGeometry == null)
          throw new System.Exception("Background is required.");
        child._parent = this._backgroundGeometry;
        child._xc = this._targetPosition.X;
        child._yc = this._targetPosition.Y;
        child._x = this.HorizontalAlignment == Align.Middle ? xl + (controlSize.Width - this.Padding.Left - this.Padding.Right - childSize.Width) / 2 : this.HorizontalAlignment == Align.End ? xl + controlSize.Width - this.Padding.Left - this.Padding.Right - childSize.Width : xl;
        child._y = yl;
        child.OnInvalidated(chart, primaryScaler, secondaryScaler);
        yl += childSize.Height;
      }
    }
  }
  GetPaintTasks() {
    return [this._backgroundPaint];
  }
}
class VisualElement extends ChartElement {
  constructor() {
    super(...arguments);
    __publicField(this, "_x", 0);
    __publicField(this, "_y", 0);
    __publicField(this, "_xc", 0);
    __publicField(this, "_yc", 0);
    __publicField(this, "_parent");
    __publicField(this, "_scalesXAt", 0);
    __publicField(this, "_scalesYAt", 0);
    __publicField(this, "LocationUnit", MeasureUnit.Pixels);
    __publicField(this, "PropertyChanged", new System.Event());
  }
  get X() {
    return this._x;
  }
  set X(value) {
    this._x = value;
    this.OnPropertyChanged();
  }
  get Y() {
    return this._y;
  }
  set Y(value) {
    this._y = value;
    this.OnPropertyChanged();
  }
  get ScalesXAt() {
    return this._scalesXAt;
  }
  set ScalesXAt(value) {
    this._scalesXAt = value;
    this.OnPropertyChanged();
  }
  get ScalesYAt() {
    return this._scalesYAt;
  }
  set ScalesYAt(value) {
    this._scalesYAt = value;
    this.OnPropertyChanged();
  }
  Invalidate(chart) {
    let primary = null;
    let secondary = null;
    let cartesianChart = null;
    if (chart instanceof CartesianChart) {
      const cc = chart;
      cartesianChart = cc;
      let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
      let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
      secondary = Extensions.GetNextScaler(secondaryAxis, cartesianChart);
      primary = Extensions.GetNextScaler(primaryAxis, cartesianChart);
    }
    for (const paintTask of this.GetPaintTasks()) {
      if (paintTask == null)
        continue;
      chart.Canvas.AddDrawableTask(paintTask);
    }
    this.OnInvalidated(chart, primary, secondary);
  }
  OnPaintChanged(propertyName) {
    super.OnPaintChanged(propertyName);
    this.OnPropertyChanged(propertyName);
  }
  OnPropertyChanged(propertyName = null) {
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
  GetPositionRelativeToParent() {
    let parentX = 0;
    let parentY = 0;
    if (this._parent != null) {
      let xProperty = this._parent.MotionProperties.GetAt("_parent.X");
      let yProperty = this._parent.MotionProperties.GetAt("_parent.Y");
      parentX = xProperty.GetCurrentValue(this._parent);
      parentY = yProperty.GetCurrentValue(this._parent);
    }
    return new LvcPoint(parentX + this.X, parentY + this.Y);
  }
  IsHitBy(chart, point) {
    const _$generator = function* (chart2, point2) {
      let motionCanvas = chart2.Canvas;
      if (motionCanvas.StartPoint != null) {
        point2.X -= motionCanvas.StartPoint.X;
        point2.Y -= motionCanvas.StartPoint.Y;
      }
      let location = this.GetTargetLocation();
      let size = this.GetTargetSize();
      if (point2.X >= location.X && point2.X <= location.X + size.Width && point2.Y >= location.Y && point2.Y <= location.Y + size.Height)
        yield this;
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(chart, point));
  }
  AlignToTopLeftCorner() {
  }
}
__publicField(VisualElement, "$meta_System_INotifyPropertyChanged", true);
function IsInterfaceOfIImageControl(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_IImageControl" in obj.constructor;
}
class ColorPalletes {
  static get FluentDesign() {
    return [
      ColorPalletes.RGB(116, 77, 169),
      ColorPalletes.RGB(231, 72, 86),
      ColorPalletes.RGB(255, 140, 0),
      ColorPalletes.RGB(0, 153, 188),
      ColorPalletes.RGB(191, 0, 119),
      ColorPalletes.RGB(1, 133, 116),
      ColorPalletes.RGB(194, 57, 179),
      ColorPalletes.RGB(76, 74, 72),
      ColorPalletes.RGB(0, 183, 195)
    ];
  }
  static get MaterialDesign500() {
    return [
      ColorPalletes.RGB(33, 150, 243),
      ColorPalletes.RGB(244, 67, 54),
      ColorPalletes.RGB(139, 195, 74),
      ColorPalletes.RGB(0, 188, 212),
      ColorPalletes.RGB(63, 81, 181),
      ColorPalletes.RGB(255, 193, 7),
      ColorPalletes.RGB(0, 150, 136),
      ColorPalletes.RGB(233, 30, 99),
      ColorPalletes.RGB(96, 125, 139)
    ];
  }
  static get MaterialDesign200() {
    return [
      ColorPalletes.RGB(144, 202, 249),
      ColorPalletes.RGB(239, 154, 154),
      ColorPalletes.RGB(197, 225, 165),
      ColorPalletes.RGB(128, 222, 234),
      ColorPalletes.RGB(159, 168, 218),
      ColorPalletes.RGB(255, 224, 130),
      ColorPalletes.RGB(128, 203, 196),
      ColorPalletes.RGB(244, 143, 177),
      ColorPalletes.RGB(176, 190, 197)
    ];
  }
  static get MaterialDesign800() {
    return [
      ColorPalletes.RGB(21, 101, 192),
      ColorPalletes.RGB(198, 40, 40),
      ColorPalletes.RGB(85, 139, 47),
      ColorPalletes.RGB(0, 131, 143),
      ColorPalletes.RGB(40, 53, 147),
      ColorPalletes.RGB(255, 143, 0),
      ColorPalletes.RGB(0, 105, 92),
      ColorPalletes.RGB(173, 20, 87),
      ColorPalletes.RGB(55, 71, 79)
    ];
  }
  static RGB(r, g, b) {
    return LvcColor.FromArgb(255, r, g, b);
  }
}
class Theme {
  constructor() {
    __publicField(this, "AxisBuilder", new System.List());
    __publicField(this, "DrawMarginFrameBuilder", new System.List());
    __publicField(this, "SeriesBuilder", new System.List());
    __publicField(this, "PieSeriesBuilder", new System.List());
    __publicField(this, "GaugeSeriesBuilder", new System.List());
    __publicField(this, "GaugeFillSeriesBuilder", new System.List());
    __publicField(this, "CartesianSeriesBuilder", new System.List());
    __publicField(this, "StepLineSeriesBuilder", new System.List());
    __publicField(this, "StackedStepLineSeriesBuilder", new System.List());
    __publicField(this, "LineSeriesBuilder", new System.List());
    __publicField(this, "PolarSeriesBuilder", new System.List());
    __publicField(this, "PolarLineSeriesBuilder", new System.List());
    __publicField(this, "StackedPolarSeriesBuilder", new System.List());
    __publicField(this, "HeatSeriesBuilder", new System.List());
    __publicField(this, "FinancialSeriesBuilder", new System.List());
    __publicField(this, "StackedLineSeriesBuilder", new System.List());
    __publicField(this, "BarSeriesBuilder", new System.List());
    __publicField(this, "ColumnSeriesBuilder", new System.List());
    __publicField(this, "RowSeriesBuilder", new System.List());
    __publicField(this, "StackedBarSeriesBuilder", new System.List());
    __publicField(this, "StackedColumnSeriesBuilder", new System.List());
    __publicField(this, "StackedRowSeriesBuilder", new System.List());
    __publicField(this, "ScatterSeriesBuilder", new System.List());
  }
  ApplyStyleToAxis(axis) {
    for (const rule of this.AxisBuilder)
      rule(axis);
  }
  ApplyStyleToSeries(series) {
    for (const rule of this.SeriesBuilder)
      rule(series);
    if ((series.SeriesProperties & SeriesProperties.PieSeries) == SeriesProperties.PieSeries) {
      if ((series.SeriesProperties & SeriesProperties.Gauge) != 0) {
        if ((series.SeriesProperties & SeriesProperties.GaugeFill) != 0) {
          for (const rule of this.GaugeFillSeriesBuilder)
            rule(series);
        } else {
          for (const rule of this.GaugeSeriesBuilder)
            rule(series);
        }
      } else {
        for (const rule of this.PieSeriesBuilder)
          rule(series);
      }
    }
    if ((series.SeriesProperties & SeriesProperties.CartesianSeries) == SeriesProperties.CartesianSeries) {
      for (const rule of this.CartesianSeriesBuilder)
        rule(series);
    }
    if ((series.SeriesProperties & SeriesProperties.Bar) == SeriesProperties.Bar && (series.SeriesProperties & SeriesProperties.Stacked) != SeriesProperties.Stacked) {
      let barSeries = series;
      for (const rule of this.BarSeriesBuilder)
        rule(barSeries);
      if ((series.SeriesProperties & SeriesProperties.PrimaryAxisVerticalOrientation) == SeriesProperties.PrimaryAxisVerticalOrientation) {
        for (const rule of this.ColumnSeriesBuilder)
          rule(barSeries);
      }
      if ((series.SeriesProperties & SeriesProperties.PrimaryAxisHorizontalOrientation) == SeriesProperties.PrimaryAxisHorizontalOrientation) {
        for (const rule of this.RowSeriesBuilder)
          rule(barSeries);
      }
    }
    let stackedBarMask = SeriesProperties.Bar | SeriesProperties.Stacked;
    if ((series.SeriesProperties & stackedBarMask) == stackedBarMask) {
      let stackedBarSeries = series;
      for (const rule of this.StackedBarSeriesBuilder)
        rule(stackedBarSeries);
      if ((series.SeriesProperties & SeriesProperties.PrimaryAxisVerticalOrientation) == SeriesProperties.PrimaryAxisVerticalOrientation) {
        for (const rule of this.StackedColumnSeriesBuilder)
          rule(stackedBarSeries);
      }
      if ((series.SeriesProperties & SeriesProperties.PrimaryAxisHorizontalOrientation) == SeriesProperties.PrimaryAxisHorizontalOrientation) {
        for (const rule of this.StackedRowSeriesBuilder)
          rule(stackedBarSeries);
      }
    }
    if ((series.SeriesProperties & SeriesProperties.Scatter) == SeriesProperties.Scatter) {
      for (const rule of this.ScatterSeriesBuilder)
        rule(series);
    }
    if ((series.SeriesProperties & SeriesProperties.StepLine) == SeriesProperties.StepLine) {
      let stepSeries = series;
      for (const rule of this.StepLineSeriesBuilder)
        rule(stepSeries);
      if ((series.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked) {
        for (const rule of this.StackedStepLineSeriesBuilder)
          rule(stepSeries);
      }
    }
    if ((series.SeriesProperties & SeriesProperties.Line) == SeriesProperties.Line) {
      let lineSeries = series;
      for (const rule of this.LineSeriesBuilder)
        rule(lineSeries);
      if ((series.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked) {
        for (const rule of this.StackedLineSeriesBuilder)
          rule(lineSeries);
      }
    }
    if ((series.SeriesProperties & SeriesProperties.Polar) == SeriesProperties.Polar) {
      let polarSeries = series;
      for (const rule of this.PolarSeriesBuilder)
        rule(polarSeries);
      if ((series.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked) {
        for (const rule of this.StackedPolarSeriesBuilder)
          rule(polarSeries);
      }
    }
    if ((series.SeriesProperties & SeriesProperties.PolarLine) == SeriesProperties.PolarLine) {
      let polarSeries = series;
      for (const rule of this.PolarLineSeriesBuilder)
        rule(polarSeries);
      if ((series.SeriesProperties & SeriesProperties.Stacked) == SeriesProperties.Stacked) {
        for (const rule of this.StackedPolarSeriesBuilder)
          rule(polarSeries);
      }
    }
    if ((series.SeriesProperties & SeriesProperties.Heat) == SeriesProperties.Heat) {
      let heatSeries = series;
      for (const rule of this.HeatSeriesBuilder)
        rule(heatSeries);
    }
    if ((series.SeriesProperties & SeriesProperties.Financial) == SeriesProperties.Financial) {
      let financialSeries = series;
      for (const rule of this.FinancialSeriesBuilder)
        rule(financialSeries);
    }
  }
}
class LiveChartsStylerExtensions {
  static HasRuleForAxes(styler, predicate) {
    styler.AxisBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForDrawMargin(styler, predicate) {
    styler.DrawMarginFrameBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForAnySeries(styler, predicate) {
    styler.SeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForPieSeries(styler, predicate) {
    styler.PieSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForGaugeSeries(styler, predicate) {
    styler.GaugeSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForGaugeFillSeries(styler, predicate) {
    styler.GaugeFillSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForLineSeries(styler, predicate) {
    styler.LineSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForStepLineSeries(styler, predicate) {
    styler.StepLineSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForStackedStepLineSeries(styler, predicate) {
    styler.StackedStepLineSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForStackedLineSeries(styler, predicate) {
    styler.StackedLineSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForBarSeries(styler, predicate) {
    styler.BarSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForColumnSeries(styler, predicate) {
    styler.ColumnSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForRowSeries(styler, predicate) {
    styler.ColumnSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForStackedBarSeries(styler, predicate) {
    styler.StackedBarSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForStackedColumnSeries(styler, predicate) {
    styler.StackedColumnSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForStackedRowSeries(styler, predicate) {
    styler.StackedRowSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForScatterSeries(styler, predicate) {
    styler.ScatterSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForHeatSeries(styler, predicate) {
    styler.HeatSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForFinancialSeries(styler, predicate) {
    styler.FinancialSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForPolaSeries(styler, predicate) {
    styler.PolarSeriesBuilder.Add(predicate);
    return styler;
  }
  static HasRuleForPolarLineSeries(styler, predicate) {
    styler.PolarLineSeriesBuilder.Add(predicate);
    return styler;
  }
}
class ChartElement {
  constructor() {
    __publicField(this, "_isInternalSet", false);
    __publicField(this, "_isThemeSet", false);
    __publicField(this, "_userSets", new System.HashSet());
    __publicField(this, "_deletingTasks", new System.List());
    __publicField(this, "PropertyChanged", new System.Event());
    __publicField(this, "Tag");
  }
  RemoveOldPaints(chart) {
    if (this._deletingTasks.length == 0)
      return;
    for (const item of this._deletingTasks) {
      chart.CoreCanvas.RemovePaintTask(item);
      item.Dispose();
    }
    this._deletingTasks.Clear();
  }
  RemoveFromUI(chart) {
    for (const item of this.GetPaintTasks()) {
      if (item == null)
        continue;
      chart.Canvas.RemovePaintTask(item);
      item.ClearGeometriesFromPaintTask(chart.Canvas);
    }
  }
  SetPaintProperty(reference, value, isStroke = false, propertyName = null) {
    if (propertyName == null)
      throw new System.ArgumentNullException("propertyName");
    if (!this.CanSetProperty(propertyName))
      return;
    if (reference.Value != null)
      this._deletingTasks.Add(reference.Value);
    reference.Value = value;
    if (reference.Value != null) {
      reference.Value.IsStroke = isStroke;
      reference.Value.IsFill = !isStroke;
      if (!isStroke)
        reference.Value.StrokeThickness = 0;
    }
    this.OnPropertyChanged(propertyName);
  }
  SetProperty(reference, value, propertyName = null) {
    if (propertyName == null)
      throw new System.ArgumentNullException("propertyName");
    if (!this.CanSetProperty(propertyName))
      return;
    reference.Value = value;
    this.OnPropertyChanged(propertyName);
  }
  CanSetProperty(propertyName) {
    return !this._isInternalSet || !this._userSets.Contains(propertyName);
  }
  ScheduleDeleteFor(paintTask) {
    this._deletingTasks.Add(paintTask);
  }
  OnPaintChanged(propertyName) {
  }
  OnPropertyChanged(propertyName = null) {
    if (this._isInternalSet)
      return;
    if (propertyName == null)
      throw new System.ArgumentNullException("propertyName");
    this._userSets.Add(propertyName);
    this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
  }
}
class ActionThrottler {
  constructor(targetAction, time) {
    __publicField(this, "_sync", {});
    __publicField(this, "_action");
    __publicField(this, "_isWaiting", false);
    __publicField(this, "ThrottlerTimeSpan", System.TimeSpan.Empty.Clone());
    this._action = targetAction;
    this.ThrottlerTimeSpan = time;
  }
  async Call() {
    {
      if (this._isWaiting)
        return;
      this._isWaiting = true;
    }
    await new Promise(($resolve) => setTimeout(() => $resolve(), Math.floor(this.ThrottlerTimeSpan.TotalMilliseconds) & 4294967295));
    {
      this._isWaiting = false;
    }
    await Promise.any([this._action()]);
  }
  ForceCall() {
    this._action();
  }
}
var SeriesProperties = /* @__PURE__ */ ((SeriesProperties2) => {
  SeriesProperties2[SeriesProperties2["AllSeries"] = 0] = "AllSeries";
  SeriesProperties2[SeriesProperties2["CartesianSeries"] = 2] = "CartesianSeries";
  SeriesProperties2[SeriesProperties2["Bar"] = 4] = "Bar";
  SeriesProperties2[SeriesProperties2["Line"] = 8] = "Line";
  SeriesProperties2[SeriesProperties2["StepLine"] = 16] = "StepLine";
  SeriesProperties2[SeriesProperties2["Scatter"] = 32] = "Scatter";
  SeriesProperties2[SeriesProperties2["Heat"] = 64] = "Heat";
  SeriesProperties2[SeriesProperties2["Financial"] = 128] = "Financial";
  SeriesProperties2[SeriesProperties2["PieSeries"] = 256] = "PieSeries";
  SeriesProperties2[SeriesProperties2["Stacked"] = 512] = "Stacked";
  SeriesProperties2[SeriesProperties2["PrimaryAxisVerticalOrientation"] = 1024] = "PrimaryAxisVerticalOrientation";
  SeriesProperties2[SeriesProperties2["PrimaryAxisHorizontalOrientation"] = 2048] = "PrimaryAxisHorizontalOrientation";
  SeriesProperties2[SeriesProperties2["Gauge"] = 4096] = "Gauge";
  SeriesProperties2[SeriesProperties2["GaugeFill"] = 8192] = "GaugeFill";
  SeriesProperties2[SeriesProperties2["Sketch"] = 16384] = "Sketch";
  SeriesProperties2[SeriesProperties2["Solid"] = 32768] = "Solid";
  SeriesProperties2[SeriesProperties2["PrefersXStrategyTooltips"] = 65536] = "PrefersXStrategyTooltips";
  SeriesProperties2[SeriesProperties2["PrefersYStrategyTooltips"] = 131072] = "PrefersYStrategyTooltips";
  SeriesProperties2[SeriesProperties2["PrefersXYStrategyTooltips"] = 262144] = "PrefersXYStrategyTooltips";
  SeriesProperties2[SeriesProperties2["Polar"] = 524288] = "Polar";
  SeriesProperties2[SeriesProperties2["PolarLine"] = 1048576] = "PolarLine";
  return SeriesProperties2;
})(SeriesProperties || {});
class ChartPointContext {
  constructor(chart, series, entity) {
    __privateAdd(this, _Chart2, void 0);
    __privateAdd(this, _Series5, void 0);
    __privateAdd(this, _Entity, void 0);
    __privateAdd(this, _DataSource, void 0);
    __privateAdd(this, _Visual, void 0);
    __privateAdd(this, _Label, void 0);
    __privateAdd(this, _HoverArea, void 0);
    this.Chart = chart;
    this.Series = series;
    this.Entity = entity;
  }
  get Chart() {
    return __privateGet(this, _Chart2);
  }
  set Chart(value) {
    __privateSet(this, _Chart2, value);
  }
  get Series() {
    return __privateGet(this, _Series5);
  }
  set Series(value) {
    __privateSet(this, _Series5, value);
  }
  get Entity() {
    return __privateGet(this, _Entity);
  }
  set Entity(value) {
    __privateSet(this, _Entity, value);
  }
  get DataSource() {
    return __privateGet(this, _DataSource);
  }
  set DataSource(value) {
    __privateSet(this, _DataSource, value);
  }
  get Index() {
    return this.Entity?.EntityIndex ?? 0;
  }
  get Visual() {
    return __privateGet(this, _Visual);
  }
  set Visual(value) {
    __privateSet(this, _Visual, value);
  }
  get Label() {
    return __privateGet(this, _Label);
  }
  set Label(value) {
    __privateSet(this, _Label, value);
  }
  get HoverArea() {
    return __privateGet(this, _HoverArea);
  }
  set HoverArea(value) {
    __privateSet(this, _HoverArea, value);
  }
}
_Chart2 = new WeakMap();
_Series5 = new WeakMap();
_Entity = new WeakMap();
_DataSource = new WeakMap();
_Visual = new WeakMap();
_Label = new WeakMap();
_HoverArea = new WeakMap();
const _Coordinate = class {
  constructor(primaryValue, secondaryValue, tertiaryValue, quaternaryValue, quinaryValue, isEmpty = false) {
    __privateAdd(this, _IsEmpty3, false);
    __privateAdd(this, _PrimaryValue, 0);
    __privateAdd(this, _SecondaryValue, 0);
    __privateAdd(this, _TertiaryValue, 0);
    __privateAdd(this, _QuaternaryValue, 0);
    __privateAdd(this, _QuinaryValue, 0);
    this.PrimaryValue = primaryValue;
    this.SecondaryValue = secondaryValue;
    this.TertiaryValue = tertiaryValue;
    this.QuaternaryValue = quaternaryValue;
    this.QuinaryValue = quinaryValue;
    this.IsEmpty = isEmpty;
  }
  static MakeByXY(x, y, weight = 0) {
    return new _Coordinate(y, x, weight, 0, 0);
  }
  static get Empty() {
    return new _Coordinate(0, 0, 0, 0, 0, true);
  }
  get IsEmpty() {
    return __privateGet(this, _IsEmpty3);
  }
  set IsEmpty(value) {
    __privateSet(this, _IsEmpty3, value);
  }
  get PrimaryValue() {
    return __privateGet(this, _PrimaryValue);
  }
  set PrimaryValue(value) {
    __privateSet(this, _PrimaryValue, value);
  }
  get SecondaryValue() {
    return __privateGet(this, _SecondaryValue);
  }
  set SecondaryValue(value) {
    __privateSet(this, _SecondaryValue, value);
  }
  get TertiaryValue() {
    return __privateGet(this, _TertiaryValue);
  }
  set TertiaryValue(value) {
    __privateSet(this, _TertiaryValue, value);
  }
  get QuaternaryValue() {
    return __privateGet(this, _QuaternaryValue);
  }
  set QuaternaryValue(value) {
    __privateSet(this, _QuaternaryValue, value);
  }
  get QuinaryValue() {
    return __privateGet(this, _QuinaryValue);
  }
  set QuinaryValue(value) {
    __privateSet(this, _QuinaryValue, value);
  }
};
let Coordinate = _Coordinate;
_IsEmpty3 = new WeakMap();
_PrimaryValue = new WeakMap();
_SecondaryValue = new WeakMap();
_TertiaryValue = new WeakMap();
_QuaternaryValue = new WeakMap();
_QuinaryValue = new WeakMap();
class Stacker {
  constructor() {
    __publicField(this, "_stackPositions", new System.Dictionary());
    __publicField(this, "_stack", new System.List());
    __publicField(this, "_totals", new System.Dictionary());
    __publicField(this, "_stackCount", 0);
    __publicField(this, "_knownMaxLenght", 0);
  }
  get MaxLength() {
    return 0;
  }
  GetSeriesStackPosition(series) {
    let i;
    if (!this._stackPositions.TryGetValue(series, new System.Out(() => i, ($v) => i = $v))) {
      let n = new System.Dictionary(this._knownMaxLenght);
      this._stack.Add(n);
      i = this._stackCount++;
      this._stackPositions.SetAt(series, i);
    }
    return i;
  }
  StackPoint(point, seriesStackPosition) {
    let currentStack;
    let index = point.SecondaryValue;
    let value = point.PrimaryValue;
    let positiveStart = 0;
    let negativeStart = 0;
    if (seriesStackPosition > 0) {
      let ssp = seriesStackPosition;
      let found = false;
      while (ssp >= 0 && !found && ssp - 1 >= 0) {
        let previousActiveStack;
        let stackCol = this._stack[ssp - 1];
        if (stackCol.TryGetValue(index, new System.Out(() => previousActiveStack, ($v) => previousActiveStack = $v))) {
          positiveStart = previousActiveStack.End;
          negativeStart = previousActiveStack.NegativeEnd;
          found = true;
        } else {
          ssp--;
        }
      }
    }
    let si = this._stack[seriesStackPosition];
    if (!si.TryGetValue(point.SecondaryValue, new System.Out(() => currentStack, ($v) => currentStack = $v))) {
      let _;
      currentStack = new StackedValue().Init({
        Start: positiveStart,
        End: positiveStart,
        NegativeStart: negativeStart,
        NegativeEnd: negativeStart
      });
      si.Add(index, currentStack);
      if (!this._totals.TryGetValue(index, new System.Out(() => _, ($v) => _ = $v)))
        this._totals.Add(index, new StackedTotal());
      this._knownMaxLenght++;
    }
    if (value >= 0) {
      currentStack.End += value;
      let positiveTotal = this._totals.GetAt(index).Positive + value;
      this._totals.GetAt(index).Positive = positiveTotal;
      return positiveTotal;
    } else {
      currentStack.NegativeEnd += value;
      let negativeTotal = this._totals.GetAt(index).Negative + value;
      this._totals.GetAt(index).Negative = negativeTotal;
      return negativeTotal;
    }
  }
  GetStack(point, seriesStackPosition) {
    let index = point.SecondaryValue;
    let p = this._stack[seriesStackPosition].GetAt(index);
    return new StackedValue().Init({
      Start: p.Start,
      End: p.End,
      Total: this._totals.GetAt(index).Positive,
      NegativeStart: p.NegativeStart,
      NegativeEnd: p.NegativeEnd,
      NegativeTotal: this._totals.GetAt(index).Negative
    });
  }
}
class SeriesContext {
  constructor(series) {
    __publicField(this, "_series");
    __publicField(this, "_columnsCount", 0);
    __publicField(this, "_rowsCount", 0);
    __publicField(this, "_stackedColumnsCount", 0);
    __publicField(this, "_stackedRowsCount", 0);
    __publicField(this, "_areBarsIndexed", false);
    __publicField(this, "_columnPositions", new System.Dictionary());
    __publicField(this, "_rowPositions", new System.Dictionary());
    __publicField(this, "_stackColumnPositions", new System.Dictionary());
    __publicField(this, "_stackRowsPositions", new System.Dictionary());
    __publicField(this, "_stackers", new System.Dictionary());
    this._series = series;
  }
  GetColumnPostion(series) {
    if (this._areBarsIndexed)
      return this._columnPositions.GetAt(series);
    this.IndexBars();
    return this._columnPositions.GetAt(series);
  }
  GetColumnSeriesCount() {
    if (this._areBarsIndexed)
      return this._columnsCount;
    this.IndexBars();
    return this._columnsCount;
  }
  GetRowPostion(series) {
    if (this._areBarsIndexed)
      return this._rowPositions.GetAt(series);
    this.IndexBars();
    return this._rowPositions.GetAt(series);
  }
  GetRowSeriesCount() {
    if (this._areBarsIndexed)
      return this._rowsCount;
    this.IndexBars();
    return this._rowsCount;
  }
  GetStackedColumnPostion(series) {
    if (this._areBarsIndexed)
      return this._stackColumnPositions.GetAt(series.GetStackGroup());
    this.IndexBars();
    return this._stackColumnPositions.GetAt(series.GetStackGroup());
  }
  GetStackedColumnSeriesCount() {
    if (this._areBarsIndexed)
      return this._stackedColumnsCount;
    this.IndexBars();
    return this._stackedColumnsCount;
  }
  GetStackedRowPostion(series) {
    if (this._areBarsIndexed)
      return this._stackRowsPositions.GetAt(series.GetStackGroup());
    this.IndexBars();
    return this._stackRowsPositions.GetAt(series.GetStackGroup());
  }
  GetStackedRowSeriesCount() {
    if (this._areBarsIndexed)
      return this._stackedRowsCount;
    this.IndexBars();
    return this._stackedRowsCount;
  }
  IndexBars() {
    this._columnsCount = 0;
    this._rowsCount = 0;
    this._stackedColumnsCount = 0;
    this._stackedRowsCount = 0;
    for (const item of this._series) {
      if (!Extensions.IsBarSeries(item))
        continue;
      if (Extensions.IsColumnSeries(item)) {
        if (!Extensions.IsStackedSeries(item)) {
          this._columnPositions.SetAt(item, this._columnsCount++);
          continue;
        }
        if (!this._stackColumnPositions.ContainsKey(item.GetStackGroup()))
          this._stackColumnPositions.SetAt(item.GetStackGroup(), this._stackedColumnsCount++);
        continue;
      }
      if (Extensions.IsRowSeries(item)) {
        if (!Extensions.IsRowSeries(item)) {
          this._rowPositions.SetAt(item, this._rowsCount++);
          continue;
        }
        if (!this._stackRowsPositions.ContainsKey(item.GetStackGroup()))
          this._stackRowsPositions.SetAt(item.GetStackGroup(), this._stackedRowsCount++);
        continue;
      }
    }
    this._areBarsIndexed = true;
  }
  GetStackPosition(series, stackGroup) {
    if (!Extensions.IsStackedSeries(series))
      return null;
    let s = this.GetStacker(series, stackGroup);
    return s == null ? null : new StackPosition().Init({
      Stacker: s,
      Position: s.GetSeriesStackPosition(series)
    });
  }
  GetStacker(series, stackGroup) {
    let stacker;
    let key = `${series.SeriesProperties}.${stackGroup}`;
    if (!this._stackers.TryGetValue(key, new System.Out(() => stacker, ($v) => stacker = $v))) {
      stacker = new Stacker();
      this._stackers.Add(key, stacker);
    }
    return stacker;
  }
}
class TooltipPlacementContext {
  constructor() {
    __publicField(this, "MostTop", Number.MAX_VALUE);
    __publicField(this, "MostBottom", Number.MIN_VALUE);
    __publicField(this, "MostRight", Number.MIN_VALUE);
    __publicField(this, "MostLeft", Number.MAX_VALUE);
    __publicField(this, "PieX", 0);
    __publicField(this, "PieY", 0);
  }
}
class LiveChartsSettings {
  constructor() {
    __publicField(this, "_currentProvider");
    __publicField(this, "_theme", {});
    __privateAdd(this, _CurrentThemeId, {});
    __publicField(this, "EasingFunction", EasingFunctions.ExponentialOut);
    __publicField(this, "AnimationsSpeed", System.TimeSpan.FromMilliseconds(800));
    __publicField(this, "ZoomSpeed", 0.2);
    __publicField(this, "ZoomMode", ZoomAndPanMode.None);
    __publicField(this, "LegendPosition", LegendPosition.Hidden);
    __publicField(this, "LegendBackgroundPaint");
    __publicField(this, "LegendTextPaint");
    __publicField(this, "LegendTextSize");
    __publicField(this, "TooltipPosition", TooltipPosition.Top);
    __publicField(this, "TooltipBackgroundPaint");
    __publicField(this, "TooltipTextPaint");
    __publicField(this, "TooltipTextSize");
    __publicField(this, "TooltipFindingStrategy", TooltipFindingStrategy.Automatic);
    __publicField(this, "PolarInitialRotation", -90);
    __publicField(this, "UpdateThrottlingTimeout", System.TimeSpan.FromMilliseconds(50));
  }
  get CurrentThemeId() {
    return __privateGet(this, _CurrentThemeId);
  }
  set CurrentThemeId(value) {
    __privateSet(this, _CurrentThemeId, value);
  }
  HasProvider(factory) {
    this._currentProvider = factory;
    return this;
  }
  GetProvider() {
    if (this._currentProvider == null)
      throw new System.NotImplementedException(`There is no a ${"ChartEngine<TDrawingContext>"} registered.`);
    return this._currentProvider;
  }
  WithAnimationsSpeed(animationsSpeed) {
    this.AnimationsSpeed = animationsSpeed;
    return this;
  }
  WithEasingFunction(easingFunction) {
    this.EasingFunction = easingFunction;
    return this;
  }
  WithZoomSpeed(speed) {
    this.ZoomSpeed = speed;
    return this;
  }
  WithZoomMode(zoomMode) {
    this.ZoomMode = zoomMode;
    return this;
  }
  WithUpdateThrottlingTimeout(timeout) {
    this.UpdateThrottlingTimeout = timeout;
    return this;
  }
  WithLegendBackgroundPaint(paint) {
    this.LegendBackgroundPaint = paint;
    return this;
  }
  WithLegendTextPaint(paint) {
    this.LegendTextPaint = paint;
    return this;
  }
  WithLegendTextSize(size) {
    this.LegendTextSize = size;
    return this;
  }
  WithTooltipBackgroundPaint(paint) {
    this.TooltipBackgroundPaint = paint;
    return this;
  }
  WithTooltipTextPaint(paint) {
    this.TooltipTextPaint = paint;
    return this;
  }
  WithTooltipTextSize(size) {
    this.TooltipTextSize = size;
    return this;
  }
  HasTheme(builder) {
    this.CurrentThemeId = {};
    let t;
    this._theme = t = new Theme();
    builder(t);
    return this;
  }
  GetTheme() {
    if (this._theme == null)
      throw new System.Exception("A theme is required.");
    return this._theme;
  }
}
_CurrentThemeId = new WeakMap();
function IsInterfaceOfIChartEntity(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_IChartEntity" in obj.constructor;
}
class NamedLabeler {
  constructor(labels) {
    __publicField(this, "_labels");
    this._labels = labels;
  }
  Function(value) {
    let index = Math.floor(value) & 4294967295;
    return index < 0 || index > this._labels.length - 1 ? "" : this._labels[index];
  }
}
const _ChartPoint = class {
  constructor(chart, series, entity) {
    __publicField(this, "_localCoordinate", Coordinate.Empty);
    __publicField(this, "IsLocalEmpty", false);
    __publicField(this, "StackedValue");
    __privateAdd(this, _Context, void 0);
    __publicField(this, "RemoveOnCompleted", false);
    this.Context = new ChartPointContext(chart, series, entity);
  }
  get IsLocalEmptyInternal() {
    return this.IsLocalEmpty;
  }
  static get Empty() {
    return new _ChartPoint(null, null, new MappedChartEntity()).Init({ IsLocalEmpty: true });
  }
  get IsEmpty() {
    return this.IsLocalEmpty || this.Context.Entity.Coordinate.IsEmpty;
  }
  get PrimaryValue() {
    return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.PrimaryValue : this._localCoordinate.PrimaryValue;
  }
  set PrimaryValue(value) {
    this.OnCoordinateChanged(new Coordinate(value, this._localCoordinate.SecondaryValue, this._localCoordinate.TertiaryValue, this._localCoordinate.QuaternaryValue, this._localCoordinate.QuinaryValue));
  }
  get SecondaryValue() {
    return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.SecondaryValue : this._localCoordinate.SecondaryValue;
  }
  set SecondaryValue(value) {
    this.OnCoordinateChanged(new Coordinate(this._localCoordinate.PrimaryValue, value, this._localCoordinate.TertiaryValue, this._localCoordinate.QuaternaryValue, this._localCoordinate.QuinaryValue));
  }
  get TertiaryValue() {
    return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.TertiaryValue : this._localCoordinate.TertiaryValue;
  }
  set TertiaryValue(value) {
    this.OnCoordinateChanged(new Coordinate(this._localCoordinate.PrimaryValue, this._localCoordinate.SecondaryValue, value, this._localCoordinate.QuaternaryValue, this._localCoordinate.QuinaryValue));
  }
  get QuaternaryValue() {
    return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.QuaternaryValue : this._localCoordinate.QuaternaryValue;
  }
  set QuaternaryValue(value) {
    this.OnCoordinateChanged(new Coordinate(this._localCoordinate.PrimaryValue, this._localCoordinate.SecondaryValue, this._localCoordinate.TertiaryValue, value, this._localCoordinate.QuinaryValue));
  }
  get QuinaryValue() {
    return this._localCoordinate.IsEmpty ? this.Context.Entity.Coordinate.QuinaryValue : this._localCoordinate.QuinaryValue;
  }
  set QuinaryValue(value) {
    this.OnCoordinateChanged(new Coordinate(this._localCoordinate.PrimaryValue, this._localCoordinate.SecondaryValue, this._localCoordinate.TertiaryValue, this._localCoordinate.QuaternaryValue, value));
  }
  get AsTooltipString() {
    return this.Context.Series.GetTooltipText(this);
  }
  get AsDataLabel() {
    return this.Context.Series.GetDataLabelText(this);
  }
  get Context() {
    return __privateGet(this, _Context);
  }
  set Context(value) {
    __privateSet(this, _Context, value);
  }
  DistanceTo(point) {
    return this.Context.HoverArea?.DistanceTo(point.Clone()) ?? Number.NaN;
  }
  OnCoordinateChanged(coordinate) {
    this._localCoordinate = coordinate;
  }
};
let ChartPoint = _ChartPoint;
_Context = new WeakMap();
class ChartPoint3 extends ChartPoint {
  constructor(point) {
    super(point.Context.Chart, point.Context.Series, point.Context.Entity);
    this.IsLocalEmpty = point.IsLocalEmptyInternal;
    this.StackedValue = point.StackedValue;
    this.Context.DataSource = point.Context.DataSource;
    this.Context.Visual = point.Context.Visual;
    this.Context.Label = point.Context.Label;
    this.Context.HoverArea = point.Context.HoverArea;
  }
  get Model() {
    return this.Context.DataSource;
  }
  get Visual() {
    return this.Context.Visual;
  }
  get Label() {
    return this.Context.Label;
  }
}
class SeriesStyleRule {
  constructor() {
    __publicField(this, "SeriesProperties", 0);
    __publicField(this, "Rule");
  }
}
class StrokeAndFillDrawable {
  constructor(stroke, fill, isHoverState = false) {
    __privateAdd(this, _Stroke, void 0);
    __privateAdd(this, _Fill, void 0);
    __publicField(this, "IsHoverState", false);
    this.Stroke = stroke;
    if (stroke != null) {
      stroke.IsStroke = true;
      stroke.IsFill = false;
    }
    this.Fill = fill;
    if (fill != null) {
      fill.IsStroke = false;
      fill.IsFill = true;
      fill.StrokeThickness = 0;
    }
    this.IsHoverState = isHoverState;
  }
  get Stroke() {
    return __privateGet(this, _Stroke);
  }
  set Stroke(value) {
    __privateSet(this, _Stroke, value);
  }
  get Fill() {
    return __privateGet(this, _Fill);
  }
  set Fill(value) {
    __privateSet(this, _Fill, value);
  }
}
_Stroke = new WeakMap();
_Fill = new WeakMap();
class CollectionDeepObserver {
  constructor(onCollectionChanged, onItemPropertyChanged, checkINotifyPropertyChanged = null) {
    __publicField(this, "_onCollectionChanged");
    __publicField(this, "_onItemPropertyChanged");
    __publicField(this, "_itemsListening", new System.HashSet());
    __publicField(this, "checkINotifyPropertyChanged", false);
    this._onCollectionChanged = onCollectionChanged;
    this._onItemPropertyChanged = onItemPropertyChanged;
    if (checkINotifyPropertyChanged != null) {
      this.checkINotifyPropertyChanged = checkINotifyPropertyChanged;
      return;
    }
    this.checkINotifyPropertyChanged = true;
  }
  Initialize(instance) {
    if (instance == null)
      return;
    if (System.IsInterfaceOfINotifyCollectionChanged(instance)) {
      const incc = instance;
      incc.CollectionChanged.Add(this.OnCollectionChanged, this);
    }
    if (this.checkINotifyPropertyChanged)
      for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(instance))
        item.PropertyChanged.Add(this._onItemPropertyChanged, this);
  }
  Dispose(instance) {
    if (instance == null)
      return;
    if (System.IsInterfaceOfINotifyCollectionChanged(instance)) {
      const incc = instance;
      incc.CollectionChanged.Remove(this.OnCollectionChanged, this);
    }
    if (this.checkINotifyPropertyChanged)
      for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(instance))
        item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
  }
  OnCollectionChanged(sender, e) {
    if (this.checkINotifyPropertyChanged)
      switch (e.Action) {
        case System.NotifyCollectionChangedAction.Add:
          for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.NewItems)) {
            item.PropertyChanged.Add(this._onItemPropertyChanged, this);
            this._itemsListening.Add(item);
          }
          break;
        case System.NotifyCollectionChangedAction.Remove:
          for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.OldItems)) {
            item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
            this._itemsListening.Remove(item);
          }
          break;
        case System.NotifyCollectionChangedAction.Replace:
          for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.NewItems)) {
            item.PropertyChanged.Add(this._onItemPropertyChanged, this);
            this._itemsListening.Add(item);
          }
          for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(e.OldItems)) {
            item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
            this._itemsListening.Remove(item);
          }
          break;
        case System.NotifyCollectionChangedAction.Reset:
          for (const item of this._itemsListening) {
            item.PropertyChanged.Remove(this._onItemPropertyChanged, this);
          }
          this._itemsListening.Clear();
          if (System.IsInterfaceOfIEnumerable(sender)) {
            const s = sender;
            for (const item of CollectionDeepObserver.GetINotifyPropertyChangedItems(s)) {
              item.PropertyChanged.Add(this._onItemPropertyChanged, this);
              this._itemsListening.Remove(item);
            }
          }
          break;
        case System.NotifyCollectionChangedAction.Move:
          break;
      }
    this._onCollectionChanged(sender, e);
  }
  static GetINotifyPropertyChangedItems(source) {
    const _$generator = function* (source2) {
      if (source2 == null)
        return;
      for (const item of source2) {
        if (System.IsInterfaceOfINotifyPropertyChanged(item)) {
          const inpc = item;
          yield inpc;
        }
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(source));
  }
}
class StackedTotal {
  constructor() {
    __publicField(this, "Positive", 0);
    __publicField(this, "Negative", 0);
  }
}
class ChartPointCleanupContext {
  constructor() {
    __publicField(this, "_toDeleteCount", 0);
  }
  static For(points) {
    for (const point of points)
      point.RemoveOnCompleted = true;
    return new ChartPointCleanupContext().Init({ _toDeleteCount: points.length });
  }
  Clean(point) {
    if (!point.RemoveOnCompleted)
      return;
    this._toDeleteCount--;
    point.RemoveOnCompleted = false;
  }
  CollectPoints(points, chartView, primaryScale, secondaryScale, disposeAction) {
    if (this._toDeleteCount == 0)
      return;
    let toDeletePoints = points.Where((p) => p.RemoveOnCompleted);
    for (const p of toDeletePoints) {
      if (p.Context.Chart != chartView)
        continue;
      disposeAction(p, primaryScale, secondaryScale);
      points.Remove(p);
    }
  }
  CollectPointsForPolar(points, chartView, scale, disposeAction) {
    if (this._toDeleteCount == 0)
      return;
    let toDeletePoints = points.Where((p) => p.RemoveOnCompleted);
    for (const p of toDeletePoints) {
      if (p.Context.Chart != chartView)
        continue;
      disposeAction(p, scale);
      points.Remove(p);
    }
  }
}
class PaintSchedule {
  constructor(task, ...geometries) {
    __publicField(this, "PaintTask");
    __publicField(this, "Geometries");
    this.PaintTask = task;
    this.Geometries = new System.HashSet(geometries);
  }
}
var DesignerKind = /* @__PURE__ */ ((DesignerKind2) => {
  DesignerKind2[DesignerKind2["Cartesian"] = 0] = "Cartesian";
  DesignerKind2[DesignerKind2["Pie"] = 1] = "Pie";
  return DesignerKind2;
})(DesignerKind || {});
const _Extensions = class {
  static GetTooltipLocation(foundPoints, tooltipSize, chart) {
    let location = null;
    if (chart instanceof CartesianChart || chart instanceof PolarChart)
      location = _Extensions._getCartesianTooltipLocation(foundPoints, chart.TooltipPosition, tooltipSize.Clone(), chart.DrawMarginSize.Clone());
    if (chart instanceof PieChart)
      location = _Extensions._getPieTooltipLocation(foundPoints, tooltipSize.Clone());
    if (location == null)
      throw new System.Exception("location not supported");
    let chartSize = chart.DrawMarginSize.Clone();
    let x = location.X;
    let y = location.Y;
    let w = chartSize.Width;
    let h = chartSize.Height;
    if (x + tooltipSize.Width > w)
      x = w - tooltipSize.Width;
    if (x < 0)
      x = 0;
    if (y < 0)
      y = 0;
    if (y + tooltipSize.Height > h)
      y = h - tooltipSize.Height;
    return new LvcPoint(x, y);
  }
  static _getCartesianTooltipLocation(foundPoints, position, tooltipSize, chartSize) {
    let count = 0;
    let placementContext = new TooltipPlacementContext();
    for (const point of foundPoints) {
      if (point.Context.HoverArea == null)
        continue;
      point.Context.HoverArea.SuggestTooltipPlacement(placementContext);
      count++;
    }
    if (count == 0)
      return null;
    if (placementContext.MostBottom > chartSize.Height - tooltipSize.Height)
      placementContext.MostBottom = chartSize.Height - tooltipSize.Height;
    if (placementContext.MostTop < 0)
      placementContext.MostTop = 0;
    let avrgX = (placementContext.MostRight + placementContext.MostLeft) / 2 - tooltipSize.Width * 0.5;
    let avrgY = (placementContext.MostTop + placementContext.MostBottom) / 2 - tooltipSize.Height * 0.5;
    return match(position).with(TooltipPosition.Top, () => new LvcPoint(avrgX, placementContext.MostTop - tooltipSize.Height)).with(TooltipPosition.Bottom, () => new LvcPoint(avrgX, placementContext.MostBottom)).with(TooltipPosition.Left, () => new LvcPoint(placementContext.MostLeft - tooltipSize.Width, avrgY)).with(TooltipPosition.Right, () => new LvcPoint(placementContext.MostRight, avrgY)).with(TooltipPosition.Center, () => new LvcPoint(avrgX, avrgY)).with(TooltipPosition.Hidden, () => new LvcPoint(0, 0)).otherwise(() => new LvcPoint(0, 0));
  }
  static _getPieTooltipLocation(foundPoints, tooltipSize) {
    let placementContext = new TooltipPlacementContext();
    let found = false;
    for (const foundPoint of foundPoints) {
      if (foundPoint.Context.HoverArea == null)
        continue;
      foundPoint.Context.HoverArea.SuggestTooltipPlacement(placementContext);
      found = true;
      break;
    }
    return found ? new LvcPoint(placementContext.PieX - tooltipSize.Width * 0.5, placementContext.PieY - tooltipSize.Height * 0.5) : null;
  }
  static GetTick(axis, controlSize, bounds = null, maxLabelSize = null) {
    bounds ?? (bounds = axis.VisibleDataBounds);
    let w = (maxLabelSize?.Width ?? 0) * 0.6;
    if (w < 20 * _Extensions.Cf)
      w = 20 * _Extensions.Cf;
    let h = maxLabelSize?.Height ?? 0;
    if (h < 12 * _Extensions.Cf)
      h = 12 * _Extensions.Cf;
    let max = axis.MaxLimit == null ? bounds.Max : axis.MaxLimit;
    let min = axis.MinLimit == null ? bounds.Min : axis.MinLimit;
    let range = max - min;
    if (range == 0)
      range = min;
    let separations = axis.Orientation == AxisOrientation.Y ? Math.round(controlSize.Height / h) : Math.round(controlSize.Width / w);
    let minimum = range / separations;
    let magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));
    let residual = minimum / magnitude;
    let tick = residual > 5 ? 10 * magnitude : residual > 2 ? 5 * magnitude : residual > 1 ? 2 * magnitude : magnitude;
    return new AxisTick().Init({ Value: tick, Magnitude: magnitude });
  }
  static GetTickForPolar(axis, chart, bounds = null) {
    bounds ?? (bounds = axis.VisibleDataBounds);
    let max = axis.MaxLimit == null ? bounds.Max : axis.MaxLimit;
    let min = axis.MinLimit == null ? bounds.Min : axis.MinLimit;
    let controlSize = chart.ControlSize.Clone();
    let minD = controlSize.Width < controlSize.Height ? controlSize.Width : controlSize.Height;
    let radius = minD - chart.InnerRadius;
    let c = minD * chart.TotalAnge / 360;
    let range = max - min;
    let separations = axis.Orientation == PolarAxisOrientation.Angle ? Math.round(c / (10 * _Extensions.Cf)) : Math.round(radius / (30 * _Extensions.Cf));
    let minimum = range / separations;
    let magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));
    let residual = minimum / magnitude;
    let tick = residual > 5 ? 10 * magnitude : residual > 2 ? 5 * magnitude : residual > 1 ? 2 * magnitude : magnitude;
    return new AxisTick().Init({ Value: tick, Magnitude: magnitude });
  }
  static TransitionateProperties(animatable, ...properties) {
    return new TransitionBuilder(animatable, properties);
  }
  static IsBarSeries(series) {
    return (series.SeriesProperties & SeriesProperties.Bar) != 0;
  }
  static IsColumnSeries(series) {
    return (series.SeriesProperties & (SeriesProperties.Bar | SeriesProperties.PrimaryAxisVerticalOrientation)) != 0;
  }
  static IsRowSeries(series) {
    return (series.SeriesProperties & (SeriesProperties.Bar | SeriesProperties.PrimaryAxisHorizontalOrientation)) != 0;
  }
  static IsStackedSeries(series) {
    return (series.SeriesProperties & SeriesProperties.Stacked) != 0;
  }
  static IsVerticalSeries(series) {
    return (series.SeriesProperties & SeriesProperties.PrimaryAxisVerticalOrientation) != 0;
  }
  static IsHorizontalSeries(series) {
    return (series.SeriesProperties & SeriesProperties.PrimaryAxisHorizontalOrientation) != 0;
  }
  static IsFinancialSeries(series) {
    return (series.SeriesProperties & SeriesProperties.Financial) != 0;
  }
  static GetTooltipFindingStrategy(seriesCollection) {
    let areAllX = true;
    let areAllY = true;
    for (const series of seriesCollection) {
      areAllX = areAllX && (series.SeriesProperties & SeriesProperties.PrefersXStrategyTooltips) != 0;
      areAllY = areAllY && (series.SeriesProperties & SeriesProperties.PrefersYStrategyTooltips) != 0;
    }
    return areAllX ? TooltipFindingStrategy.CompareOnlyXTakeClosest : areAllY ? TooltipFindingStrategy.CompareOnlyYTakeClosest : TooltipFindingStrategy.CompareAllTakeClosest;
  }
  static FindClosestTo(points, point) {
    let closest = _Extensions.FindClosestTo1(points, point.Clone());
    return closest == null ? null : new ChartPoint3(closest);
  }
  static FindClosestTo1(points, point) {
    let fp = new LvcPoint(point.X, point.Y);
    return points.Select((p) => {
      return {
        distance: p.DistanceTo(fp.Clone()),
        point: p
      };
    }).OrderBy((p) => p.distance).FirstOrDefault()?.point;
  }
  static FindClosestTo2(source, point) {
    return source.Select((visual) => {
      let location = visual.GetTargetLocation();
      let size = visual.GetTargetSize();
      return {
        distance: Math.sqrt(Math.pow(point.X - (location.X + size.Width * 0.5), 2) + Math.pow(point.Y - (location.Y + size.Height * 0.5), 2)),
        visual
      };
    }).OrderBy((p) => p.distance).FirstOrDefault()?.visual;
  }
  static GetNextScaler(axis, chart) {
    return Scaler.Make(chart.DrawMarginLocation.Clone(), chart.DrawMarginSize.Clone(), axis);
  }
  static GetActualScaler(axis, chart) {
    return !axis.ActualBounds.HasPreviousState ? null : Scaler.Make(chart.ActualBounds.Location.Clone(), chart.ActualBounds.Size.Clone(), axis, new Bounds().Init({
      Max: axis.ActualBounds.MaxVisibleBound,
      Min: axis.ActualBounds.MinVisibleBound
    }));
  }
  static SelectFirst(source, predicate) {
    const _$generator = function* (source2, predicate2) {
      for (const item of source2) {
        yield predicate2(item);
        return;
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(source, predicate));
  }
  static SplitByNullGaps(points, onDeleteNullPoint) {
    const _$generator = function* (points2, onDeleteNullPoint2) {
      let builder = new GapsBuilder(points2.GetEnumerator());
      while (!builder.Finished)
        yield _Extensions.YieldReturnUntilNextNullChartPoint(builder, onDeleteNullPoint2);
      builder.Dispose();
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(points, onDeleteNullPoint));
  }
  static AsSplineData(source) {
    const _$generator = function* (source2) {
      let e = source2.Where((x) => !x.IsEmpty).GetEnumerator();
      if (!e.MoveNext())
        return;
      let data = new SplineData(e.Current);
      if (!e.MoveNext()) {
        yield data;
        return;
      }
      data.GoNext(e.Current);
      while (e.MoveNext()) {
        yield data;
        data.IsFirst = false;
        data.GoNext(e.Current);
      }
      data.IsFirst = false;
      yield data;
      data.GoNext(data.Next);
      yield data;
      e.Dispose();
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(source));
  }
  static YieldReturnUntilNextNullChartPoint(builder, onDeleteNullPoint) {
    const _$generator = function* (builder2, onDeleteNullPoint2) {
      while (builder2.Enumerator.MoveNext()) {
        if (builder2.Enumerator.Current.IsEmpty) {
          let wasEmpty = builder2.IsEmpty;
          builder2.IsEmpty = true;
          onDeleteNullPoint2(builder2.Enumerator.Current);
          if (!wasEmpty)
            return;
        } else {
          yield builder2.Enumerator.Current;
          builder2.IsEmpty = false;
        }
      }
      builder2.Finished = true;
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(builder, onDeleteNullPoint));
  }
};
let Extensions = _Extensions;
__publicField(Extensions, "Cf", 3);
class GapsBuilder {
  constructor(enumerator) {
    __privateAdd(this, _Enumerator, void 0);
    __publicField(this, "IsEmpty", true);
    __publicField(this, "Finished", false);
    this.Enumerator = enumerator;
  }
  get Enumerator() {
    return __privateGet(this, _Enumerator);
  }
  set Enumerator(value) {
    __privateSet(this, _Enumerator, value);
  }
  Dispose() {
    this.Enumerator.Dispose();
  }
}
_Enumerator = new WeakMap();
__publicField(GapsBuilder, "$meta_System_IDisposable", true);
class SplineData {
  constructor(start) {
    __publicField(this, "Previous");
    __publicField(this, "Current");
    __publicField(this, "Next");
    __publicField(this, "AfterNext");
    __publicField(this, "IsFirst", true);
    this.Previous = start;
    this.Current = start;
    this.Next = start;
    this.AfterNext = start;
  }
  GoNext(point) {
    this.Previous = this.Current;
    this.Current = this.Next;
    this.Next = this.AfterNext;
    this.AfterNext = point;
  }
}
class ChartUpdateParams {
  constructor() {
    __publicField(this, "IsAutomaticUpdate", true);
    __publicField(this, "Throttling", true);
  }
}
class StackedValue {
  constructor() {
    __publicField(this, "Start", 0);
    __publicField(this, "End", 0);
    __publicField(this, "Total", 0);
    __publicField(this, "NegativeStart", 0);
    __publicField(this, "NegativeEnd", 0);
    __publicField(this, "NegativeTotal", 0);
  }
  get Share() {
    return (this.End - this.Start) / this.Total;
  }
}
class LineSegment extends Animatable {
  constructor() {
    super();
    __publicField(this, "_xiProperty");
    __publicField(this, "_yiProperty");
    __publicField(this, "_xjProperty");
    __publicField(this, "_yjProperty");
    __publicField(this, "Id", 0);
    this._xiProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xi", 0));
    this._yiProperty = this.RegisterMotionProperty(new FloatMotionProperty("Yi", 0));
    this._xjProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xj", 0));
    this._yjProperty = this.RegisterMotionProperty(new FloatMotionProperty("Yj", 0));
  }
  get Xi() {
    return this._xiProperty.GetMovement(this);
  }
  set Xi(value) {
    this._xiProperty.SetMovement(value, this);
  }
  get Yi() {
    return this._yiProperty.GetMovement(this);
  }
  set Yi(value) {
    this._yiProperty.SetMovement(value, this);
  }
  get Xj() {
    return this._xjProperty.GetMovement(this);
  }
  set Xj(value) {
    this._xjProperty.SetMovement(value, this);
  }
  get Yj() {
    return this._yjProperty.GetMovement(this);
  }
  set Yj(value) {
    this._yjProperty.SetMovement(value, this);
  }
  Follows(segment) {
    this.IsValid = segment.IsValid;
    this.CurrentTime = segment.CurrentTime;
    this.RemoveOnCompleted = segment.RemoveOnCompleted;
    let xProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Xj");
    let yProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Yj");
    this.MotionProperties.GetAt("Xi").CopyFrom(xProp);
    this.MotionProperties.GetAt("Xj").CopyFrom(xProp);
    this.MotionProperties.GetAt("Yi").CopyFrom(yProp);
    this.MotionProperties.GetAt("Yj").CopyFrom(yProp);
  }
}
class CubicBezierSegment extends Animatable {
  constructor() {
    super();
    __publicField(this, "_xiProperty");
    __publicField(this, "_yiProperty");
    __publicField(this, "_xmProperty");
    __publicField(this, "_ymProperty");
    __publicField(this, "_xjProperty");
    __publicField(this, "_yjProperty");
    __publicField(this, "Id", 0);
    this._xiProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xi", 0));
    this._yiProperty = this.RegisterMotionProperty(new FloatMotionProperty("Yi", 0));
    this._xmProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xm", 0));
    this._ymProperty = this.RegisterMotionProperty(new FloatMotionProperty("Ym", 0));
    this._xjProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xj", 0));
    this._yjProperty = this.RegisterMotionProperty(new FloatMotionProperty("Yj", 0));
  }
  get Xi() {
    return this._xiProperty.GetMovement(this);
  }
  set Xi(value) {
    this._xiProperty.SetMovement(value, this);
  }
  get Yi() {
    return this._yiProperty.GetMovement(this);
  }
  set Yi(value) {
    this._yiProperty.SetMovement(value, this);
  }
  get Xm() {
    return this._xmProperty.GetMovement(this);
  }
  set Xm(value) {
    this._xmProperty.SetMovement(value, this);
  }
  get Ym() {
    return this._ymProperty.GetMovement(this);
  }
  set Ym(value) {
    this._ymProperty.SetMovement(value, this);
  }
  get Xj() {
    return this._xjProperty.GetMovement(this);
  }
  set Xj(value) {
    this._xjProperty.SetMovement(value, this);
  }
  get Yj() {
    return this._yjProperty.GetMovement(this);
  }
  set Yj(value) {
    this._yjProperty.SetMovement(value, this);
  }
  Follows(segment) {
    this.IsValid = segment.IsValid;
    this.CurrentTime = segment.CurrentTime;
    this.RemoveOnCompleted = segment.RemoveOnCompleted;
    let xProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Xj");
    let yProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Yj");
    this.MotionProperties.GetAt("Xi").CopyFrom(xProp);
    this.MotionProperties.GetAt("Xm").CopyFrom(xProp);
    this.MotionProperties.GetAt("Xj").CopyFrom(xProp);
    this.MotionProperties.GetAt("Yi").CopyFrom(yProp);
    this.MotionProperties.GetAt("Ym").CopyFrom(yProp);
    this.MotionProperties.GetAt("Yj").CopyFrom(yProp);
  }
}
class StepLineSegment extends Animatable {
  constructor() {
    super();
    __publicField(this, "_xiProperty");
    __publicField(this, "_yiProperty");
    __publicField(this, "_xjProperty");
    __publicField(this, "_yjProperty");
    __publicField(this, "Id", 0);
    this._xiProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xi", 0));
    this._yiProperty = this.RegisterMotionProperty(new FloatMotionProperty("Yi", 0));
    this._xjProperty = this.RegisterMotionProperty(new FloatMotionProperty("Xj", 0));
    this._yjProperty = this.RegisterMotionProperty(new FloatMotionProperty("Yj", 0));
  }
  get Xi() {
    return this._xiProperty.GetMovement(this);
  }
  set Xi(value) {
    this._xiProperty.SetMovement(value, this);
  }
  get Yi() {
    return this._yiProperty.GetMovement(this);
  }
  set Yi(value) {
    this._yiProperty.SetMovement(value, this);
  }
  get Xj() {
    return this._xjProperty.GetMovement(this);
  }
  set Xj(value) {
    this._xjProperty.SetMovement(value, this);
  }
  get Yj() {
    return this._yjProperty.GetMovement(this);
  }
  set Yj(value) {
    this._yjProperty.SetMovement(value, this);
  }
  Follows(segment) {
    this.IsValid = segment.IsValid;
    this.CurrentTime = segment.CurrentTime;
    this.RemoveOnCompleted = segment.RemoveOnCompleted;
    let xProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Xj");
    let yProp = segment.MotionProperties.GetAt("IConsecutivePathSegment.Yj");
    this.MotionProperties.GetAt("Xi").CopyFrom(xProp);
    this.MotionProperties.GetAt("Xj").CopyFrom(xProp);
    this.MotionProperties.GetAt("Yi").CopyFrom(yProp);
    this.MotionProperties.GetAt("Yj").CopyFrom(yProp);
  }
}
class HoverArea {
}
class BezierData {
  constructor(chartPoint) {
    __publicField(this, "TargetPoint");
    __publicField(this, "X0", 0);
    __publicField(this, "Y0", 0);
    __publicField(this, "X1", 0);
    __publicField(this, "Y1", 0);
    __publicField(this, "X2", 0);
    __publicField(this, "Y2", 0);
    this.TargetPoint = chartPoint;
    this.X0 = this.Y0 = this.X1 = this.Y1 = this.X2 = this.Y2 = 0;
  }
}
class Sketch {
  constructor() {
    __publicField(this, "Width", 0);
    __publicField(this, "Height", 0);
    __publicField(this, "PaintSchedules", new System.List());
  }
}
class RectangleHoverArea extends HoverArea {
  constructor() {
    super();
    __publicField(this, "X", 0);
    __publicField(this, "Y", 0);
    __publicField(this, "Width", 0);
    __publicField(this, "Height", 0);
  }
  SetDimensions(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
    return this;
  }
  DistanceTo(point) {
    let cx = this.X + this.Width * 0.5;
    let cy = this.Y + this.Height * 0.5;
    return Math.sqrt(Math.pow(point.X - cx, 2) + Math.pow(point.Y - cy, 2));
  }
  IsPointerOver(pointerLocation, strategy) {
    let w = this.Width < 1 ? 1 : this.Width;
    let h = this.Height < 1 ? 1 : this.Height;
    let isInX = pointerLocation.X > this.X && pointerLocation.X < this.X + w;
    let isInY = pointerLocation.Y > this.Y && pointerLocation.Y < this.Y + h;
    switch (strategy) {
      case TooltipFindingStrategy.CompareOnlyX:
      case TooltipFindingStrategy.CompareOnlyXTakeClosest:
        return isInX;
      case TooltipFindingStrategy.CompareOnlyY:
      case TooltipFindingStrategy.CompareOnlyYTakeClosest:
        return isInY;
      case TooltipFindingStrategy.CompareAll:
      case TooltipFindingStrategy.CompareAllTakeClosest:
        return isInX && isInY;
      case TooltipFindingStrategy.Automatic:
        throw new System.Exception(`The strategy ${strategy} is not supported.`);
      default:
        throw new System.NotImplementedException();
    }
  }
  SuggestTooltipPlacement(cartesianContext) {
    if (this.Y < cartesianContext.MostTop)
      cartesianContext.MostTop = this.Y;
    if (this.Y + this.Height > cartesianContext.MostBottom)
      cartesianContext.MostBottom = this.Y + this.Height;
    if (this.X + this.Width > cartesianContext.MostRight)
      cartesianContext.MostRight = this.X + this.Width;
    if (this.X < cartesianContext.MostLeft)
      cartesianContext.MostLeft = this.X;
  }
}
class SemicircleHoverArea extends HoverArea {
  constructor() {
    super(...arguments);
    __publicField(this, "CenterX", 0);
    __publicField(this, "CenterY", 0);
    __publicField(this, "StartAngle", 0);
    __publicField(this, "EndAngle", 0);
    __publicField(this, "Radius", 0);
  }
  SetDimensions(centerX, centerY, startAngle, endAngle, radius) {
    this.CenterX = centerX;
    this.CenterY = centerY;
    this.StartAngle = startAngle;
    this.EndAngle = endAngle;
    this.Radius = radius;
    return this;
  }
  DistanceTo(point) {
    let a = (this.StartAngle + this.EndAngle) * 0.5;
    let r = this.Radius * 0.5;
    a *= Math.PI / 180;
    let y = r * Math.cos(a);
    let x = r * Math.sin(a);
    return Math.sqrt(Math.pow(point.X - x, 2) + Math.pow(point.Y - y, 2));
  }
  IsPointerOver(pointerLocation, strategy) {
    let startAngle = this.StartAngle;
    startAngle %= 360;
    if (startAngle < 0)
      startAngle += 360;
    let endAngle = this.EndAngle - 0.01;
    endAngle %= 360;
    if (endAngle < 0)
      endAngle += 360;
    let dx = this.CenterX - pointerLocation.X;
    let dy = this.CenterY - pointerLocation.Y;
    let beta = Math.atan(dy / dx) * (180 / Math.PI);
    if (dx > 0 && dy < 0 || dx > 0 && dy > 0)
      beta += 180;
    if (dx < 0 && dy > 0)
      beta += 360;
    let r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (endAngle > startAngle) {
      return startAngle <= beta && endAngle >= beta && r < this.Radius;
    }
    if (beta < startAngle)
      beta += 360;
    return startAngle <= beta && endAngle + 360 >= beta && r < this.Radius;
  }
  SuggestTooltipPlacement(context) {
    let angle = (this.StartAngle + this.EndAngle) / 2;
    context.PieX = this.CenterX + Math.cos(angle * (Math.PI / 180)) * this.Radius;
    context.PieY = this.CenterY + Math.sin(angle * (Math.PI / 180)) * this.Radius;
  }
}
function IsInterfaceOfIPolarChartView(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_IPolarChartView" in obj.constructor;
}
function IsInterfaceOfIPieSeries(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_IPieSeries" in obj.constructor;
}
function IsInterfaceOfICartesianChartView(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && "$meta_LiveChartsCore_ICartesianChartView" in obj.constructor;
}
class DataFactory {
  constructor() {
    __publicField(this, "_isTModelChartEntity", false);
    __publicField(this, "_chartRefEntityMap", new System.Dictionary());
    __publicField(this, "_series");
    __publicField(this, "PreviousKnownBounds", new DimensionalBounds(true));
    let bounds = new DimensionalBounds(true);
    this.PreviousKnownBounds = bounds;
  }
  Fetch(series, chart) {
    const _$generator = function* (series2, chart2) {
      if (series2.Values == null)
        return;
      this._series = series2;
      for (const value of this.GetEntities(series2, chart2)) {
        let point;
        if (value == null) {
          yield ChartPoint.Empty;
          continue;
        }
        if (value.ChartPoints != null && value.ChartPoints.TryGetValue(chart2.View, new System.Out(() => point, ($v) => point = $v)))
          yield point;
        else
          yield ChartPoint.Empty;
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(series, chart));
  }
  DisposePoint(point) {
    let d;
    if (this._isTModelChartEntity)
      return;
    let canvas = point.Context.Chart.CoreChart.Canvas;
    this._chartRefEntityMap.TryGetValue(canvas.Sync, new System.Out(() => d, ($v) => d = $v));
    let map = d;
    if (map == null)
      return;
    let src = point.Context.DataSource;
    if (src == null)
      return;
    map.Remove(src);
  }
  Dispose(chart) {
    this._series = null;
    if (this._isTModelChartEntity)
      return;
    let canvas = chart.Canvas;
    this._chartRefEntityMap.Remove(canvas.Sync);
  }
  GetCartesianBounds(chart, series, plane1, plane2) {
    let stack = chart.SeriesContext.GetStackPosition(series, series.GetStackGroup());
    let xMin = plane1.MinLimit ?? Number.MIN_VALUE;
    let xMax = plane1.MaxLimit ?? Number.MAX_VALUE;
    let yMin = plane2.MinLimit ?? Number.MIN_VALUE;
    let yMax = plane2.MaxLimit ?? Number.MAX_VALUE;
    let hasData = false;
    let bounds = new DimensionalBounds();
    let previous = null;
    for (const point of series.Fetch(chart)) {
      if (point.IsEmpty)
        continue;
      let primary = point.PrimaryValue;
      let secondary = point.SecondaryValue;
      let tertiary = point.TertiaryValue;
      if (stack != null)
        primary = stack.StackPoint(point);
      bounds.PrimaryBounds.AppendValue(primary);
      bounds.SecondaryBounds.AppendValue(secondary);
      bounds.TertiaryBounds.AppendValue(tertiary);
      if (primary >= yMin && primary <= yMax && secondary >= xMin && secondary <= xMax) {
        bounds.VisiblePrimaryBounds.AppendValue(primary);
        bounds.VisibleSecondaryBounds.AppendValue(secondary);
        bounds.VisibleTertiaryBounds.AppendValue(tertiary);
      }
      if (previous != null) {
        let dx = Math.abs(previous.SecondaryValue - point.SecondaryValue);
        let dy = Math.abs(previous.PrimaryValue - point.PrimaryValue);
        if (dx < bounds.SecondaryBounds.MinDelta)
          bounds.SecondaryBounds.MinDelta = dx;
        if (dy < bounds.PrimaryBounds.MinDelta)
          bounds.PrimaryBounds.MinDelta = dy;
      }
      previous = point;
      hasData = true;
    }
    return !hasData ? new SeriesBounds(this.PreviousKnownBounds, true) : new SeriesBounds(this.PreviousKnownBounds = bounds, false);
  }
  GetFinancialBounds(chart, series, x, y) {
    let xMin = x.MinLimit ?? Number.MIN_VALUE;
    let xMax = x.MaxLimit ?? Number.MAX_VALUE;
    let yMin = y.MinLimit ?? Number.MIN_VALUE;
    let yMax = y.MaxLimit ?? Number.MAX_VALUE;
    let hasData = false;
    let bounds = new DimensionalBounds();
    let previous = null;
    for (const point of series.Fetch(chart)) {
      if (point.IsEmpty)
        continue;
      let primaryMax = point.PrimaryValue;
      let primaryMin = point.QuinaryValue;
      let secondary = point.SecondaryValue;
      let tertiary = point.TertiaryValue;
      bounds.PrimaryBounds.AppendValue(primaryMax);
      bounds.PrimaryBounds.AppendValue(primaryMin);
      bounds.SecondaryBounds.AppendValue(secondary);
      bounds.TertiaryBounds.AppendValue(tertiary);
      if (primaryMax >= yMin && primaryMin <= yMax && secondary >= xMin && secondary <= xMax) {
        bounds.VisiblePrimaryBounds.AppendValue(primaryMax);
        bounds.VisiblePrimaryBounds.AppendValue(primaryMin);
        bounds.VisibleSecondaryBounds.AppendValue(secondary);
        bounds.VisibleTertiaryBounds.AppendValue(tertiary);
      }
      if (previous != null) {
        let dx = Math.abs(previous.SecondaryValue - point.SecondaryValue);
        let dy = Math.abs(previous.PrimaryValue - point.PrimaryValue);
        if (dx < bounds.SecondaryBounds.MinDelta)
          bounds.SecondaryBounds.MinDelta = dx;
        if (dy < bounds.PrimaryBounds.MinDelta)
          bounds.PrimaryBounds.MinDelta = dy;
      }
      previous = point;
      hasData = true;
    }
    return !hasData ? new SeriesBounds(this.PreviousKnownBounds, true) : new SeriesBounds(this.PreviousKnownBounds = bounds, false);
  }
  GetPieBounds(chart, series) {
    let stack = chart.SeriesContext.GetStackPosition(series, series.GetStackGroup());
    if (stack == null)
      throw new System.Exception("Unexpected null stacker");
    let bounds = new DimensionalBounds();
    let hasData = false;
    for (const point of series.Fetch(chart)) {
      if (point.IsEmpty)
        continue;
      stack.StackPoint(point);
      bounds.PrimaryBounds.AppendValue(point.PrimaryValue);
      bounds.SecondaryBounds.AppendValue(point.SecondaryValue);
      bounds.TertiaryBounds.AppendValue(series.Pushout > series.HoverPushout ? series.Pushout : series.HoverPushout);
      hasData = true;
    }
    if (!hasData) {
      bounds.PrimaryBounds.AppendValue(0);
      bounds.SecondaryBounds.AppendValue(0);
      bounds.TertiaryBounds.AppendValue(0);
    }
    return new SeriesBounds(bounds, false);
  }
  RestartVisuals() {
    throw new System.NotImplementedException("DataFactory.RestartVisuals");
  }
  GetEntities(series, chart) {
    this._isTModelChartEntity = IsInterfaceOfIChartEntity(series.Values.First((t) => t != null));
    return this._isTModelChartEntity ? this.EnumerateChartEntities(series, chart) : this.EnumerateByRefEntities(series, chart);
  }
  EnumerateChartEntities(series, chart) {
    const _$generator = function* (series2, chart2) {
      if (series2.Values == null)
        return;
      let entities = series2.Values;
      let index = 0;
      for (const entity of entities) {
        let point;
        if (entity == null) {
          index++;
          yield new MappedChartEntity();
          continue;
        }
        entity.ChartPoints ?? (entity.ChartPoints = new System.Dictionary());
        if (!entity.ChartPoints.TryGetValue(chart2.View, new System.Out(() => point, ($v) => point = $v))) {
          point = new ChartPoint(chart2.View, series2, entity);
          entity.ChartPoints.SetAt(chart2.View, point);
        }
        point.Context.DataSource = entity;
        entity.EntityIndex = index++;
        yield entity;
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(series, chart));
  }
  EnumerateByRefEntities(series, chart) {
    const _$generator = function* (series2, chart2) {
      let d;
      if (series2.Values == null)
        return;
      let canvas = chart2.Canvas;
      let mapper = series2.Mapping;
      if (mapper == null)
        throw new System.Exception("series has no mapper");
      let index = 0;
      if (!this._chartRefEntityMap.TryGetValue(canvas.Sync, new System.Out(() => d, ($v) => d = $v))) {
        d = new System.Dictionary();
        this._chartRefEntityMap.SetAt(canvas.Sync, d);
      }
      let IndexEntityMap = d;
      for (const item of series2.Values) {
        let entity;
        let point;
        if (item == null) {
          yield new MappedChartEntity();
          index++;
          continue;
        }
        if (!IndexEntityMap.TryGetValue(item, new System.Out(() => entity, ($v) => entity = $v))) {
          IndexEntityMap.SetAt(item, entity = new MappedChartEntity().Init({
            ChartPoints: new System.Dictionary()
          }));
        }
        if (!entity.ChartPoints.TryGetValue(chart2.View, new System.Out(() => point, ($v) => point = $v))) {
          point = new ChartPoint(chart2.View, series2, entity);
          entity.ChartPoints.SetAt(chart2.View, point);
        }
        point.Context.DataSource = item;
        entity.EntityIndex = index++;
        mapper(item, point);
        entity.UpdateCoordinate(point);
        yield entity;
      }
    }.bind(this);
    return System.EnumerableFrom(() => _$generator(series, chart));
  }
}
class ChartEngine {
  GetDefaultDataFactory() {
    return new DataFactory();
  }
}
class PanGestureEventArgs {
  constructor(delta) {
    __publicField(this, "Delta", LvcPoint.Empty.Clone());
    __publicField(this, "Handled", false);
    this.Delta = delta.Clone();
    this.Handled = false;
  }
}
class VisualElementsEventArgs {
  constructor(visualElements, pointerLocation) {
    __publicField(this, "_closer");
    __privateAdd(this, _PointerLocation, LvcPoint.Empty.Clone());
    __privateAdd(this, _VisualElements2, void 0);
    this.PointerLocation = pointerLocation.Clone();
    this.VisualElements = visualElements;
  }
  get PointerLocation() {
    return __privateGet(this, _PointerLocation);
  }
  set PointerLocation(value) {
    __privateSet(this, _PointerLocation, value);
  }
  get ClosestToPointerVisualElement() {
    return this._closer ?? (this._closer = this.FindClosest());
  }
  get VisualElements() {
    return __privateGet(this, _VisualElements2);
  }
  set VisualElements(value) {
    __privateSet(this, _VisualElements2, value);
  }
  FindClosest() {
    return Extensions.FindClosestTo2(this.VisualElements, this.PointerLocation.Clone());
  }
}
_PointerLocation = new WeakMap();
_VisualElements2 = new WeakMap();
class AxisVisualSeprator {
  constructor() {
    __publicField(this, "Value", 0);
    __publicField(this, "Label");
    __publicField(this, "Separator");
    __publicField(this, "Tick");
    __publicField(this, "Subseparators");
    __publicField(this, "Subticks");
  }
  get Geometry() {
    return this.Separator;
  }
}
class RadialAxisVisualSeparator {
  constructor() {
    __publicField(this, "Value", 0);
    __publicField(this, "Label");
    __publicField(this, "Circle");
  }
  get Geometry() {
    return this.Circle;
  }
}
export { ActionThrottler, Align, Animatable, AnimatableAxisBounds, AnimatableContainer, Animation, Axis, AxisOrientation, AxisPosition, AxisTick, AxisVisualSeprator, BackEasingFunction, BarSeries, BezierData, BezierVisualPoint, BounceEasingFunction, Bounds, CartesianChart, CartesianSeries, Chart, ChartElement, ChartEngine, ChartPoint, ChartPoint3, ChartPointCleanupContext, ChartPointContext, ChartSeries, ChartUpdateParams, CircleEasingFunction, CollectionDeepObserver, ColorMotionProperty, ColorPalletes, ColorStop, ColumnSeries, ConditionalDrawExtensions, ConditionalPaintBuilder, ContainerOrientation, ControlCoordinatesProjector, Coordinate, CoreMap, CubicBezierEasingFunction, CubicBezierSegment, CubicEasingFunction, DataFactory, DataLabelsPosition, DateTimePoint, DelayedFunction, DesignerKind, DimensionalBounds, DoubleMotionProperty, DrawMarginFrame, DrawMarginFrame2, DrawingContext, EasingFunctions, ElasticEasingFunction, ExponentialEasingFunction, Extensions, FinancialPoint, FinancialSeries, FloatMotionProperty, GapsBuilder, GeoJsonFeature, GeoJsonFile, GeoMap, HeatFunctions, HeatLandSeries, HeatSeries, HoverArea, IsInterfaceOfIAnimatable, IsInterfaceOfICartesianChartView, IsInterfaceOfIChartEntity, IsInterfaceOfIImageControl, IsInterfaceOfILabelGeometry, IsInterfaceOfIPieSeries, IsInterfaceOfIPolarChartView, IsInterfaceOfIRoundedRectangleChartPoint, IsInterfaceOfISeries, KeyFrame, Labelers, LandData, LandDefinition, LegendOrientation, LegendPosition, LineSegment, LineSeries, LiveCharts, LiveChartsSettings, LiveChartsStylerExtensions, LvcColor, LvcPoint, LvcPointD, LvcRectangle, LvcSize, MapContext, MapLayer, MapProjection, MapProjector, MapShapeContext, MappedChartEntity, Maps, Margin, MeasureUnit, MercatorProjector, MotionCanvas, MotionProperty, MultiPoligonGeometry, NamedLabeler, NullableDoubleMotionProperty, ObservablePoint, ObservablePolarPoint, ObservableValue, Padding, PaintSchedule, PanGestureEventArgs, PieChart, PieSeries, PointMotionProperty, PolarAxis, PolarAxisOrientation, PolarChart, PolarLabelsPosition, PolarLineSeries, PolarScaler, PolinominalEasingFunction, RadialAlignment, RadialAxisVisualSeparator, RectangleHoverArea, RelativePanel, RowSeries, Scaler, ScatterSeries, Section, Section2, SemicircleHoverArea, Series, SeriesBounds, SeriesContext, SeriesProperties, SeriesStyleRule, SizeMotionProperty, Sketch, SplineData, StackPanel, StackPosition, StackedAreaSeries, StackedColumnSeries, StackedRowSeries, StackedStepAreaSeries, StackedTotal, StackedValue, Stacker, StepLineSegment, StepLineSeries, StepLineVisualPoint, StrokeAndFillCartesianSeries, StrokeAndFillDrawable, Theme, TimeSpanPoint, TooltipFindingStrategy, TooltipPlacementContext, TooltipPosition, TransitionBuilder, VectorClosingMethod, VectorManager, VisualElement, VisualElementsEventArgs, WeightedPoint, ZoomAndPanMode, ZoomDirection, ZoomOnPointerView };
