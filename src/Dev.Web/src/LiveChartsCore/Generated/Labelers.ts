import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export class Labelers {
    private static constructor() {
        Labelers.Default = Labelers.Log10_6;
    }

    static #Default: System.Func2<number, string>;
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
        return value => Labelers.FormatCurrency(value, ",", ".", System.NumberFormatInfo.CurrentInfo.CurrencySymbol);
    }

    public static SetDefaultLabeler(labeler: System.Func2<number, string>) {
        Labelers.Default = labeler;
    }

    public static FormatCurrency(value: number, thousands: string, decimals: string, symbol: string): string {
        let l = value == 0 ? 0 : (Math.floor(Math.log10(Math.abs(value))) & 0xFFFFFFFF);
        let u = "";

        if (l >= 15) {
            value /= Math.pow(10, 15);
            u = "Q";
        } else if (l >= 12) {
            value /= Math.pow(10, 12);
            u = "T";
        } else if (l >= 9) {
            value /= Math.pow(10, 9);
            u = "B";
        } else if (l >= 6) {
            value /= Math.pow(10, 6);
            u = "M";
        }

        return toString(`${symbol}#${thousands}###${thousands}##0${decimals}## ${u}`);
    }

    public static BuildNamedLabeler(labels: System.IList<string>): LiveChartsCore.NamedLabeler {
        return new LiveChartsCore.NamedLabeler(labels);
    }

    private static Log10_6(value: number): string {
        let l = value == 0 ? 0 : (Math.floor(Math.log10(Math.abs(value))) & 0xFFFFFFFF);

        if (l >= 6) {
            value /= Math.pow(10, 6);
            return toString(`######0.####### M`);
        }

        if (l <= -6) {
            value *= Math.pow(10, 6);
            return toString(`######0.####### µ`);
        }

        return toString(`######0.#######`);
    }
}
