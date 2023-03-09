import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface ICartesianChartView<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartView1<TDrawingContext> {
    get Core(): LiveChartsCore.CartesianChart<TDrawingContext>;


    get XAxes(): System.IEnumerable<LiveChartsCore.ICartesianAxis>;

    set XAxes(value: System.IEnumerable<LiveChartsCore.ICartesianAxis>);

    get YAxes(): System.IEnumerable<LiveChartsCore.ICartesianAxis>;

    set YAxes(value: System.IEnumerable<LiveChartsCore.ICartesianAxis>);

    get Sections(): System.IEnumerable<LiveChartsCore.Section<TDrawingContext>>;

    set Sections(value: System.IEnumerable<LiveChartsCore.Section<TDrawingContext>>);

    get Series(): System.IEnumerable<LiveChartsCore.ISeries>;

    set Series(value: System.IEnumerable<LiveChartsCore.ISeries>);

    get DrawMarginFrame(): Nullable<LiveChartsCore.DrawMarginFrame<TDrawingContext>>;

    set DrawMarginFrame(value: Nullable<LiveChartsCore.DrawMarginFrame<TDrawingContext>>);

    get ZoomMode(): LiveChartsCore.ZoomAndPanMode;

    set ZoomMode(value: LiveChartsCore.ZoomAndPanMode);

    get TooltipFindingStrategy(): LiveChartsCore.TooltipFindingStrategy;

    set TooltipFindingStrategy(value: LiveChartsCore.TooltipFindingStrategy);

    get ZoomingSpeed(): number;

    set ZoomingSpeed(value: number);

    ScalePixelsToData(point: LiveChartsCore.LvcPointD, xAxisIndex?: number, yAxisIndex?: number): LiveChartsCore.LvcPointD;

    ScaleDataToPixels(point: LiveChartsCore.LvcPointD, xAxisIndex?: number, yAxisIndex?: number): LiveChartsCore.LvcPointD;
}

export function IsInterfaceOfICartesianChartView(obj: any): obj is ICartesianChartView<any> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_ICartesianChartView' in obj.constructor;
}
