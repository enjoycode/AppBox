using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using LiveChartsCore.Drawing;
using LiveChartsCore.Kernel;
using LiveChartsCore.Kernel.Events;
using LiveChartsCore.Kernel.Sketches;
using LiveChartsCore.Measure;
using LiveChartsCore.Motion;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Drawing;
using LiveChartsCore.SkiaSharpView.SKCharts;
using LiveChartsCore.VisualElements;
using PixUI;
using LCC = LiveChartsCore;

namespace PixLiveCharts;

public abstract class ChartView : Widget, IChartView<SkiaSharpDrawingContext>
{
    protected ChartView(IChartTooltip<SkiaSharpDrawingContext>? tooltip,
        IChartLegend<SkiaSharpDrawingContext>? legend)
    {
        if (tooltip != null) this.tooltip = tooltip;
        if (legend != null) this.legend = legend;

        if (!LCC.LiveCharts.IsConfigured)
            LCC.LiveCharts.Configure(config => config.UseDefaults());

        InitializeCore();

        _visualsObserver = new CollectionDeepObserver<ChartElement<SkiaSharpDrawingContext>>(
            (s, e) => OnPropertyChanged(),
            (s, e) => OnPropertyChanged(), true);

        if (core is null) throw new Exception("Core not found!");
        // core.Measuring += OnCoreMeasuring;
        // core.UpdateStarted += OnCoreUpdateStarted;
        // core.UpdateFinished += OnCoreUpdateFinished;
    }

    #region ====Fields====

    protected LiveChartsCore.Chart<SkiaSharpDrawingContext>? core;

    protected IChartLegend<SkiaSharpDrawingContext>? legend = new SKDefaultLegend();

    protected IChartTooltip<SkiaSharpDrawingContext>? tooltip = new SKDefaultTooltip();

    private LegendPosition _legendPosition = LiveChartsCore.LiveCharts.DefaultSettings.LegendPosition;
    private Margin? _drawMargin = null;
    private TooltipPosition _tooltipPosition = LiveChartsCore.LiveCharts.DefaultSettings.TooltipPosition;
    private VisualElement<SkiaSharpDrawingContext>? _title;
    private readonly CollectionDeepObserver<ChartElement<SkiaSharpDrawingContext>> _visualsObserver;

    private IEnumerable<ChartElement<SkiaSharpDrawingContext>> _visuals =
        new List<ChartElement<SkiaSharpDrawingContext>>();

    private IPaint<SkiaSharpDrawingContext>? _legendTextPaint =
        (IPaint<SkiaSharpDrawingContext>?)LiveChartsCore.LiveCharts.DefaultSettings.LegendTextPaint;

    private IPaint<SkiaSharpDrawingContext>? _legendBackgroundPaint =
        (IPaint<SkiaSharpDrawingContext>?)LiveChartsCore.LiveCharts.DefaultSettings.LegendBackgroundPaint;

    private double? _legendTextSize = LiveChartsCore.LiveCharts.DefaultSettings.LegendTextSize;

    private IPaint<SkiaSharpDrawingContext>? _tooltipTextPaint =
        (IPaint<SkiaSharpDrawingContext>?)LiveChartsCore.LiveCharts.DefaultSettings.TooltipTextPaint;

    private IPaint<SkiaSharpDrawingContext>? _tooltipBackgroundPaint =
        (IPaint<SkiaSharpDrawingContext>?)LiveChartsCore.LiveCharts.DefaultSettings.TooltipBackgroundPaint;

    private double? _tooltipTextSize = LiveChartsCore.LiveCharts.DefaultSettings.TooltipTextSize;

    #endregion

    #region ====IChartView====

    public IChart CoreChart => core!;
    public bool DesignerMode => false;

    public LvcColor BackColor { get; set; } = LvcColor.FromRGB(255, 255, 255);

    public LvcSize ControlSize =>
        // return the full control size as a workaround when the legend is not set.
        // for some reason WinForms has not loaded the correct size at this point when the control loads.
        LegendPosition == LegendPosition.Hidden
            ? new LvcSize { Width = W, Height = H }
            : new LvcSize { Width = W, Height = H };

