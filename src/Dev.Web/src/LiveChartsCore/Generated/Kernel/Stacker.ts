import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Stacker<TDrawingContext extends LiveChartsCore.DrawingContext> {
    private readonly _stackPositions: System.Dictionary<LiveChartsCore.IChartSeries<TDrawingContext>, number> = new System.Dictionary();
    private readonly _stack: System.List<System.Dictionary<number, LiveChartsCore.StackedValue>> = new System.List();
    private readonly _totals: System.Dictionary<number, LiveChartsCore.StackedTotal> = new System.Dictionary();
    private _stackCount: number = 0;
    private _knownMaxLenght: number = 0;

    public constructor() {
    }

    public get MaxLength(): number {
        return 0;
    }

    public GetSeriesStackPosition(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        let i: any;
        if (!this._stackPositions.TryGetValue(series, new System.Out(() => i, $v => i = $v))) {
            let n = new System.Dictionary<number, LiveChartsCore.StackedValue>(this._knownMaxLenght);
            this._stack.Add(n);
            i = this._stackCount++;
            this._stackPositions.SetAt(series, i);
        }

        return i;
    }

    public StackPoint(point: LiveChartsCore.ChartPoint, seriesStackPosition: number): number {
        let currentStack: any;
        let index = point.SecondaryValue;
        let value = point.PrimaryValue;
        let positiveStart = 0;
        let negativeStart = 0;

        if (seriesStackPosition > 0) {
            let ssp = seriesStackPosition;
            let found = false;

            // keep diging until you find a stack in the same position.
            while (ssp >= 0 && !found && ssp - 1 >= 0) {
                let previousActiveStack: any;
                let stackCol = this._stack[ssp - 1];
                if (stackCol.TryGetValue(index, new System.Out(() => previousActiveStack, $v => previousActiveStack = $v))) {
                    positiveStart = previousActiveStack.End;
                    negativeStart = previousActiveStack.NegativeEnd;
                    found = true;
                } else {
                    ssp--;
                }
            }
        }

        let si = this._stack[seriesStackPosition];

        if (!si.TryGetValue(point.SecondaryValue, new System.Out(() => currentStack, $v => currentStack = $v))) {
            let _: any;
            currentStack = new LiveChartsCore.StackedValue().Init(
                {
                    Start: positiveStart,
                    End: positiveStart,
                    NegativeStart: negativeStart,
                    NegativeEnd: negativeStart
                });
            si.Add(index, currentStack);
            if (!this._totals.TryGetValue(index, new System.Out(() => _, $v => _ = $v))) this._totals.Add(index, new LiveChartsCore.StackedTotal());
            this._knownMaxLenght++;
        }

        if (value >= 0) {
            currentStack.End += value;
            let positiveTotal = this._totals.GetAt(index).Positive + value;
            this._totals.GetAt(index).Positive = positiveTotal;

            return positiveTotal;
        } else {
            currentStack.NegativeEnd += value;
            let negativeTotal = this._totals.GetAt(index).Negative + value;
            this._totals.GetAt(index).Negative = negativeTotal;

            return negativeTotal;
        }
    }

    public GetStack(point: LiveChartsCore.ChartPoint, seriesStackPosition: number): LiveChartsCore.StackedValue {
        let index = point.SecondaryValue;
        let p = this._stack[seriesStackPosition].GetAt(index);

        return new LiveChartsCore.StackedValue().Init(
            {
                Start: p.Start,
                End: p.End,
                Total: this._totals.GetAt(index).Positive,
                NegativeStart: p.NegativeStart,
                NegativeEnd: p.NegativeEnd,
                NegativeTotal: this._totals.GetAt(index).Negative
            });
    }
}
