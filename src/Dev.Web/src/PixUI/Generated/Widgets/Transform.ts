import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Transform extends PixUI.SingleChildWidget {
    private _transform: PixUI.Matrix4 = PixUI.Matrix4.Empty.Clone();
    private _origin: Nullable<PixUI.Offset>;

    public constructor(transform: PixUI.Matrix4, origin: Nullable<PixUI.Offset> = null) {
        super();
        this.SetTransform((transform).Clone());
        this.Origin = origin;
    }

    public get Origin(): Nullable<PixUI.Offset> {
        return this._origin;
    }

    public set Origin(value: Nullable<PixUI.Offset>) {
        if (System.OpEquality(this._origin, value)) return;
        this._origin = value;
        this.NeedInvalidate();
    }

    protected InitTransformAndOrigin(value: PixUI.Matrix4, origin: Nullable<PixUI.Offset> = null) {
        this._transform = (value).Clone();
        this._origin = origin;
    }

    protected SetTransform(value: PixUI.Matrix4) {
        if (System.OpEquality(this._transform, value)) return;

        this._transform = (value).Clone();
        this.NeedInvalidate();
    }

    private NeedInvalidate() {
        if (this.IsMounted)
            this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public get EffectiveTransform(): PixUI.Matrix4 {
        if (this._origin == null)
            return this._transform;
        let result = PixUI.Matrix4.CreateIdentity();
        if (this._origin != null)
            result.Translate(this._origin.Dx, this._origin.Dy);

        result.Multiply(this._transform);

        if (this._origin != null)
            result.Translate(-this._origin.Dx, -this._origin.Dy);

        return result;
    }

    HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        //不要检查ContainsPoint,可能变换出范围
        if (this.Child == null) return false;

        let effectiveTransform = (this.EffectiveTransform).Clone();

        // The provided paint `transform` (which describes the transform from the
        // child to the parent in 3D) is processed by
        // [PointerEvent.removePerspectiveTransform] to remove the
        // perspective component and inverted before it is used to transform
        // `position` from the coordinate system of the parent to the system of the child.
        let transform = PixUI.Matrix4.TryInvert(PixUI.PointerEvent.RemovePerspectiveTransform((effectiveTransform).Clone()));
        if (transform == null) {
            return false; // Objects are not visible on screen and cannot be hit-tested.
        }

        let transformed = PixUI.MatrixUtils.TransformPoint(transform, x, y);
        //不要加入 result.Add(this, effectiveTransform);
        let hitChild = this.Child.HitTest(transformed.Dx, transformed.Dy, result);
        if (hitChild) {
            //TODO: 忽略transform.Value is Identity
            result.ConcatLastTransform(transform);
        }

        return hitChild;
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.Child == null) return;

        canvas.save();
        canvas.concat(this.EffectiveTransform.TransponseTo()); //canvas.Transform(EffectiveTransform);

        this.PaintChildren(canvas, area);

        canvas.restore();
    }
}
