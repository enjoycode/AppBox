namespace AppBoxDesign;

public abstract class LineSeriesBase : CartesianSeriesBase
{
    public double LineSmoothness { get; set; } = 0.65;

    public ChartPaint? Fill { get; set; }
}