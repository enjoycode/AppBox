import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class PolarScaler {
    private static readonly ToRadians: number = Math.PI / 180;
    private readonly _deltaRadius: number;
    private readonly _innerRadiusOffset: number;
    private readonly _outerRadiusOffset: number;
    private readonly _scalableRadius: number;
    private readonly _initialRotation: number;
    private readonly _deltaAngleVal: number;
    private readonly _circumference: number;

    public constructor(
        drawMagrinLocation: LiveChartsCore.LvcPoint,
        drawMarginSize: LiveChartsCore.LvcSize,
        angleAxis: LiveChartsCore.IPolarAxis,
        radiusAxis: LiveChartsCore.IPolarAxis,
        innerRadius: number,
        initialRotation: number,
        totalAngle: number,
        usePreviousScale: boolean = false) {
        let actualAngleBounds: LiveChartsCore.Bounds;
        let actualAngleVisibleBounds: LiveChartsCore.Bounds;
        let actualRadiusBounds: LiveChartsCore.Bounds;
        let actualRadiusVisibleBounds: LiveChartsCore.Bounds;

        if (usePreviousScale) {
            actualAngleBounds = angleAxis.DataBounds;
            actualAngleVisibleBounds = angleAxis.VisibleDataBounds;
            actualRadiusBounds = radiusAxis.DataBounds;
            actualRadiusVisibleBounds = radiusAxis.VisibleDataBounds;
        } else {
            actualAngleBounds = angleAxis.DataBounds;
            actualAngleVisibleBounds = angleAxis.VisibleDataBounds;
            actualRadiusBounds = radiusAxis.DataBounds;
            actualRadiusVisibleBounds = radiusAxis.VisibleDataBounds;
        }


        if (actualAngleBounds == null || actualAngleVisibleBounds == null) throw new System.Exception("angle bounds not found");
        if (actualRadiusBounds == null || actualRadiusVisibleBounds == null) throw new System.Exception("radius bounds not found");

        this.CenterX = drawMagrinLocation.X + drawMarginSize.Width * 0.5;
        this.CenterY = drawMagrinLocation.Y + drawMarginSize.Height * 0.5;

        this.MinRadius = radiusAxis.MinLimit ?? actualRadiusVisibleBounds.Min;
        this.MaxRadius = radiusAxis.MaxLimit ?? actualRadiusVisibleBounds.Max;
        this._deltaRadius = this.MaxRadius - this.MinRadius;

        let minDimension = drawMarginSize.Width < drawMarginSize.Height ? drawMarginSize.Width : drawMarginSize.Height;
        this._innerRadiusOffset = innerRadius;
        this.InnerRadius = innerRadius;
        this._outerRadiusOffset = 0;
        this._scalableRadius = minDimension * 0.5 - this._innerRadiusOffset - this._outerRadiusOffset;

        this.MinAngle = angleAxis.MinLimit ?? actualAngleBounds.Min;
        this.MaxAngle = angleAxis.MaxLimit ?? actualAngleBounds.Max;
        this._deltaAngleVal = this.MaxAngle - this.MinAngle;

        this._initialRotation = initialRotation;
        this._circumference = totalAngle;
    }

    #CenterX: number = 0;
    public get CenterX() {
        return this.#CenterX;
    }

    private set CenterX(value) {
        this.#CenterX = value;
    }

    #CenterY: number = 0;
    public get CenterY() {
        return this.#CenterY;
    }

    private set CenterY(value) {
        this.#CenterY = value;
    }

    #InnerRadius: number = 0;
    public get InnerRadius() {
        return this.#InnerRadius;
    }

    private set InnerRadius(value) {
        this.#InnerRadius = value;
    }

    #MaxRadius: number = 0;
    public get MaxRadius() {
        return this.#MaxRadius;
    }

    private set MaxRadius(value) {
        this.#MaxRadius = value;
    }

    #MinRadius: number = 0;
    public get MinRadius() {
        return this.#MinRadius;
    }

    private set MinRadius(value) {
        this.#MinRadius = value;
    }

    #MinAngle: number = 0;
    public get MinAngle() {
        return this.#MinAngle;
    }

    private set MinAngle(value) {
        this.#MinAngle = value;
    }

    #MaxAngle: number = 0;
    public get MaxAngle() {
        return this.#MaxAngle;
    }

    private set MaxAngle(value) {
        this.#MaxAngle = value;
    }

    public ToPixelsFromCharPoint(polarPoint: LiveChartsCore.ChartPoint): LiveChartsCore.LvcPoint {
        return this.ToPixels(polarPoint.SecondaryValue, polarPoint.PrimaryValue);
    }

    public ToPixels(angle: number, radius: number): LiveChartsCore.LvcPoint {
        let p = (radius - this.MinRadius) / this._deltaRadius;
        let r = this._innerRadiusOffset + this._scalableRadius * p;
        let a = this._circumference * angle / this._deltaAngleVal;

        a += this._initialRotation;
        a *= PolarScaler.ToRadians;
        {
            return new LiveChartsCore.LvcPoint(this.CenterX + <number><unknown>(Math.cos(a) * r),
                this.CenterY + <number><unknown>(Math.sin(a) * r));
        }
    }

    public ToChartValues(x: number, y: number): LiveChartsCore.LvcPointD {
        let dx = x - this.CenterX;
        let dy = y - this.CenterY;
        let hyp = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) - this._innerRadiusOffset;

        let r = hyp / this._scalableRadius;

        let a = Math.atan(dy / dx) * (1 / PolarScaler.ToRadians);

        if (dx < 0 && dy > 0) a = 180 + a;
        if (dx < 0 && dy <= 0) a = 180 + a;
        if (dx > 0 && dy <= 0) a = 360 + a;

        a -= this._initialRotation;
        if (a < 0) a = 360 - a;

        return new LiveChartsCore.LvcPointD(this.MinAngle + this._deltaAngleVal * a / this._circumference,
            this.MinRadius + r * (this.MaxRadius - this.MinRadius));
    }

    public ToPixelsWithAngleInDegrees(angle: number, radius: number): LiveChartsCore.LvcPoint {
        let p = (radius - this.MinRadius) / this._deltaRadius;
        let r = this._innerRadiusOffset + this._scalableRadius * p;
        let a = angle * PolarScaler.ToRadians;
        {
            return new LiveChartsCore.LvcPoint(this.CenterX + <number><unknown>(Math.cos(a) * r),
                this.CenterY + <number><unknown>(Math.sin(a) * r));
        }
    }

    public GetAngle(angle: number): number {
        return <number><unknown>(this._initialRotation + this._circumference * angle / this._deltaAngleVal);
    }
}
