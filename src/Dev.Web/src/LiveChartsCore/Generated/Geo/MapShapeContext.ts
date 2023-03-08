import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class MapShapeContext<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public constructor(
        chart: LiveChartsCore.IGeoMapView<TDrawingContext>,
        heatPaint: LiveChartsCore.IPaint<TDrawingContext>,
        heatStops: System.List<LiveChartsCore.ColorStop>,
        bounds: LiveChartsCore.Bounds) {
        this.Chart = chart;
        this.HeatPaint = heatPaint;
        this.HeatStops = heatStops;
        this.Bounds = bounds;
    }

    #Chart: LiveChartsCore.IGeoMapView<TDrawingContext>;
    public get Chart() {
        return this.#Chart;
    }

    private set Chart(value) {
        this.#Chart = value;
    }

    #HeatPaint: LiveChartsCore.IPaint<TDrawingContext>;
    public get HeatPaint() {
        return this.#HeatPaint;
    }

    private set HeatPaint(value) {
        this.#HeatPaint = value;
    }

    #HeatStops: System.List<LiveChartsCore.ColorStop>;
    public get HeatStops() {
        return this.#HeatStops;
    }

    private set HeatStops(value) {
        this.#HeatStops = value;
    }

    #Bounds: LiveChartsCore.Bounds;
    public get Bounds() {
        return this.#Bounds;
    }

    private set Bounds(value) {
        this.#Bounds = value;
    }
}
