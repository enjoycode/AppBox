import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class DelayedFunction {
    public constructor(baseFunction: System.Func2<number, number>, point: LiveChartsCore.ChartPoint, perPointDelay: number = 10) {
        let visual = point.Context.Visual;
        let chart = point.Context.Chart;

        let delay = point.Context.Index * perPointDelay;
        let speed = <number><unknown>chart.AnimationsSpeed.TotalMilliseconds + delay;

        let d = delay / speed;

        this.Function = p => {
            if (p <= d) return 0;
            let p2 = (p - d) / (1 - d);
            return baseFunction(p2);
        };
        this.Speed = System.TimeSpan.FromMilliseconds(speed);
    }

    #Function: System.Func2<number, number>;
    public get Function() {
        return this.#Function;
    }

    private set Function(value) {
        this.#Function = value;
    }

    #Speed: System.TimeSpan = System.TimeSpan.Empty.Clone();
    public get Speed() {
        return this.#Speed;
    }

    private set Speed(value) {
        this.#Speed = value;
    }
}
