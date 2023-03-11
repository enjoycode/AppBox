import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class LiveChartsSkiaSharp {

    public static DefaultSKTypeface: Nullable<PixUI.Typeface>;

    public static get DefaultPlatformBuilder(): System.Action1<LiveChartsCore.LiveChartsSettings> {
        return (settings: LiveChartsCore.LiveChartsSettings) => LiveCharts.ThemesExtensions.AddLightTheme(LiveCharts.LiveChartsSkiaSharp.AddSkiaSharp(settings
            )
        );
    }

    public static UseDefaults(settings: LiveChartsCore.LiveChartsSettings): LiveChartsCore.LiveChartsSettings {
        return LiveCharts.ThemesExtensions.AddLightTheme(LiveCharts.LiveChartsSkiaSharp.AddSkiaSharp(settings
            )
        );
    }

    public static AddSkiaSharp(settings: LiveChartsCore.LiveChartsSettings): LiveChartsCore.LiveChartsSettings {
        // this is obsolete, currently only used in the GeoMap control and will be removed a future version.
        //LiveChartsCore.LiveCharts.DefaultPaint = DefaultPaint;

        return settings.HasProvider(new LiveCharts.SkiaSharpProvider());
    }

    public static WithGlobalSKTypeface(settings: LiveChartsCore.LiveChartsSettings, typeface: PixUI.Typeface): LiveChartsCore.LiveChartsSettings {
        if (!LiveChartsCore.LiveCharts.IsConfigured) LiveChartsCore.LiveCharts.Configure(LiveChartsSkiaSharp.DefaultPlatformBuilder);
        LiveChartsSkiaSharp.DefaultSKTypeface = typeface;
        return settings;
    }

    public static AsSKColor(color: LiveChartsCore.LvcColor, alphaOverrides: Nullable<number> = null): PixUI.Color {
        return new PixUI.Color(color.R, color.G, color.B, alphaOverrides ?? color.A);
    }

    public static WithOpacity(color: LiveChartsCore.LvcColor, opacity: number): LiveChartsCore.LvcColor {
        return LiveChartsCore.LvcColor.FromColorWithAlpha(opacity, (color).Clone());
    }

    public static AsLvcColor(color: PixUI.Color): LiveChartsCore.LvcColor {
        return new LiveChartsCore.LvcColor(color.Red, color.Green, color.Blue, color.Alpha);
    }


    public static AsLiveChartsPieSeries<T>(source: System.IEnumerable<T>,
                                           buider: Nullable<System.Action2<T, LiveCharts.PieSeries<T>>> = null): System.ObservableCollection<LiveCharts.PieSeries<T>> {
        buider ??= (instance, series) => {
        };

        return new System.ObservableCollection<LiveCharts.PieSeries<T>>(source.Select(instance => {
            let series = new LiveCharts.PieSeries<T>().Init({Values: new System.ObservableCollection<T>().Init([instance])});
            buider(instance, series);
            return series;
        })
            .ToArray());
    }

    public static GetDistanceTo<TDrawingContext extends LiveChartsCore.DrawingContext>(target: LiveChartsCore.ChartPoint, location: LiveChartsCore.LvcPoint): number {
        let dataCoordinates: LiveChartsCore.LvcPointD = LiveChartsCore.LvcPointD.Empty.Clone();
        let x: number = 0;
        let y: number = 0;

        if (LiveChartsCore.IsInterfaceOfICartesianChartView(target.Context)) {
            const cartesianChart = target.Context;
            dataCoordinates = cartesianChart.ScalePixelsToData(new LiveChartsCore.LvcPointD(location.X, location.Y));

            let cartesianSeries = <LiveChartsCore.ICartesianSeries<LiveCharts.SkiaDrawingContext>><unknown>target.Context.Series;

            if ((target.Context.Series.SeriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) {
                let primaryAxis = cartesianChart.Core.YAxes[cartesianSeries.ScalesYAt];
                let secondaryAxis = cartesianChart.Core.XAxes[cartesianSeries.ScalesXAt];

                let drawLocation = (cartesianChart.Core.DrawMarginLocation).Clone();
                let drawMarginSize = (cartesianChart.Core.DrawMarginSize).Clone();
                let secondaryScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), primaryAxis);
                let primaryScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), secondaryAxis);

                x = secondaryScale.ToPixels(target.SecondaryValue);
                y = primaryScale.ToPixels(target.PrimaryValue);
            } else {
                let primaryAxis = cartesianChart.Core.YAxes[cartesianSeries.ScalesXAt];
                let secondaryAxis = cartesianChart.Core.XAxes[cartesianSeries.ScalesYAt];

                let drawLocation = (cartesianChart.Core.DrawMarginLocation).Clone();
                let drawMarginSize = (cartesianChart.Core.DrawMarginSize).Clone();

                let secondaryScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), secondaryAxis);
                let primaryScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), primaryAxis);

                x = secondaryScale.ToPixels(target.SecondaryValue);
                y = primaryScale.ToPixels(target.PrimaryValue);
            }
        } else if (LiveChartsCore.IsInterfaceOfIPolarChartView(target.Context)) {
            const polarChart = target.Context;
            dataCoordinates = polarChart.ScalePixelsToData(new LiveChartsCore.LvcPointD(location.X, location.Y));

            let polarSeries = <LiveChartsCore.IPolarSeries<LiveCharts.SkiaDrawingContext>><unknown>target.Context.Series;

            let angleAxis = polarChart.Core.AngleAxes[polarSeries.ScalesAngleAt];
            let radiusAxis = polarChart.Core.RadiusAxes[polarSeries.ScalesRadiusAt];

            let drawLocation = (polarChart.Core.DrawMarginLocation).Clone();
            let drawMarginSize = (polarChart.Core.DrawMarginSize).Clone();

            let scaler = new LiveChartsCore.PolarScaler((drawLocation).Clone(), (drawMarginSize).Clone(), angleAxis, radiusAxis,
                polarChart.Core.InnerRadius, polarChart.Core.InitialRotation, polarChart.Core.TotalAnge);

            let scaled = scaler.ToPixelsFromCharPoint(target);
            x = scaled.X;
            y = scaled.Y;
        } else {
            throw new System.NotImplementedException();
        }

        // calculate the distance
        let dx = dataCoordinates.X - x;
        let dy = dataCoordinates.Y - y;

        let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        return distance;
    }
}