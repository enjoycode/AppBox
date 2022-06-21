import {ArgumentOutOfRangeException} from "./Exceptions";

const TicksPerSecond = 1000;
const TicksPerMinute = 60000;
const TicksPerHour = 3600000;
const TicksPerDay = 86400000;

export class TimeSpan {
    private readonly _ticks: number;

    public constructor(ticks: number)
    public constructor(hours: number, minutes: number, seconds: number)
    public constructor(a1: any, a2?: any, a3?: any) {
        if (a2 == undefined) {
            this._ticks = a1;
        } else {
            this._ticks = TimeSpan.TimeToTicks(a1 as number, a2 as number, a3 as number);
        }
    }

    public get TotalMilliseconds() {
        return this._ticks;
    }

    public get TotalSeconds() {
        return this._ticks / TicksPerSecond;
    }

    public Clone(): TimeSpan {
        return new TimeSpan(this._ticks);
    }

    static TimeToTicks(hours: number, minutes: number, seconds: number): number {
        let ticks = (hours * 3600 + minutes * 60 + seconds) * TicksPerSecond;
        if (ticks > Number.MAX_SAFE_INTEGER)
            throw new ArgumentOutOfRangeException("all");
        return ticks;
    }
}


export class DateTime {
    public static get UtcNow(): DateTime {
        return new DateTime(new Date());
    }

    private readonly _date: Date;

    public constructor(date: Date);
    public constructor(year: number, month: number, day: number);
    public constructor(year: number, month: number, day: number, hour: number, minute: number, second: number);
    public constructor(a1: Date | number, a2?: number, a3?: number, a4?: number, a5?: number, a6?: number) {
        if (a1 instanceof Date) {
            this._date = a1;
        } else if (a4 === undefined) {
            this._date = new Date(a1, a2!, a3);
        } else {
            this._date = new Date(a1, a2!, a3, a4, a5, a6);
        }
    }

    public get Ticks(): bigint {
        return (621355968000000000n /*UnixEpoch ticks*/ + BigInt(this._date.getTime())) * 10000n;
    }

    public Subtract(dateTime: DateTime): TimeSpan;
    public Subtract(timeSpan: TimeSpan): DateTime;
    public Subtract(other: DateTime | TimeSpan): DateTime | TimeSpan {
        if (other instanceof DateTime) {
            return new TimeSpan(this._date.getTime() - other._date.getTime());
        } else {
            let internalTicks = this._date.getTime();
            let otherTicks = other.TotalMilliseconds;
            if (internalTicks < otherTicks)
                throw new ArgumentOutOfRangeException("other");
            let newTicks = internalTicks - otherTicks;
            let result = new Date();
            result.setTime(newTicks);
            return new DateTime(result);
        }
    }

    // operator overrides
    public static op_Subtraction(v: DateTime, dateTime: DateTime): TimeSpan;
    public static op_Subtraction(v: DateTime, timeSpan: TimeSpan): DateTime;
    public static op_Subtraction(v: DateTime, other: DateTime | TimeSpan): DateTime | TimeSpan {
        if (other instanceof DateTime) return v.Subtract(other);
        return v.Subtract(other);
    }

    public Clone(): DateTime {
        return new DateTime(this._date);
    }

    public toString() {
        return this._date.toString();
    }

}
