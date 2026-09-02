namespace AppBoxCore;

/// <summary>
/// 用于抽象类或接口类型，仅用于反序列化读取类型
/// </summary>
public sealed class PolymorphicTypeSerializer : TypeSerializer
{
    public PolymorphicTypeSerializer(PayloadType payloadType, Type sysType) :
        base(payloadType, sysType) { }

    public PolymorphicTypeSerializer(ExtKnownTypeId extKnownTypeId, Type extType) : base(
        extKnownTypeId, extType, () => throw new NotSupportedException()) { }

    public override void Write<T>(ref T bs, object instance) => throw new NotSupportedException();

    public override object? Read<T>(ref T bs, object? instance) => throw new NotSupportedException();
}