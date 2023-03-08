import * as LiveChartsCore from '@/LiveChartsCore'

export interface IGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IDrawable<TDrawingContext>, LiveChartsCore.IPaintable<TDrawingContext> {
    get TransformOrigin(): LiveChartsCore.LvcPoint;

    set TransformOrigin(value: LiveChartsCore.LvcPoint);

    get TranslateTransform(): LiveChartsCore.LvcPoint;

    set TranslateTransform(value: LiveChartsCore.LvcPoint);

    get RotateTransform(): number;

    set RotateTransform(value: number);

    get ScaleTransform(): LiveChartsCore.LvcPoint;

    set ScaleTransform(value: LiveChartsCore.LvcPoint);

    get SkewTransform(): LiveChartsCore.LvcPoint;

    set SkewTransform(value: LiveChartsCore.LvcPoint);

    get X(): number;

    set X(value: number);

    get Y(): number;

    set Y(value: number);

    Measure(drawableTask: LiveChartsCore.IPaint<TDrawingContext>): LiveChartsCore.LvcSize;
}
