import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface ICartesianAxis extends LiveChartsCore.IPlane, System.INotifyPropertyChanged {
    get Orientation(): LiveChartsCore.AxisOrientation;


    get Padding(): LiveChartsCore.Padding;

    set Padding(value: LiveChartsCore.Padding);

    get Xo(): number;

    set Xo(value: number);

    get Yo(): number;

    set Yo(value: number);

    get Size(): LiveChartsCore.LvcSize;

    set Size(value: LiveChartsCore.LvcSize);

    get MinZoomDelta(): Nullable<number>;

    set MinZoomDelta(value: Nullable<number>);

    get TicksAtCenter(): boolean;

    set TicksAtCenter(value: boolean);

    get SeparatorsAtCenter(): boolean;

    set SeparatorsAtCenter(value: boolean);

    get LabelsDesiredSize(): LiveChartsCore.LvcRectangle;

    set LabelsDesiredSize(value: LiveChartsCore.LvcRectangle);

    get NameDesiredSize(): LiveChartsCore.LvcRectangle;

    set NameDesiredSize(value: LiveChartsCore.LvcRectangle);

    get InLineNamePlacement(): boolean;

    set InLineNamePlacement(value: boolean);

    get LabelsAlignment(): Nullable<LiveChartsCore.Align>;

    set LabelsAlignment(value: Nullable<LiveChartsCore.Align>);

    get Position(): LiveChartsCore.AxisPosition;

    set Position(value: LiveChartsCore.AxisPosition);

    Initialize(orientation: LiveChartsCore.AxisOrientation): void;

}

export function IsInterfaceOfICartesianAxis(obj: any): obj is ICartesianAxis {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_ICartesianAxis' in obj.constructor;
}

export interface ICartesianAxis1<TDrawingContext extends LiveChartsCore.DrawingContext> extends ICartesianAxis {
    get SubseparatorsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set SubseparatorsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get DrawTicksPath(): boolean;

    set DrawTicksPath(value: boolean);

    get TicksPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set TicksPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get SubticksPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set SubticksPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get ZeroPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set ZeroPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get CrosshairPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set CrosshairPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get CrosshairLabelsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set CrosshairLabelsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get CrosshairLabelsBackground(): Nullable<LiveChartsCore.LvcColor>;

    set CrosshairLabelsBackground(value: Nullable<LiveChartsCore.LvcColor>);

    get CrosshairPadding(): Nullable<LiveChartsCore.Padding>;

    set CrosshairPadding(value: Nullable<LiveChartsCore.Padding>);

    get CrosshairSnapEnabled(): boolean;

    set CrosshairSnapEnabled(value: boolean);

    InvalidateCrosshair(chart: LiveChartsCore.Chart<TDrawingContext>, pointerPosition: LiveChartsCore.LvcPoint): void;
}

export function IsInterfaceOfICartesianAxis1(obj: any): obj is ICartesianAxis1<any> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_ICartesianAxis1' in obj.constructor;
}
