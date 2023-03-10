import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class DashEffect extends LiveCharts.PathEffect {
    private readonly _dashArray: Float32Array;
    private readonly _phase: number = 0;

    public constructor(dashArray: Float32Array, phase: number = 0) {
        super();
        this._dashArray = dashArray;
        this._phase = phase;
    }

    Clone(): LiveCharts.PathEffect {
        return new DashEffect(this._dashArray, this._phase);
    }

    CreateEffect(drawingContext: LiveCharts.SkiaDrawingContext) {
        this.SKPathEffect = CanvasKit.PathEffect.MakeDash(Array.from(this._dashArray), this._phase);
    }
}
