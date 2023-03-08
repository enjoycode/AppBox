import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPolarChartView<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartView1<TDrawingContext> {
    get Core(): LiveChartsCore.PolarChart<TDrawingContext>;


    get FitToBounds(): boolean;

    set FitToBounds(value: boolean);

    get TotalAngle(): number;

    set TotalAngle(value: number);

    get InnerRadius(): number;

    set InnerRadius(value: number);

    get InitialRotation(): number;

    set InitialRotation(value: number);

    get AngleAxes(): System.IEnumerable<LiveChartsCore.IPolarAxis>;

    set AngleAxes(value: System.IEnumerable<LiveChartsCore.IPolarAxis>);

    get RadiusAxes(): System.IEnumerable<LiveChartsCore.IPolarAxis>;

    set RadiusAxes(value: System.IEnumerable<LiveChartsCore.IPolarAxis>);

    get Series(): System.IEnumerable<LiveChartsCore.ISeries>;

    set Series(value: System.IEnumerable<LiveChartsCore.ISeries>);

    ScalePixelsToData(point: LiveChartsCore.LvcPointD, angleAxisIndex?: number, radiusAxisIndex?: number): LiveChartsCore.LvcPointD;

    ScaleDataToPixels(point: LiveChartsCore.LvcPointD, angleAxisIndex?: number, radiusAxisIndex?: number): LiveChartsCore.LvcPointD;
}

export function IsInterfaceOfIPolarChartView(obj: any): obj is IPolarChartView<any> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_IPolarChartView' in obj.constructor;
}
