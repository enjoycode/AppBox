import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class LvcRectangle {
    public constructor(location: LiveChartsCore.LvcPoint, size: LiveChartsCore.LvcSize) {
        this.Location = (location).Clone();
        this.Size = (size).Clone();
    }

    public static readonly Empty: LvcRectangle = (new LvcRectangle(new LiveChartsCore.LvcPoint(0, 0), new LiveChartsCore.LvcSize(0, 0))).Clone();

    public Location: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();

    public get X(): number {
        return this.Location.X;
    }

    public get Y(): number {
        return this.Location.Y;
    }

    public Size: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();

    public get Width(): number {
        return this.Size.Width;
    }

    public get Height(): number {
        return this.Size.Height;
    }

    public static op_Equality(left: LvcRectangle, right: LvcRectangle): boolean {
        return System.OpEquality(left.Location, right.Location) && System.OpEquality(left.Size, right.Size);
    }

    public static op_Inequality(left: LvcRectangle, right: LvcRectangle): boolean {
        return !(System.OpEquality(left, right));
    }

    public Clone(): LvcRectangle {
        return new LvcRectangle(new LiveChartsCore.LvcPoint(this.Location.X, this.Location.Y), new LiveChartsCore.LvcSize(this.Size.Width, this.Size.Height));
    }
}
