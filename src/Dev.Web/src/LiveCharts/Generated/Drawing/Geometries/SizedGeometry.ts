import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export abstract class SizedGeometry extends LiveCharts.Geometry implements LiveChartsCore.ISizedVisualChartPoint<LiveCharts.SkiaDrawingContext> {
    protected widthProperty: LiveChartsCore.FloatMotionProperty;

    protected heightProperty: LiveChartsCore.FloatMotionProperty;

    protected matchDimensions: boolean = false;

    protected constructor() {
        super();
        this.widthProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Width", 0));
        this.heightProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Height", 0));
    }

    public get Width(): number {
        return this.widthProperty.GetMovement(this);
    }

    public set Width(value: number) {
        this.widthProperty.SetMovement(value, this);
    }

    public get Height(): number {
        return this.matchDimensions ? this.widthProperty.GetMovement(this) : this.heightProperty.GetMovement(this);
    }

    public set Height(value: number) {
        if (this.matchDimensions) {
            this.widthProperty.SetMovement(value, this);
            return;
        }
        this.heightProperty.SetMovement(value, this);
    }

    OnMeasure(paint: LiveCharts.Paint): LiveChartsCore.LvcSize {
        return new LiveChartsCore.LvcSize(this.Width, this.Height);
    }
}
