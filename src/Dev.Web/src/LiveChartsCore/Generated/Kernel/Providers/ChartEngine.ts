import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class ChartEngine<TDrawingContext extends LiveChartsCore.DrawingContext> {
    public GetDefaultDataFactory<TModel>(): LiveChartsCore.DataFactory<TModel, TDrawingContext> {
        return new LiveChartsCore.DataFactory<TModel, TDrawingContext>();
    }

    public abstract GetDefaultMapFactory(): LiveChartsCore.IMapFactory<TDrawingContext> ;

    public abstract GetDefaultCartesianAxis(): LiveChartsCore.ICartesianAxis ;

    public abstract GetDefaultPolarAxis(): LiveChartsCore.IPolarAxis ;

    public abstract GetSolidColorPaint(color?: LiveChartsCore.LvcColor): LiveChartsCore.IPaint<TDrawingContext> ;
}
