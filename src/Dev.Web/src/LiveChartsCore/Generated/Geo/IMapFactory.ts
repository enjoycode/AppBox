import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IMapFactory<TDrawingContext extends LiveChartsCore.DrawingContext> extends System.IDisposable {
    GenerateLands(context: LiveChartsCore.MapContext<TDrawingContext>): void;

    ViewTo(sender: LiveChartsCore.GeoMap<TDrawingContext>, command: any): void;

    Pan(sender: LiveChartsCore.GeoMap<TDrawingContext>, delta: LiveChartsCore.LvcPoint): void;
}
