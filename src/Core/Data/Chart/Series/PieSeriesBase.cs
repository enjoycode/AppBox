namespace AppBoxDesign;

public abstract class PieSeriesBase : ChartSeriesBase
{
    public double InnerRadius { get; set; }

    public double MaxRadialColumnWidth { get; set; } = double.MaxValue;
}