    public Margin? DrawMargin
    {
        get => _drawMargin;
        set
        {
            _drawMargin = value;
            OnPropertyChanged();
        }
    }

    public TimeSpan AnimationsSpeed { get; set; } = LCC.LiveCharts.DefaultSettings.AnimationsSpeed;

    public Func<float, float>? EasingFunction { get; set; } = LCC.LiveCharts.DefaultSettings.EasingFunction;

    public TimeSpan UpdaterThrottler { get; set; } = LCC.LiveCharts.DefaultSettings.UpdateThrottlingTimeout;

    public LegendPosition LegendPosition
    {
        get => _legendPosition;
        set
        {
            _legendPosition = value;
            OnPropertyChanged();
        }
    }

    public TooltipPosition TooltipPosition
    {
        get => _tooltipPosition;
        set
        {
            _tooltipPosition = value;
            OnPropertyChanged();
        }
    }

    public event ChartPointsHandler? DataPointerDown;
    public event ChartPointHandler? ChartPointPointerDown;

    public void OnDataPointerDown(IEnumerable<ChartPoint> points, LvcPoint pointer)
    {
        throw new NotImplementedException();
    }

    public object SyncContext
    {
        get => CoreCanvas.Sync;
        set
        {
            CoreCanvas.Sync = value;
            OnPropertyChanged();
        }
    }

    public void InvokeOnUIThread(Action action)
    {
        if (!IsMounted) return;

        UIApplication.Current.BeginInvoke(action);
    }

    void IChartView.Invalidate() //TODO: rename IChartView.Invalidate()
        => CoreCanvas.Invalidate();

    public IPaint<SkiaSharpDrawingContext>? LegendTextPaint
    {
        get => _legendTextPaint;
        set
        {
            _legendTextPaint = value;
            OnPropertyChanged();
        }
    }

    public IPaint<SkiaSharpDrawingContext>? LegendBackgroundPaint
    {
        get => _legendBackgroundPaint;
        set
        {
            _legendBackgroundPaint = value;
            OnPropertyChanged();
        }
    }

    public double? LegendTextSize
    {
        get => _legendTextSize;
        set
        {
            _legendTextSize = value;
            OnPropertyChanged();
        }
    }

    public IPaint<SkiaSharpDrawingContext>? TooltipTextPaint
    {
        get => _tooltipTextPaint;
        set
        {
            _tooltipTextPaint = value;
            OnPropertyChanged();
        }
    }

    public IPaint<SkiaSharpDrawingContext>? TooltipBackgroundPaint
    {
        get => _tooltipBackgroundPaint;
        set
        {
            _tooltipBackgroundPaint = value;
            OnPropertyChanged();
        }
    }

    public double? TooltipTextSize
    {
        get => _tooltipTextSize;
        set
        {
            _tooltipTextSize = value;
            OnPropertyChanged();
        }
    }

    public VisualElement<SkiaSharpDrawingContext>? Title
    {
        get => _title;
        set
        {
            _title = value;
            OnPropertyChanged();
        }
    }

    public event ChartEventHandler<SkiaSharpDrawingContext>? Measuring;
    public event ChartEventHandler<SkiaSharpDrawingContext>? UpdateStarted;
    public event ChartEventHandler<SkiaSharpDrawingContext>? UpdateFinished;
    public event VisualElementHandler<SkiaSharpDrawingContext>? VisualElementsPointerDown;

    public bool AutoUpdateEnabled { get; set; } = true;
    public MotionCanvas<SkiaSharpDrawingContext> CoreCanvas => CanvasCore;

    public IChartLegend<SkiaSharpDrawingContext>? Legend
    {
        get => legend;
        set => legend = value;
    }

    public IChartTooltip<SkiaSharpDrawingContext>? Tooltip
    {
        get => tooltip;
        set => tooltip = value;
    }

    public IEnumerable<ChartElement<SkiaSharpDrawingContext>> VisualElements
    {
        get => _visuals;
        set
        {
            _visualsObserver?.Dispose(_visuals);
            _visualsObserver?.Initialize(value);
            _visuals = value;
            OnPropertyChanged();
        }
    }

