import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class RelativePanel<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.VisualElement<TDrawingContext> {
    private _targetPosition: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();

    public Size: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();

    public get Children(): System.HashSet<LiveChartsCore.VisualElement<TDrawingContext>> {
        return new System.HashSet();
    }

    GetTargetLocation(): LiveChartsCore.LvcPoint {
        return this._targetPosition;
    }

    GetTargetSize(): LiveChartsCore.LvcSize {
        return this.Size;
    }

    Measure(chart: LiveChartsCore.Chart<TDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>): LiveChartsCore.LvcSize {
        for (const child of this.Children) child.Measure(chart, primaryScaler, secondaryScaler);
        return this.GetTargetSize();
    }

    RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        for (const child of this.Children) {
            child.RemoveFromUI(chart);
        }

        super.RemoveFromUI(chart);
    }

    OnInvalidated(chart: LiveChartsCore.Chart<TDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>) {
        this._targetPosition = (new LiveChartsCore.LvcPoint(<number><unknown>this.X + this._xc, <number><unknown>this.Y + this._yc)).Clone();

        for (const child of this.Children) {
            child._parent = this._parent;
            child._xc = this._xc;
            child._yc = this._yc;
            child._x = this.X;
            child._y = this.Y;
            child.OnInvalidated(chart, primaryScaler, secondaryScaler);
        }
    }

    GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [];
    }
}
