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

    SysKnownTypeAlreadyRegistered,
    NotSupportedValueType,
    NotSupportedClassType,
    KnownTypeOverriderIsNull,

    UnknownEntityMember,

    PayloadTypeNotMatch,

    ReadUnknownFieldId,

    NothingToRead,
    ReadVariantOutOfRange
}