    public void ShowTooltip(IEnumerable<ChartPoint> points)
    {
        if (tooltip is null || core is null) return;

        tooltip.Show(points, core);
    }

    public void HideTooltip()
    {
        if (tooltip is null || core is null) return;

        core.ClearTooltipData();
        tooltip.Hide();
    }

    public void OnVisualElementPointerDown(IEnumerable<VisualElement<SkiaSharpDrawingContext>> visualElements,
        LvcPoint pointer)
    {
        throw new NotImplementedException();
    }

    public abstract IEnumerable<ChartPoint> GetPointsAt(LvcPoint point,
        TooltipFindingStrategy strategy = TooltipFindingStrategy.Automatic);

    public abstract IEnumerable<VisualElement<SkiaSharpDrawingContext>> GetVisualsAt(LvcPoint point);

    #endregion

    #region ====MotionCanvas====

    private bool _isDrawingLoopRunning = false;
    private List<PaintSchedule<SkiaSharpDrawingContext>> _paintTasksSchedule = new();

    public List<PaintSchedule<SkiaSharpDrawingContext>> PaintTasks
    {
        get => _paintTasksSchedule;
        set
        {
            _paintTasksSchedule = value;
            OnPaintTasksChanged();
        }
    }

    public double MaxFps { get; set; } = 65;

    public MotionCanvas<SkiaSharpDrawingContext> CanvasCore { get; } = new();

    private void CanvasCore_Invalidated(MotionCanvas<SkiaSharpDrawingContext> sender) => RunDrawingLoop();

    private async void RunDrawingLoop()
    {
        if (_isDrawingLoopRunning) return;
        _isDrawingLoopRunning = true;

        var ts = TimeSpan.FromSeconds(1 / MaxFps);
        while (!CanvasCore.IsValid)
        {
            Invalidate(InvalidAction.Repaint);
            await Task.Delay(ts);
        }

        _isDrawingLoopRunning = false;
    }

    private void OnPaintTasksChanged()
    {
        var tasks = new HashSet<IPaint<SkiaSharpDrawingContext>>();

        foreach (var item in _paintTasksSchedule)
        {
            item.PaintTask.SetGeometries(CanvasCore, item.Geometries);
            _ = tasks.Add(item.PaintTask);
        }

        CanvasCore.SetPaintTasks(tasks);
    }

    #endregion

    #region ====Widget Overrides====

    protected override void OnMounted()
    {
        base.OnMounted();
        core?.Load();

        CanvasCore.Invalidated += CanvasCore_Invalidated;
    }

    protected override void OnUnmounted()
    {
        base.OnUnmounted();

        CanvasCore.Invalidated -= CanvasCore_Invalidated;
        CanvasCore.Dispose();

        if (tooltip is IDisposable disposableTooltip)
            disposableTooltip.Dispose();
        core?.Unload();
        OnUnloading();
    }

    public override void Layout(float availableWidth, float availableHeight)
    {
        var width = CacheAndCheckAssignWidth(availableWidth);
        var height = CacheAndCheckAssignHeight(availableHeight);

        SetSize(width, height);
    }

    public override void Paint(Canvas canvas, IDirtyArea? area = null)
    {
        canvas.Save();
        canvas.ClipRect(Rect.FromLTWH(0, 0, W, H), ClipOp.Intersect, false);

        //TODO: fix and cache SkiaSharpDrawingContext instance
        var drawCtx = new SkiaSharpDrawingContext(CanvasCore,
            new ImageInfo { Width = (int)W, Height = (int)H },
            canvas.Surface, canvas);
        drawCtx.Background = BackColor.AsSKColor();
        CanvasCore.DrawFrame(drawCtx);

        canvas.Restore();
    }

    #endregion

    protected abstract void InitializeCore();

    protected virtual void OnUnloading() { }

    protected void OnPropertyChanged()
    {
        if (core is null || ((IChartView)this).DesignerMode) return;
        core.Update();
    }
}