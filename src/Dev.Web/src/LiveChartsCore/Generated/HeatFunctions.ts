import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class HeatFunctions {
    public static BuildColorStops(heatMap: LiveChartsCore.LvcColor[], colorStops: Nullable<Float64Array>): System.List<LiveChartsCore.ColorStop> {
        if (heatMap.length < 2) throw new System.Exception("At least 2 colors are required in a heat map.");

        if (colorStops == null) {
            let s = 1 / <number><unknown>(heatMap.length - 1);
            colorStops = new Float64Array(heatMap.length);
            let x = 0;
            for (let i = 0; i < heatMap.length; i++) {
                colorStops[i] = x;
                x += s;
            }
        }

        if (colorStops.length != heatMap.length)
            throw new System.Exception(`ColorStops and HeatMap must have the same length.`);

        let heatStops = new System.List<LiveChartsCore.ColorStop>();
        for (let i = 0; i < colorStops.length; i++) {
            heatStops.Add(new LiveChartsCore.ColorStop(colorStops[i], (heatMap[i]).Clone()));
        }

        return heatStops;
    }

    public static InterpolateColor(weight: number, weightBounds: LiveChartsCore.Bounds, heatMap: LiveChartsCore.LvcColor[], heatStops: System.List<LiveChartsCore.ColorStop>): LiveChartsCore.LvcColor {
        let range = weightBounds.Max - weightBounds.Min;
        if (range == 0) range = Number.EPSILON;
        let p = (weight - weightBounds.Min) / range;
        if (p < 0) p = 0;
        if (p > 1) p = 1;

        let previous = heatStops[0];

        for (let i = 1; i < heatStops.length; i++) {
            let next = heatStops[i];

            if (next.Value < p) {
                previous = heatStops[i];
                continue;
            }

            let px = (p - previous.Value) / (next.Value - previous.Value);

            return LiveChartsCore.LvcColor.FromArgb(
                (Math.floor((previous.Color.A + px * (next.Color.A - previous.Color.A))) & 0xFF),
                (Math.floor((previous.Color.R + px * (next.Color.R - previous.Color.R))) & 0xFF),
                (Math.floor((previous.Color.G + px * (next.Color.G - previous.Color.G))) & 0xFF),
                (Math.floor((previous.Color.B + px * (next.Color.B - previous.Color.B))) & 0xFF));
        }

        return heatMap[heatMap.length - 1];
    }
}
