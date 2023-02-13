using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using LiveChartsCore;
using LiveChartsCore.Drawing;
using LiveChartsCore.Kernel;
using LiveChartsCore.Kernel.Sketches;
using LiveChartsCore.Measure;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Drawing;
using LiveChartsCore.VisualElements;

namespace PixLiveCharts;

public sealed class PieChart : ChartView, IPieChartView<SkiaSharpDrawingContext>
{
    public PieChart(IChartTooltip<SkiaSharpDrawingContext>? tooltip = null,
        IChartLegend<SkiaSharpDrawingContext>? legend = null) : base(tooltip, legend)
    {
        _seriesObserver = new CollectionDeepObserver<ISeries>(
            (s, e) => OnPropertyChanged(),
            (s, e) => OnPropertyChanged(),
            true);

        Series = new ObservableCollection<ISeries>();
        VisualElements = new ObservableCollection<ChartElement<SkiaSharpDrawingContext>>();

        // var c = Controls[0].Controls[0];
        // c.MouseDown += OnMouseDown;
    }

    #region ====Fields====

    private readonly CollectionDeepObserver<ISeries> _seriesObserver;
    private IEnumerable<ISeries> _series = new List<ISeries>();
    private bool _isClockwise = true;
    private double _initialRotation;
    private double _maxAngle = 360;
    private double? _total;

    #endregion

    #region ====ChartView Overrides====

    protected override void InitializeCore()
    {
        core = new PieChart<SkiaSharpDrawingContext>(
            this, config => config.UseDefaults(), CanvasCore, true);
        if (DesignerMode) return;
        core.Update();
    }

    public override IEnumerable<ChartPoint> GetPointsAt(LvcPoint point,
        TooltipFindingStrategy strategy = TooltipFindingStrategy.Automatic)
    {
        if (core is not PieChart<SkiaSharpDrawingContext> cc) throw new Exception("core not found");

        if (strategy == TooltipFindingStrategy.Automatic)
            strategy = cc.Series.GetTooltipFindingStrategy();

        return cc.Series.SelectMany(series => series.FindHitPoints(cc, point, strategy));
    }

    public override IEnumerable<VisualElement<SkiaSharpDrawingContext>> GetVisualsAt(LvcPoint point)
    {
        return core is not PieChart<SkiaSharpDrawingContext> cc
            ? throw new Exception("core not found")
            : cc.VisualElements.SelectMany(visual =>
                ((VisualElement<SkiaSharpDrawingContext>)visual).IsHitBy(core, point));
    }

    #endregion

    #region ====IPieChartView====

    public PieChart<SkiaSharpDrawingContext> Core => (PieChart<SkiaSharpDrawingContext>)core!;

    public IEnumerable<ISeries> Series
    {
        get => _series;
        set
        {
            _seriesObserver?.Dispose(_series);
            _seriesObserver?.Initialize(value);
            _series = value;
            OnPropertyChanged();
        }
    }

    public double InitialRotation
    {
        get => _initialRotation;
        set
        {
            _initialRotation = value;
            OnPropertyChanged();
        }
    }

    public double MaxAngle
    {
        get => _maxAngle;
        set
        {
            _maxAngle = value;
            OnPropertyChanged();
        }
    }

    public double? Total
    {
        get => _total;
        set
        {
            _total = value;
            OnPropertyChanged();
        }
    }

    public bool IsClockwise
    {
        get => _isClockwise;
        set
        {
            _isClockwise = value;
            OnPropertyChanged();
        }
    }

    #endregion
}