import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class MoveToPathCommand extends LiveCharts.PathCommand implements LiveChartsCore.IMoveToPathCommand<PixUI.Path> {
    private readonly _xProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _yProperty: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._xProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X", 0));
        this._yProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y", 0));
    }

    public get X(): number {
        return this._xProperty.GetMovement(this);
    }

    public set X(value: number) {
        this._xProperty.SetMovement(value, this);
    }

    public get Y(): number {
        return this._yProperty.GetMovement(this);
    }

    public set Y(value: number) {
        this._yProperty.SetMovement(value, this);
    }

    Execute(path: PixUI.Path, currentTime: bigint, pathGeometry: LiveChartsCore.Animatable) {
        currentTime = currentTime;
        path.moveTo(this.X, this.Y);
    }
}
