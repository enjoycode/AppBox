import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class Labelers {
    static #Default: System.Func2<number, string> = Labelers.Log10_6;
    public static get Default() {
        return Labelers.#Default;
    }

    private static set Default(value) {
        Labelers.#Default = value;
    }

    public static get SixRepresentativeDigits(): System.Func2<number, string> {
        return Labelers.Log10_6;
    }

    public static get Currency(): System.Func2<number, string> {
        return value => value.toString();
    }

    public static SetDefaultLabeler(labeler: System.Func2<number, string>) {
        Labelers.Default = labeler;
    }

    public static FormatCurrency(value: number, thousands: string, decimals: string, symbol: string): string {
        //TODO:
        return value.toString();
    }

    public static BuildNamedLabeler(labels: System.IList<string>): LiveChartsCore.NamedLabeler {
        return new LiveChartsCore.NamedLabeler(labels);
    }

    private static Log10_6(value: number): string {
        //TODO:
        return value.toString();
    }
}
