import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Scaler {
    private readonly _deltaVal: number;
    private readonly _m: number;
    private readonly _mInv: number;
    private readonly _minPx: number;
    private readonly _maxPx: number;
    private readonly _deltaPx: number;
    private readonly _orientation: LiveChartsCore.AxisOrientation;

    // /// <summary>
    // /// Initializes a new instance of the <see cref="Scaler"/> class.
    // /// </summary>
    // /// <param name="drawMarginLocation">The draw margin location.</param>
    // /// <param name="drawMarginSize">Size of the draw margin.</param>
    // /// <param name="axis">The axis.</param>
    // /// <param name="bounds">Indicates the bounds to use.</param>
    // /// <exception cref="Exception">The axis is not ready to be scaled.</exception>
    // public Scaler(
    //     LvcPoint drawMarginLocation,
    //     LvcSize drawMarginSize,
    //     ICartesianAxis axis,
    //     Bounds? bounds = null)
    // {
    //     if (axis.Orientation == AxisOrientation.Unknown) throw new Exception("The axis is not ready to be scaled.");
    //
    //     _orientation = axis.Orientation;
    //
    //     var actualBounds = axis.DataBounds;
    //     var actualVisibleBounds = axis.VisibleDataBounds;
    //     var maxLimit = axis.MaxLimit;
    //     var minLimit = axis.MinLimit;
    //
    //     if (bounds != null)
    //     {
    //         actualBounds = bounds;
    //         actualVisibleBounds = bounds;
    //         minLimit = null;
    //         maxLimit = null;
    //     }
    //
    //     if (double.IsInfinity(actualBounds.Delta) || double.IsInfinity(actualVisibleBounds.Delta))
    //     {
    //         MaxVal = 0;
    //         MinVal = 0;
    //         _deltaVal = 0;
    //
    //         if (axis.Orientation == AxisOrientation.X)
    //         {
    //             _minPx = drawMarginLocation.X;
    //             _maxPx = drawMarginLocation.X + drawMarginSize.Width;
    //             _deltaPx = _maxPx - _minPx;
    //         }
    //         else
    //         {
    //             _minPx = drawMarginLocation.Y;
    //             _maxPx = drawMarginLocation.Y + drawMarginSize.Height;
    //             _deltaPx = _maxPx - _minPx;
    //         }
    //
    //         _m = 0;
    //         _mInv = 0;
    //
    //         return;
    //     }
    //
    //     if (axis.Orientation == AxisOrientation.X)
    //     {
    //         _minPx = drawMarginLocation.X;
    //         _maxPx = drawMarginLocation.X + drawMarginSize.Width;
    //         _deltaPx = _maxPx - _minPx;
    //
    //         MaxVal = axis.IsInverted ? actualBounds.Min : actualBounds.Max;
    //         MinVal = axis.IsInverted ? actualBounds.Max : actualBounds.Min;
    //
    //         if (maxLimit is not null || minLimit is not null)
    //         {
    //             MaxVal = axis.IsInverted ? minLimit ?? MinVal : maxLimit ?? MaxVal;
    //             MinVal = axis.IsInverted ? maxLimit ?? MaxVal : minLimit ?? MinVal;
    //         }
    //         else
    //         {
    //             var visibleMax = axis.IsInverted ? actualVisibleBounds.Min : actualVisibleBounds.Max;
    //             var visibleMin = axis.IsInverted ? actualVisibleBounds.Max : actualVisibleBounds.Min;
    //
    //             if (visibleMax != MaxVal || visibleMin != MinVal)
    //             {
    //                 MaxVal = visibleMax;
    //                 MinVal = visibleMin;
    //             }
    //         }
    //
    //         _deltaVal = MaxVal - MinVal;
    //     }
    //     else
    //     {
    //         _minPx = drawMarginLocation.Y;
    //         _maxPx = drawMarginLocation.Y + drawMarginSize.Height;
    //         _deltaPx = _maxPx - _minPx;
    //
    //         MaxVal = axis.IsInverted ? actualBounds.Max : actualBounds.Min;
    //         MinVal = axis.IsInverted ? actualBounds.Min : actualBounds.Max;
    //
    //         if (maxLimit is not null || minLimit is not null)
    //         {
    //             MaxVal = axis.IsInverted ? maxLimit ?? MinVal : minLimit ?? MaxVal;
    //             MinVal = axis.IsInverted ? minLimit ?? MaxVal : maxLimit ?? MinVal;
    //         }
    //         else
    //         {
    //             var visibleMax = axis.IsInverted ? actualVisibleBounds.Max : actualVisibleBounds.Min;
    //             var visibleMin = axis.IsInverted ? actualVisibleBounds.Min : actualVisibleBounds.Max;
    //
    //             if (visibleMax != MaxVal || visibleMin != MinVal)
    //             {
    //                 MaxVal = visibleMax;
    //                 MinVal = visibleMin;
    //             }
    //         }
    //
    //         _deltaVal = MaxVal - MinVal;
    //     }
    //
    //     _m = _deltaPx / _deltaVal;
    //     _mInv = 1 / _m;
    //
    //     if (!double.IsNaN(_m) && !double.IsInfinity(_m)) return;
    //     _m = 0;
    //     _mInv = 0;
    // }

    private constructor(minPx: number, maxPx: number, deltaPx: number, deltaVal: number, m: number, mInv: number,
                        orientation: LiveChartsCore.AxisOrientation) {
        this._minPx = minPx;
        this._maxPx = maxPx;
        this._deltaPx = deltaPx;
        this._deltaVal = deltaVal;
        this._m = m;
        this._mInv = mInv;
        this._orientation = orientation;
    }

    public static MakeDefault(): Scaler {
        let minPx: number = 0;
        let maxPx: number = 100;
        let deltaPx: number = maxPx - minPx;
        let deltaVal: number = 0 - 100;
        let m: number = deltaPx / deltaVal;
        let mInv: number = 1 / m;
        return new Scaler(minPx, maxPx, deltaPx, deltaVal, m, mInv, LiveChartsCore.AxisOrientation.Unknown).Init({
            MaxVal: 0,
            MinVal: 100
        });
    }

    public static Make(drawMarginLocation: LiveChartsCore.LvcPoint, drawMarginSize: LiveChartsCore.LvcSize,
                       axis: LiveChartsCore.ICartesianAxis, bounds: Nullable<LiveChartsCore.Bounds> = null): Scaler {
        if (axis.Orientation == LiveChartsCore.AxisOrientation.Unknown)
            throw new System.Exception("The axis is not ready to be scaled.");

        let _orientation = axis.Orientation;
        let _deltaVal: number = 0;
        let _m: number = 0;
        let _mInv: number = 0;
        let _minPx: number = 0;
        let _maxPx: number = 0;
        let _deltaPx: number = 0;
        let MaxVal: number = 0;
        let MinVal: number = 0;

        let actualBounds = axis.DataBounds;
        let actualVisibleBounds = axis.VisibleDataBounds;
        let maxLimit = axis.MaxLimit;
        let minLimit = axis.MinLimit;

        if (bounds != null) {
            actualBounds = bounds;
            actualVisibleBounds = bounds;
            minLimit = null;
            maxLimit = null;
        }

        if (!Number.isFinite(actualBounds.Delta) || !Number.isFinite(actualVisibleBounds.Delta)) {
            MaxVal = 0;
            MinVal = 0;
            _deltaVal = 0;

            if (axis.Orientation == LiveChartsCore.AxisOrientation.X) {
                _minPx = drawMarginLocation.X;
                _maxPx = drawMarginLocation.X + drawMarginSize.Width;
                _deltaPx = _maxPx - _minPx;
            } else {
                _minPx = drawMarginLocation.Y;
                _maxPx = drawMarginLocation.Y + drawMarginSize.Height;
                _deltaPx = _maxPx - _minPx;
            }

            _m = 0;
            _mInv = 0;

            return new Scaler(_minPx, _maxPx, _deltaPx, _deltaVal, _m, _mInv, _orientation).Init({
                MaxVal: MaxVal,
                MinVal: MinVal
            });
        }

        if (axis.Orientation == LiveChartsCore.AxisOrientation.X) {
            _minPx = drawMarginLocation.X;
            _maxPx = drawMarginLocation.X + drawMarginSize.Width;
            _deltaPx = _maxPx - _minPx;

            MaxVal = axis.IsInverted ? actualBounds.Min : actualBounds.Max;
            MinVal = axis.IsInverted ? actualBounds.Max : actualBounds.Min;

            if (maxLimit != null || minLimit != null) {
                MaxVal = axis.IsInverted ? minLimit ?? MinVal : maxLimit ?? MaxVal;
                MinVal = axis.IsInverted ? maxLimit ?? MaxVal : minLimit ?? MinVal;
            } else {
                let visibleMax = axis.IsInverted ? actualVisibleBounds.Min : actualVisibleBounds.Max;
                let visibleMin = axis.IsInverted ? actualVisibleBounds.Max : actualVisibleBounds.Min;

                if (visibleMax != MaxVal || visibleMin != MinVal) {
                    MaxVal = visibleMax;
                    MinVal = visibleMin;
                }
            }

            _deltaVal = MaxVal - MinVal;
        } else {
            _minPx = drawMarginLocation.Y;
            _maxPx = drawMarginLocation.Y + drawMarginSize.Height;
            _deltaPx = _maxPx - _minPx;

            MaxVal = axis.IsInverted ? actualBounds.Max : actualBounds.Min;
            MinVal = axis.IsInverted ? actualBounds.Min : actualBounds.Max;

            if (maxLimit != null || minLimit != null) {
                MaxVal = axis.IsInverted ? maxLimit ?? MinVal : minLimit ?? MaxVal;
                MinVal = axis.IsInverted ? minLimit ?? MaxVal : maxLimit ?? MinVal;
            } else {
                let visibleMax = axis.IsInverted ? actualVisibleBounds.Max : actualVisibleBounds.Min;
                let visibleMin = axis.IsInverted ? actualVisibleBounds.Min : actualVisibleBounds.Max;

                if (visibleMax != MaxVal || visibleMin != MinVal) {
                    MaxVal = visibleMax;
                    MinVal = visibleMin;
                }
            }

            _deltaVal = MaxVal - MinVal;
        }

        _m = _deltaPx / _deltaVal;
        _mInv = 1 / _m;

        if (!Number.isNaN(_m) && !!Number.isFinite(_m))
            return new Scaler(_minPx, _maxPx, _deltaPx, _deltaVal, _m, _mInv, _orientation).Init({
                MaxVal: MaxVal,
                MinVal: MinVal
            });
        _m = 0;
        _mInv = 0;
        return new Scaler(_minPx, _maxPx, _deltaPx, _deltaVal, _m, _mInv, _orientation).Init({
            MaxVal: MaxVal,
            MinVal: MinVal
        });
    }

    #MaxVal: number = 0;
    public get MaxVal() {
        return this.#MaxVal;
    }

    private set MaxVal(value) {
        this.#MaxVal = value;
    }

    #MinVal: number = 0;
    public get MinVal() {
        return this.#MinVal;
    }

    private set MinVal(value) {
        this.#MinVal = value;
    }

    public MeasureInPixels(value: number): number {
        {
            return Math.abs(this._orientation == LiveChartsCore.AxisOrientation.X
                ? <number><unknown>(this._minPx + (value - this.MinVal) * this._m - (this._minPx + (0 - this.MinVal) * this._m))
                : <number><unknown>(this._minPx + (0 - this.MinVal) * this._m - (this._minPx + (value - this.MinVal) * this._m)));
        }
    }

    public ToPixels(value: number): number {
        return <number><unknown>(this._minPx + (value - this.MinVal) * this._m);
    }

    public ToChartValues(pixels: number): number {
        return this.MinVal + (pixels - this._minPx) * this._mInv;
    }
}
