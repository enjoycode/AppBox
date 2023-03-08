import * as LiveChartsCore from '@/LiveChartsCore'

export interface ISolidColorGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ISizedGeometry<TDrawingContext> {
    get Color(): LiveChartsCore.LvcColor;

    set Color(value: LiveChartsCore.LvcColor);
}
