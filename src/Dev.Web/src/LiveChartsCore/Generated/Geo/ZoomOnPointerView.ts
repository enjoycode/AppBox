import * as LiveChartsCore from '@/LiveChartsCore'

export class ZoomOnPointerView {
    public constructor(pivot: LiveChartsCore.LvcPoint, direction: LiveChartsCore.ZoomDirection) {
        this.Pivot = (pivot).Clone();
        this.Direction = direction;
    }

    #Pivot: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
    public get Pivot() {
        return this.#Pivot;
    }

    private set Pivot(value) {
        this.#Pivot = value;
    }

    #Direction: LiveChartsCore.ZoomDirection = 0;
    public get Direction() {
        return this.#Direction;
    }

    private set Direction(value) {
        this.#Direction = value;
    }
}
