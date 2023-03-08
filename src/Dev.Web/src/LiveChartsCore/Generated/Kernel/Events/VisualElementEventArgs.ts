import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class VisualElementsEventArgs<TDrawingContext extends LiveChartsCore.DrawingContext> {
    private _closer: Nullable<LiveChartsCore.VisualElement<TDrawingContext>>;

    public constructor(visualElements: System.IEnumerable<LiveChartsCore.VisualElement<TDrawingContext>>, pointerLocation: LiveChartsCore.LvcPoint) {
        this.PointerLocation = (pointerLocation).Clone();
        this.VisualElements = visualElements;
    }

    #PointerLocation: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
    public get PointerLocation() {
        return this.#PointerLocation;
    }

    private set PointerLocation(value) {
        this.#PointerLocation = value;
    }

    public get ClosestToPointerVisualElement(): Nullable<LiveChartsCore.VisualElement<TDrawingContext>> {
        return this._closer ??= this.FindClosest();
    }

    #VisualElements: System.IEnumerable<LiveChartsCore.VisualElement<TDrawingContext>>;
    public get VisualElements() {
        return this.#VisualElements;
    }

    private set VisualElements(value) {
        this.#VisualElements = value;
    }

    private FindClosest(): Nullable<LiveChartsCore.VisualElement<TDrawingContext>> {
        return LiveChartsCore.Extensions.FindClosestTo2(this.VisualElements, (this.PointerLocation).Clone());
    }
}
