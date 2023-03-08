import {DateTime} from "@/System/DateTime";

export class Stopwatch {
    private _startTime: DateTime;
    private _stopTime: DateTime | null;

    public Start() {
        this._startTime = DateTime.UtcNow;
    }

    public Stop() {
        this._stopTime = DateTime.UtcNow;
    }

    public get ElapsedMilliseconds(): bigint {
        if (this._stopTime == null)
            return BigInt(DateTime.UtcNow.Subtract(this._startTime).TotalMilliseconds);
        return BigInt(this._stopTime.Subtract(this._startTime).TotalMilliseconds);
    }
}