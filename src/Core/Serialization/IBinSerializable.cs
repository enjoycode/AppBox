namespace AppBoxCore;

public interface IBinSerializable
{
    void WriteTo(IOutputStream bs);

    void ReadFrom(IInputStream bs);
}