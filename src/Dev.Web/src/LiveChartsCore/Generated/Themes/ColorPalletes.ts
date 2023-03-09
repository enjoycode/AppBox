import * as LiveChartsCore from '@/LiveChartsCore'

export class ColorPalletes {
    public static get FluentDesign(): LiveChartsCore.LvcColor[] {
        return [
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
        return [
            ColorPalletes.RGB(33, 150, 243),    // blue
            ColorPalletes.RGB(244, 67, 54),     // red
            ColorPalletes.RGB(139, 195, 74),    // light green
            ColorPalletes.RGB(0, 188, 212),     // cyan
            ColorPalletes.RGB(63, 81, 181),     // indigo
            ColorPalletes.RGB(255, 193, 7),     // ambar
            ColorPalletes.RGB(0, 150, 136),     // teal
            ColorPalletes.RGB(233, 30, 99),     // pink
            ColorPalletes.RGB(96, 125, 139),    // blue gray
        ];
    }

    public static get MaterialDesign200(): LiveChartsCore.LvcColor[] {
        return [
            ColorPalletes.RGB(144, 202, 249),   // blue
            ColorPalletes.RGB(239, 154, 154),   // red
            ColorPalletes.RGB(197, 225, 165),   // light green
            ColorPalletes.RGB(128, 222, 234),   // cyan
            ColorPalletes.RGB(159, 168, 218),   // indigo
            ColorPalletes.RGB(255, 224, 130),   // ambar
            ColorPalletes.RGB(128, 203, 196),   // teal
            ColorPalletes.RGB(244, 143, 177),   // pink
            ColorPalletes.RGB(176, 190, 197),   // blue gray
        ];
    }

    public static get MaterialDesign800(): LiveChartsCore.LvcColor[] {
        return [
            ColorPalletes.RGB(21, 101, 192),    // blue
            ColorPalletes.RGB(198, 40, 40),     // red
            ColorPalletes.RGB(85, 139, 47),     // light green
            ColorPalletes.RGB(0, 131, 143),     // cyan
            ColorPalletes.RGB(40, 53, 147),     // indigo
            ColorPalletes.RGB(255, 143, 0),     // ambar
            ColorPalletes.RGB(0, 105, 92),      // teal
            ColorPalletes.RGB(173, 20, 87),     // pink
            ColorPalletes.RGB(55, 71, 79),      // blue gray
        ];
    }

    private static RGB(r: number, g: number, b: number): LiveChartsCore.LvcColor {
        return LiveChartsCore.LvcColor.FromArgb(255, r, g, b);
    }
}
