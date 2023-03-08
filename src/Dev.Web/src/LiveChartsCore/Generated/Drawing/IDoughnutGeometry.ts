import * as LiveChartsCore from '@/LiveChartsCore'

export interface IDoughnutGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IGeometry<TDrawingContext> {
    get CenterX(): number;

    set CenterX(value: number);

    get CenterY(): number;

    set CenterY(value: number);

    get Width(): number;

    set Width(value: number);

    get Height(): number;

    set Height(value: number);

    get StartAngle(): number;

    set StartAngle(value: number);

    get SweepAngle(): number;

    set SweepAngle(value: number);

    get PushOut(): number;

    set PushOut(value: number);

    get InnerRadius(): number;

    set InnerRadius(value: number);

    get CornerRadius(): number;

    set CornerRadius(value: number);

    get InvertedCornerRadius(): boolean;

    set InvertedCornerRadius(value: boolean);
}
