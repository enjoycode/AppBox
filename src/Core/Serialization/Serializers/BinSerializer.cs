namespace AppBoxCore;

/// <summary>
/// 实现了IBinSerializable的类型的默认序列化实现
/// </summary>
public sealed class BinSerializer : TypeSerializer
{
    public BinSerializer(PayloadType payloadType, Type sysType,
        Func<object>? creator = null, bool notWriteAttachInfo = true)
        : base(payloadType, sysType, creator, notWriteAttachInfo) { }

    public override void Write<T>(ref T bs, object instance)
    {
        ((IBinSerializable)instance).WriteTo(ref bs);
    }

    public override object? Read<T>(ref T bs, object? instance)
    {
        ((IBinSerializable)instance!).ReadFrom(ref bs);
        return instance;
    }
}