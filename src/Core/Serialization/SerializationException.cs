namespace AppBoxCore;

public sealed class SerializationException : Exception
{
    public SerializationError Error { get; }

    public SerializationException(SerializationError error, string? msg = null) : base(msg)
    {
        Error = error;
    }
}

public enum SerializationError
{
    CanNotFindSerializer,
    UnknownTypeFlag,

    SysKnownTypeAlreadyRegisted,
    NotSupportedValueType,
    NotSupportedClassType,
    KnownTypeOverriderIsNull,
    
    PayloadTypeNotMatch,

    NothingToRead,
    ReadVariantOutOfRange
}