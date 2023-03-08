import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class KeyFrame {
    public Time: number = 0;

    public Value: number = 0;

    public EasingFunction: System.Func2<number, number> = LiveChartsCore.EasingFunctions.Lineal;
}
