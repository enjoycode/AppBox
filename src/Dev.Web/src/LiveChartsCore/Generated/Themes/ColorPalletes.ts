import * as LiveChartsCore from '@/LiveChartsCore'

export class ColorPalletes {
    public static get FluentDesign(): LiveChartsCore.LvcColor[] {
        return
        [
            ColorPalletes.RGB(116, 77, 169),
            ColorPalletes.RGB(231, 72, 86),
            ColorPalletes.RGB(255, 140, 0),
            ColorPalletes.RGB(0, 153, 188),
            ColorPalletes.RGB(191, 0, 119),
            ColorPalletes.RGB(1, 133, 116),
            ColorPalletes.RGB(194, 57, 179),
            ColorPalletes.RGB(76, 74, 72),
            ColorPalletes.RGB(0, 183, 195)
        ];
    }

    public static get MaterialDesign500(): LiveChartsCore.LvcColor[] {
        return
        [
            ColorPalletes.RGB(33, 150, 243),
            ColorPalletes.RGB(244, 67, 54),
            ColorPalletes.RGB(139, 195, 74),
            ColorPalletes.RGB(0, 188, 212),
            ColorPalletes.RGB(63, 81, 181),
            ColorPalletes.RGB(255, 193, 7),
            ColorPalletes.RGB(0, 150, 136),
            ColorPalletes.RGB(233, 30, 99),
            ColorPalletes.RGB(96, 125, 139),
        ];
    }

    public static get MaterialDesign200(): LiveChartsCore.LvcColor[] {
        return
        [
            ColorPalletes.RGB(144, 202, 249),
            ColorPalletes.RGB(239, 154, 154),
            ColorPalletes.RGB(197, 225, 165),
            ColorPalletes.RGB(128, 222, 234),
            ColorPalletes.RGB(159, 168, 218),
            ColorPalletes.RGB(255, 224, 130),
            ColorPalletes.RGB(128, 203, 196),
            ColorPalletes.RGB(244, 143, 177),
            ColorPalletes.RGB(176, 190, 197),
        ];
    }

    public static get MaterialDesign800(): LiveChartsCore.LvcColor[] {
        return
        [
            ColorPalletes.RGB(21, 101, 192),
            ColorPalletes.RGB(198, 40, 40),
            ColorPalletes.RGB(85, 139, 47),
            ColorPalletes.RGB(0, 131, 143),
            ColorPalletes.RGB(40, 53, 147),
            ColorPalletes.RGB(255, 143, 0),
            ColorPalletes.RGB(0, 105, 92),
            ColorPalletes.RGB(173, 20, 87),
            ColorPalletes.RGB(55, 71, 79),
        ];
    }

    private static RGB(r: number, g: number, b: number): LiveChartsCore.LvcColor {
        return LiveChartsCore.LvcColor.FromArgb(255, r, g, b);
    }
}
