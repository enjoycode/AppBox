import * as LiveChartsCore from '@/LiveChartsCore'

export interface ILabelGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IGeometry<TDrawingContext> {
    get Padding(): LiveChartsCore.Padding;

    set Padding(value: LiveChartsCore.Padding);

    get LineHeight(): number;

    set LineHeight(value: number);

    get VerticalAlign(): LiveChartsCore.Align;

    set VerticalAlign(value: LiveChartsCore.Align);

    get HorizontalAlign(): LiveChartsCore.Align;

    set HorizontalAlign(value: LiveChartsCore.Align);

    get Text(): string;

    set Text(value: string);

    get TextSize(): number;

    set TextSize(value: number);

    get Background(): LiveChartsCore.LvcColor;

    set Background(value: LiveChartsCore.LvcColor);
}

export function IsInterfaceOfILabelGeometry(obj: any): obj is ILabelGeometry<any> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_ILabelGeometry' in obj.constructor;
}
