import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SkiaSharpProvider extends LiveChartsCore.ChartEngine<LiveCharts.SkiaDrawingContext> {
    GetDefaultMapFactory(): LiveChartsCore.IMapFactory<LiveCharts.SkiaDrawingContext> {
        return new LiveCharts.MapFactory();
    }

    GetDefaultCartesianAxis(): LiveChartsCore.ICartesianAxis {
        return new LiveCharts.Axis();
    }

    GetDefaultPolarAxis(): LiveChartsCore.IPolarAxis {
        return new LiveCharts.PolarAxis();
    }

    GetSolidColorPaint(color: LiveChartsCore.LvcColor): LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext> {
        return new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(color.R, color.G, color.B, color.A)});
    }
}