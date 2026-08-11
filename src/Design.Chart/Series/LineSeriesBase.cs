namespace AppBoxDesign;

public abstract class LineSeriesBase : CartesianSeriesBase
{
    public double? Smoothness { get; set; }

    public ChartPaint? Fill { get; set; }
}