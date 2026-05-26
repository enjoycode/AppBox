namespace AppBoxCore;

public interface IBinSerializable
{
    void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream;

    void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream;
}