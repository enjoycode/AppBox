export class StackedValue {
    public Start: number = 0;

    public End: number = 0;

    public Total: number = 0;

    public get Share(): number {
        return (this.End - this.Start) / this.Total;
    }

    public NegativeStart: number = 0;

    public NegativeEnd: number = 0;

    public NegativeTotal: number = 0;
}
