namespace AppBoxCore;

public interface IBinSerializable
{
    void WriteTo(IOutputStream ws);

    void ReadFrom(IInputStream rs);
}