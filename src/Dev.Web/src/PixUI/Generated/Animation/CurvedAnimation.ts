import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class CurvedAnimation extends PixUI.AnimationWithParent<number> {
    private readonly _curve: PixUI.Curve;

    private readonly _reverseCurve: Nullable<PixUI.Curve>;

    private _curveDirection: Nullable<PixUI.AnimationStatus>;

    private get UseForwardCurve(): boolean {
        return this._reverseCurve == null ||
            (this._curveDirection ?? this.Parent.Status) != PixUI.AnimationStatus.Reverse;
    }

    public constructor(parent: PixUI.Animation<number>, curve: PixUI.Curve, reverseCurve: Nullable<PixUI.Curve> = null) {
        super(parent);
        this._curve = curve;
        this._reverseCurve = reverseCurve;

        this.UpdateCurveDirection(parent.Status);
        parent.StatusChanged.Add(this.UpdateCurveDirection, this);
    }

    private UpdateCurveDirection(status: PixUI.AnimationStatus) {
        switch (status) {
            case PixUI.AnimationStatus.Dismissed:
            case PixUI.AnimationStatus.Completed:
                this._curveDirection = null;
                break;
            case PixUI.AnimationStatus.Forward:
                this._curveDirection ??= PixUI.AnimationStatus.Forward;
                break;
            case PixUI.AnimationStatus.Reverse:
                this._curveDirection ??= PixUI.AnimationStatus.Reverse;
                break;
        }
    }

    public get Value(): number {
        let activeCurve = this.UseForwardCurve ? this._curve : this._reverseCurve;
        let t = this.Parent.Value;
        if (activeCurve == null) return t;

        if (t == 0.0 || t == 1.0) {
            let transformedValue = activeCurve.Transform(t);
            let roundedTransformedValue = Math.round(transformedValue);
            if (roundedTransformedValue != t)
                throw new System.Exception(`Invalid curve endpoint at ${t}`);
            return t;
        }

        return activeCurve.Transform(t);
    }
}
