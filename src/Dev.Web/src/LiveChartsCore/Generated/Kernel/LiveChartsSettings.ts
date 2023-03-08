import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class LiveChartsSettings {
    private _currentProvider: any;
    private _theme: any = {};

    #CurrentThemeId: any = {};
    public get CurrentThemeId() {
        return this.#CurrentThemeId;
    }

    private set CurrentThemeId(value) {
        this.#CurrentThemeId = value;
    }

    public EasingFunction: System.Func2<number, number> = LiveChartsCore.EasingFunctions.ExponentialOut;

    public AnimationsSpeed: System.TimeSpan = System.TimeSpan.FromMilliseconds(800);

    public ZoomSpeed: number = 0.2;

    public ZoomMode: LiveChartsCore.ZoomAndPanMode = LiveChartsCore.ZoomAndPanMode.None;

    public LegendPosition: LiveChartsCore.LegendPosition = LiveChartsCore.LegendPosition.Hidden;

    public LegendBackgroundPaint: any;

    public LegendTextPaint: any;

    public LegendTextSize: Nullable<number>;

    public TooltipPosition: LiveChartsCore.TooltipPosition = LiveChartsCore.TooltipPosition.Top;

    public TooltipBackgroundPaint: any;

    public TooltipTextPaint: any;

    public TooltipTextSize: Nullable<number>;

    public TooltipFindingStrategy: LiveChartsCore.TooltipFindingStrategy = LiveChartsCore.TooltipFindingStrategy.Automatic;

    public PolarInitialRotation: number = -90;

    public UpdateThrottlingTimeout: System.TimeSpan = System.TimeSpan.FromMilliseconds(50);


    public HasProvider<TDrawingContext extends LiveChartsCore.DrawingContext>(factory: LiveChartsCore.ChartEngine<TDrawingContext>): LiveChartsSettings {
        this._currentProvider = factory;
        return this;
    }

    public GetProvider<TDrawingContext extends LiveChartsCore.DrawingContext>(): LiveChartsCore.ChartEngine<TDrawingContext> {
        if (this._currentProvider == null)
            throw new System.NotImplementedException(`There is no a ${"ChartEngine<TDrawingContext>"} registered.`);

        return <LiveChartsCore.ChartEngine<TDrawingContext>><unknown>this._currentProvider;
    }

    public WithAnimationsSpeed(animationsSpeed: System.TimeSpan): LiveChartsSettings {
        this.AnimationsSpeed = animationsSpeed;
        return this;
    }

    public WithEasingFunction(easingFunction: System.Func2<number, number>): LiveChartsSettings {
        this.EasingFunction = easingFunction;
        return this;
    }

    public WithZoomSpeed(speed: number): LiveChartsSettings {
        this.ZoomSpeed = speed;
        return this;
    }

    public WithZoomMode(zoomMode: LiveChartsCore.ZoomAndPanMode): LiveChartsSettings {
        this.ZoomMode = zoomMode;
        return this;
    }

    public WithUpdateThrottlingTimeout(timeout: System.TimeSpan): LiveChartsSettings {
        this.UpdateThrottlingTimeout = timeout;
        return this;
    }

    public WithLegendBackgroundPaint<TDrawingContext extends LiveChartsCore.DrawingContext>(paint: LiveChartsCore.IPaint<TDrawingContext>): LiveChartsSettings {
        this.LegendBackgroundPaint = paint;
        return this;
    }

    public WithLegendTextPaint<TDrawingContext extends LiveChartsCore.DrawingContext>(paint: LiveChartsCore.IPaint<TDrawingContext>): LiveChartsSettings {
        this.LegendTextPaint = paint;
        return this;
    }

    public WithLegendTextSize<TDrawingContext>(size: Nullable<number>): LiveChartsSettings {
        this.LegendTextSize = size;
        return this;
    }

    public WithTooltipBackgroundPaint<TDrawingContext extends LiveChartsCore.DrawingContext>(paint: LiveChartsCore.IPaint<TDrawingContext>): LiveChartsSettings {
        this.TooltipBackgroundPaint = paint;
        return this;
    }

    public WithTooltipTextPaint<TDrawingContext extends LiveChartsCore.DrawingContext>(paint: LiveChartsCore.IPaint<TDrawingContext>): LiveChartsSettings {
        this.TooltipTextPaint = paint;
        return this;
    }

    public WithTooltipTextSize<TDrawingContext>(size: Nullable<number>): LiveChartsSettings {
        this.TooltipTextSize = size;
        return this;
    }


    public HasTheme<TDrawingContext extends LiveChartsCore.DrawingContext>(builder: System.Action1<LiveChartsCore.Theme<TDrawingContext>>): LiveChartsSettings {
        this.CurrentThemeId = {};
        let t: LiveChartsCore.Theme<TDrawingContext>;
        this._theme = t = new LiveChartsCore.Theme<TDrawingContext>();
        builder(t);

        return this;
    }

    public GetTheme<TDrawingContext extends LiveChartsCore.DrawingContext>(): LiveChartsCore.Theme<TDrawingContext> {
        if (this._theme == null)
            throw new System.Exception("A theme is required.");
        return <LiveChartsCore.Theme<TDrawingContext>><unknown>this._theme;
    }

}
