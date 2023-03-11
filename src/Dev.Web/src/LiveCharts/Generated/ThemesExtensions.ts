import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'
import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ThemesExtensions {
    public static AddLightTheme(settings: LiveChartsCore.LiveChartsSettings, additionalStyles: Nullable<System.Action1<LiveChartsCore.Theme<LiveCharts.SkiaDrawingContext>>> = null): LiveChartsCore.LiveChartsSettings {
        return settings
            .HasTheme((theme: LiveChartsCore.Theme<LiveCharts.SkiaDrawingContext>) => {
                LiveChartsCore.LiveCharts.DefaultSettings
                    .WithAnimationsSpeed(System.TimeSpan.FromMilliseconds(800))
                    .WithEasingFunction(LiveChartsCore.EasingFunctions.ExponentialOut);

                let colors = LiveChartsCore.ColorPalletes.MaterialDesign500;
                LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeFillSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPolarLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPieSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForScatterSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForFinancialSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForHeatSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForAxes(theme
                                                                        , axis => {
                                                                            axis.TextSize = 16;
                                                                            axis.ShowSeparatorLines = true;
                                                                            axis.NamePaint = new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(35, 35, 35)});
                                                                            axis.LabelsPaint = new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(70, 70, 70)});
                                                                            if (LiveChartsCore.IsInterfaceOfICartesianAxis(axis)) {
                                                                                const cartesian = axis;
                                                                                axis.SeparatorsPaint = cartesian.Orientation == LiveChartsCore.AxisOrientation.X
                                                                                    ? null
                                                                                    : new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(235, 235, 235)});
                                                                                cartesian.Padding = LiveChartsCore.Padding.All(12);
                                                                            } else {
                                                                                axis.SeparatorsPaint = new LiveCharts.SolidColorPaint().Init({Color: new PixUI.Color(235, 235, 235)});
                                                                            }
                                                                        })
                                                                    , lineSeries => {
                                                                        let color = LiveCharts.ThemesExtensions.GetThemedColor(lineSeries, colors);

                                                                        lineSeries.Name = `Series #${lineSeries.SeriesId + 1}`;
                                                                        lineSeries.GeometrySize = 12;
                                                                        lineSeries.GeometryStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                        lineSeries.GeometryFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(250, 250, 250));
                                                                        lineSeries.Stroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                        lineSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(50));
                                                                    })
                                                                , steplineSeries => {
                                                                    let color = LiveCharts.ThemesExtensions.GetThemedColor(steplineSeries, colors);

                                                                    steplineSeries.Name = `Series #${steplineSeries.SeriesId + 1}`;
                                                                    steplineSeries.GeometrySize = 12;
                                                                    steplineSeries.GeometryStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                    steplineSeries.GeometryFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(250, 250, 250));
                                                                    steplineSeries.Stroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                    steplineSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(50));
                                                                })
                                                            , stackedLine => {
                                                                let color = LiveCharts.ThemesExtensions.GetThemedColor(stackedLine, colors);

                                                                stackedLine.Name = `Series #${stackedLine.SeriesId + 1}`;
                                                                stackedLine.GeometrySize = 0;
                                                                stackedLine.GeometryStroke = null;
                                                                stackedLine.GeometryFill = null;
                                                                stackedLine.Stroke = null;
                                                                stackedLine.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                            })
                                                        , barSeries => {
                                                            let color = LiveCharts.ThemesExtensions.GetThemedColor(barSeries, colors);

                                                            barSeries.Name = `Series #${barSeries.SeriesId + 1}`;
                                                            barSeries.Stroke = null;
                                                            barSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                            barSeries.Rx = 4;
                                                            barSeries.Ry = 4;
                                                        })
                                                    , stackedBarSeries => {
                                                        let color = LiveCharts.ThemesExtensions.GetThemedColor(stackedBarSeries, colors);

                                                        stackedBarSeries.Name = `Series #${stackedBarSeries.SeriesId + 1}`;
                                                        stackedBarSeries.Stroke = null;
                                                        stackedBarSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                        stackedBarSeries.Rx = 0;
                                                        stackedBarSeries.Ry = 0;
                                                    })
                                                , stackedStep => {
                                                    let color = LiveCharts.ThemesExtensions.GetThemedColor(stackedStep, colors);

                                                    stackedStep.Name = `Series #${stackedStep.SeriesId + 1}`;
                                                    stackedStep.GeometrySize = 0;
                                                    stackedStep.GeometryStroke = null;
                                                    stackedStep.GeometryFill = null;
                                                    stackedStep.Stroke = null;
                                                    stackedStep.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                })
                                            , heatSeries => {
                                                // ... rules here
                                            })
                                        , financialSeries => {
                                            financialSeries.Name = `Series #${financialSeries.SeriesId + 1}`;

                                            financialSeries.UpFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(139, 195, 74, 255));
                                            financialSeries.UpStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(139, 195, 74, 255), 3);
                                            financialSeries.DownFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(239, 83, 80, 255));
                                            financialSeries.DownStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(239, 83, 80, 255), 3);
                                        })
                                    , scatterSeries => {
                                        let color = LiveCharts.ThemesExtensions.GetThemedColor(scatterSeries, colors);

                                        scatterSeries.Name = `Series #${scatterSeries.SeriesId + 1}`;
                                        scatterSeries.Stroke = null;
                                        scatterSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(200));
                                    })
                                , pieSeries => {
                                    let color = LiveCharts.ThemesExtensions.GetThemedColor(pieSeries, colors);

                                    pieSeries.Name = `Series #${pieSeries.SeriesId + 1}`;
                                    pieSeries.Stroke = null;
                                    pieSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                })
                            , polarLine => {
                                let color = LiveCharts.ThemesExtensions.GetThemedColor(polarLine, colors);

                                polarLine.Name = `Series #${polarLine.SeriesId + 1}`;
                                polarLine.GeometrySize = 12;
                                polarLine.GeometryStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                polarLine.GeometryFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(250, 250, 250));
                                polarLine.Stroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                polarLine.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(50));
                            })
                        , gaugeSeries => {
                            let color = LiveCharts.ThemesExtensions.GetThemedColor(gaugeSeries, colors);

                            gaugeSeries.Name = `Series #${gaugeSeries.SeriesId + 1}`;
                            gaugeSeries.Stroke = null;
                            gaugeSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                            gaugeSeries.DataLabelsPosition = LiveChartsCore.PolarLabelsPosition.ChartCenter;
                            gaugeSeries.DataLabelsPaint = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(70, 70, 70));
                        })
                    , gaugeFill => {
                        gaugeFill.Fill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(30, 30, 30, 10));
                    });

                additionalStyles?.call(this, theme);
            });
    }

    public static AddDarkTheme(settings: LiveChartsCore.LiveChartsSettings, additionalStyles: Nullable<System.Action1<LiveChartsCore.Theme<LiveCharts.SkiaDrawingContext>>> = null): LiveChartsCore.LiveChartsSettings {
        return settings
            .HasTheme((theme: LiveChartsCore.Theme<LiveCharts.SkiaDrawingContext>) => {
                LiveChartsCore.LiveCharts.DefaultSettings
                    .WithAnimationsSpeed(System.TimeSpan.FromMilliseconds(800))
                    .WithEasingFunction(LiveChartsCore.EasingFunctions.ExponentialOut)
                    .WithTooltipBackgroundPaint(LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(45, 45, 45)))
                    .WithTooltipTextPaint(LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(245, 245, 245)));

                let colors = LiveChartsCore.ColorPalletes.MaterialDesign200;
                LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeFillSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForGaugeSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPolarLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForFinancialSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForHeatSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForPieSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForBarSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStackedLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForStepLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForLineSeries(LiveChartsCore.LiveChartsStylerExtensions.HasRuleForAxes(theme
                                                                    , axis => {
                                                                        axis.TextSize = 16;
                                                                        axis.ShowSeparatorLines = true;
                                                                        axis.NamePaint = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(235, 235, 235));
                                                                        axis.LabelsPaint = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(200, 200, 200));
                                                                        if (LiveChartsCore.IsInterfaceOfICartesianAxis(axis)) {
                                                                            const cartesian = axis;
                                                                            axis.SeparatorsPaint = cartesian.Orientation == LiveChartsCore.AxisOrientation.X
                                                                                ? null
                                                                                : LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(90, 90, 90));
                                                                            cartesian.Padding = LiveChartsCore.Padding.All(12);
                                                                        } else {
                                                                            axis.SeparatorsPaint = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(90, 90, 90));
                                                                        }
                                                                    })
                                                                , lineSeries => {
                                                                    let color = LiveCharts.ThemesExtensions.GetThemedColor(lineSeries, colors);

                                                                    lineSeries.Name = `Series #${lineSeries.SeriesId + 1}`;
                                                                    lineSeries.GeometrySize = 12;
                                                                    lineSeries.GeometryStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                    lineSeries.GeometryFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(30, 30, 30));
                                                                    lineSeries.Stroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                    lineSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(50));
                                                                })
                                                            , steplineSeries => {
                                                                let color = LiveCharts.ThemesExtensions.GetThemedColor(steplineSeries, colors);

                                                                steplineSeries.Name = `Series #${steplineSeries.SeriesId + 1}`;
                                                                steplineSeries.GeometrySize = 12;
                                                                steplineSeries.GeometryStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                steplineSeries.GeometryFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(30, 30, 30));
                                                                steplineSeries.Stroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                                                steplineSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(50));
                                                            })
                                                        , stackedLine => {
                                                            let color = LiveCharts.ThemesExtensions.GetThemedColor(stackedLine, colors);

                                                            stackedLine.Name = `Series #${stackedLine.SeriesId + 1}`;
                                                            stackedLine.GeometrySize = 0;
                                                            stackedLine.GeometryStroke = null;
                                                            stackedLine.GeometryFill = null;
                                                            stackedLine.Stroke = null;
                                                            stackedLine.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                        })
                                                    , barSeries => {
                                                        let color = LiveCharts.ThemesExtensions.GetThemedColor(barSeries, colors);

                                                        barSeries.Name = `Series #${barSeries.SeriesId + 1}`;
                                                        barSeries.Stroke = null;
                                                        barSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                        barSeries.Rx = 4;
                                                        barSeries.Ry = 4;
                                                    })
                                                , stackedBarSeries => {
                                                    let color = LiveCharts.ThemesExtensions.GetThemedColor(stackedBarSeries, colors);

                                                    stackedBarSeries.Name = `Series #${stackedBarSeries.SeriesId + 1}`;
                                                    stackedBarSeries.Stroke = null;
                                                    stackedBarSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                                    stackedBarSeries.Rx = 0;
                                                    stackedBarSeries.Ry = 0;
                                                })
                                            , pieSeries => {
                                                let color = LiveCharts.ThemesExtensions.GetThemedColor(pieSeries, colors);

                                                pieSeries.Name = `Series #${pieSeries.SeriesId + 1}`;
                                                pieSeries.Stroke = null;
                                                pieSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                            })
                                        , stackedStep => {
                                            let color = LiveCharts.ThemesExtensions.GetThemedColor(stackedStep, colors);

                                            stackedStep.Name = `Series #${stackedStep.SeriesId + 1}`;
                                            stackedStep.GeometrySize = 0;
                                            stackedStep.GeometryStroke = null;
                                            stackedStep.GeometryFill = null;
                                            stackedStep.Stroke = null;
                                            stackedStep.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                                        })
                                    , heatSeries => {
                                        // ... rules here
                                    })
                                , financialSeries => {
                                    financialSeries.Name = `Series #${financialSeries.SeriesId + 1}`;
                                    financialSeries.UpFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(139, 195, 74, 255));
                                    financialSeries.UpStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(139, 195, 74, 255), 3);
                                    financialSeries.DownFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(239, 83, 80, 255));
                                    financialSeries.DownStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(new PixUI.Color(239, 83, 80, 255), 3);
                                })
                            , polarLine => {
                                let color = LiveCharts.ThemesExtensions.GetThemedColor(polarLine, colors);

                                polarLine.Name = `Series #${polarLine.SeriesId + 1}`;
                                polarLine.GeometrySize = 12;
                                polarLine.GeometryStroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                polarLine.GeometryFill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(0));
                                polarLine.Stroke = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, 4);
                                polarLine.Fill = LiveCharts.SolidColorPaint.MakeByColor(color.WithAlpha(50));
                            })
                        , gaugeSeries => {
                            let color = LiveCharts.ThemesExtensions.GetThemedColor(gaugeSeries, colors);

                            gaugeSeries.Name = `Series #${gaugeSeries.SeriesId + 1}`;
                            gaugeSeries.Stroke = null;
                            gaugeSeries.Fill = LiveCharts.SolidColorPaint.MakeByColor(color);
                            gaugeSeries.DataLabelsPaint = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(200, 200, 200));
                        })
                    , gaugeFill => {
                        gaugeFill.Fill = LiveCharts.SolidColorPaint.MakeByColor(new PixUI.Color(255, 255, 255, 30));
                    });

                additionalStyles?.call(this, theme);
            });
    }

    private static GetThemedColor(series: LiveChartsCore.ISeries, colors: LiveChartsCore.LvcColor[]): PixUI.Color {
        return LiveCharts.LiveChartsSkiaSharp.AsSKColor(colors[series.SeriesId % colors.length]);
    }
}