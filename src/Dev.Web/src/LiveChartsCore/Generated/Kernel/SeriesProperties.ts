export enum SeriesProperties {
    AllSeries = 0,

    CartesianSeries = 1 << 1,
    Bar = 1 << 2,
    Line = 1 << 3,
    StepLine = 1 << 4,
    Scatter = 1 << 5,

    Heat = 1 << 6,

    Financial = 1 << 7,

    PieSeries = 1 << 8,

    Stacked = 1 << 9,

    PrimaryAxisVerticalOrientation = 1 << 10,

    PrimaryAxisHorizontalOrientation = 1 << 11,

    Gauge = 1 << 12,

    GaugeFill = 1 << 13,

    Sketch = 1 << 14,

    Solid = 1 << 15,

    PrefersXStrategyTooltips = 1 << 16,

    PrefersYStrategyTooltips = 1 << 17,

    PrefersXYStrategyTooltips = 1 << 18,

    Polar = 1 << 19,

    PolarLine = 1 << 20
}
