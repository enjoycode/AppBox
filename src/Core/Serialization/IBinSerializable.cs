namespace AppBoxCore;

public interface IBinSerializable
{
    void WriteTo(IOutputStream ws);

    void ReadFrom(IInputStream rs);
    
    //TODO:专用于Web的TypeName属性
}