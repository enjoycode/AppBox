namespace AppBoxCore;

public interface IEntityStoreOptions : IBinSerializable
{
    DataStoreKind Kind { get; }

    void AcceptChanges();
}