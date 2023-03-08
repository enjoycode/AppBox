import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Stacker<TDrawingContext extends LiveChartsCore.DrawingContext> {
    private readonly _stackPositions: System.ObjectMap<number> = new System.ObjectMap();
    private readonly _stack: System.List<System.DoubleMap<LiveChartsCore.StackedValue>> = new System.List();
    private readonly _totals: System.DoubleMap<LiveChartsCore.StackedTotal> = new System.DoubleMap();
    private _stackCount: number = 0;
    private _knownMaxLenght: number = 0;

    public constructor() {
    }

    public get MaxLength(): number {
        return 0;
    }

    public GetSeriesStackPosition(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        let i: Nullable<number> = this._stackPositions.get(series);
        if (i == null) {
            let n = new System.DoubleMap<LiveChartsCore.StackedValue>();
            this._stack.Add(n);
            i = this._stackCount++;
            this._stackPositions.set(series, i);
        }

        return i;
    }

    public StackPoint(point: LiveChartsCore.ChartPoint, seriesStackPosition: number): number {
        let index = point.SecondaryValue;
        let value = point.PrimaryValue;
        let positiveStart = 0;
        let negativeStart = 0;

        if (seriesStackPosition > 0) {
            let ssp = seriesStackPosition;
            let found = false;


            while (ssp >= 0 && !found && ssp - 1 >= 0) {
                let stackCol = this._stack[ssp - 1];
                let previousActiveStack = stackCol.get(index);
                if (previousActiveStack != null) {
                    positiveStart = previousActiveStack.End;
                    negativeStart = previousActiveStack.NegativeEnd;
                    found = true;
                } else {
                    ssp--;
                }
            }
        }

        let si = this._stack[seriesStackPosition];

        let currentStack = si.get(point.SecondaryValue);
        if (currentStack == null) {
            currentStack = new LiveChartsCore.StackedValue().Init(
                {
                    Start: positiveStart,
                    End: positiveStart,
                    NegativeStart: negativeStart,
                    NegativeEnd: negativeStart
                });
            si.set(index, currentStack);
            if (!this._totals.has(index)) this._totals.set(index, new LiveChartsCore.StackedTotal());
            this._knownMaxLenght++;
        }

        if (value >= 0) {
            currentStack.End += value;
            let positiveTotal = this._totals.get(index)!.Positive + value;
            this._totals.get(index)!.Positive = positiveTotal;

            return positiveTotal;
        } else {
            currentStack.NegativeEnd += value;
            let negativeTotal = this._totals.get(index)!.Negative + value;
            this._totals.get(index)!.Negative = negativeTotal;

            return negativeTotal;
        }
    }

    public GetStack(point: LiveChartsCore.ChartPoint, seriesStackPosition: number): LiveChartsCore.StackedValue {
        let index = point.SecondaryValue;
        let p = this._stack[seriesStackPosition].get(index);

        return new LiveChartsCore.StackedValue().Init(
            {
                Start: p.Start,
                End: p.End,
                Total: this._totals.get(index)!.Positive,
                NegativeStart: p.NegativeStart,
                NegativeEnd: p.NegativeEnd,
                NegativeTotal: this._totals.get(index)!.Negative
            });
    }
}
