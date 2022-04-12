import * as System from '@/System'
import * as PixUI from '@/PixUI'

export enum ColumnWidthType {
    Auto,

    Percent,

    Fixed
}

export class ColumnWidth {
    private constructor(type: ColumnWidthType, value: number, minValue: number) {
        this.Type = type;
        this.Value = value;
        this.MinValue = minValue;
    }

    #Type: ColumnWidthType = 0;
    public get Type() {
        return this.#Type;
    }

    private set Type(value) {
        this.#Type = value;
    }

    #Value: number = 0;
    public get Value() {
        return this.#Value;
    }

    private set Value(value) {
        this.#Value = value;
    } //定义的值，可能为百分比或固定值

    #MinValue: number = 0;
    public get MinValue() {
        return this.#MinValue;
    }

    private set MinValue(value) {
        this.#MinValue = value;
    } //非固定值时的最小宽度

    public static Percent(percent: number, min: number = 20): ColumnWidth {
        percent = clamp(percent, 0, 100);
        return new ColumnWidth(ColumnWidthType.Percent, percent, min);
    }

    public static Auto(min: number = 20): ColumnWidth {
        return new ColumnWidth(ColumnWidthType.Auto, 0, min);
    }

    public static Fixed(width: number): ColumnWidth {
        width = Math.max(0, width);
        return new ColumnWidth(ColumnWidthType.Fixed, width, 0);
    }

    public ChangeValue(newValue: number) {
        this.Value = newValue;
    }
}
