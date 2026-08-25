using AppBoxCore;

namespace AppBoxDesign;

public abstract class CartesianSeriesBase : ChartSeriesBase
{

    public void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        
    }
}