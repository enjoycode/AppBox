namespace AppBoxCore;

/// <summary>
/// 实现了IBinSerializable的类型的默认序列化实现
/// </summary>
public sealed class BinSerializer : TypeSerializer
{
    public BinSerializer(PayloadType payloadType, Type sysType,
        Func<object>? creator = null, bool notWriteAttachInfo = true)
        : base(payloadType, sysType, creator, notWriteAttachInfo) { }

    public override void Write(IOutputStream bs, object instance)
    {
        ((IBinSerializable)instance).WriteTo(bs);
    }

    public override object? Read(IInputStream bs, object? instance)
    {
        ((IBinSerializable)instance!).ReadFrom(bs);
        return instance;
    }
}