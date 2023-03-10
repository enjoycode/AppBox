import * as PixUI from '@/PixUI'

export class CurveTween extends PixUI.Animatable<number> {
    private readonly _curve: PixUI.Curve;

    public constructor(curve: PixUI.Curve) {
        super();
        this._curve = curve;
    }

    Transform(t: number): number {
        if (t == 0.0 || t == 1.0) {
            console.assert(Math.round(this._curve.Transform(t)) == t);
            return t;
        }

        return this._curve.Transform(t);
    }
}
