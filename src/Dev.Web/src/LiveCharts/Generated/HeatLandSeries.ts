import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class HeatLandSeries extends LiveChartsCore.HeatLandSeries<LiveCharts.SkiaDrawingContext> {
    public constructor() {
        super();
        throw new System.NotImplementedException();
        // HeatMap = new[]
        // {
        //     LvcColor.FromArgb(255, 179, 229, 252), // cold (min value)
        //     LvcColor.FromArgb(255, 2, 136, 209) // hot (max value)
        // };
        //
        // if (!LiveCharts.IsConfigured) LiveCharts.Configure(config => config.UseDefaults());
        // IntitializeSeries(LiveCharts.DefaultSettings.GetProvider<SkiaSharpDrawingContext>().GetSolidColorPaint());
    }
}
