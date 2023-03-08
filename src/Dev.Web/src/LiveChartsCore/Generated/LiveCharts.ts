import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class LiveCharts {
    public static EnableLogging: boolean = false;

    private static readonly s_defaultPaintTask: any = {};

    static #IsConfigured: boolean = false;
    public static get IsConfigured() {
        return LiveCharts.#IsConfigured;
    }

    private static set IsConfigured(value) {
        LiveCharts.#IsConfigured = value;
    }

    public static get DefaultSettings(): LiveChartsCore.LiveChartsSettings {
        return new LiveChartsCore.LiveChartsSettings();
    }


    public static get HoverKey(): string {
        return "HoverKey";
    }

    public static get TangentAngle(): number {
        return 1 << 25;
    }

    public static get CotangentAngle(): number {
        return 1 << 26;
    }

    public static DisableAnimations: System.TimeSpan = System.TimeSpan.FromMilliseconds(1);

    public static Configure(configuration: System.Action1<LiveChartsCore.LiveChartsSettings>) {
        if (configuration == null) throw new System.Exception(`${"LiveChartsSettings"} must not be null.`);

        LiveCharts.IsConfigured = true;
        configuration(LiveCharts.DefaultSettings);
    }

}
