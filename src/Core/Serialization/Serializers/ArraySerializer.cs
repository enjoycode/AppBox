namespace AppBoxCore;

internal sealed class ArraySerializer : TypeSerializer
{
    public ArraySerializer()
        : base(PayloadType.Array, typeof(Array), null, false) { }

    public override void Write(IOutputStream bs, object instance)
    {
        var array = (Array)instance;
        var elementType = array.GetType().GetElementType();
        //先写入元素个数
        bs.WriteVariant(array.Length);
        //再写入各元素
        if (elementType == typeof(byte)) //short path for byte[]
            bs.WriteBytes((byte[])array);
        else
            bs.WriteCollection(elementType!, array.Length, i => array.GetValue(i));
    }

    public override object? Read(IInputStream bs, object? instance)
    {
        var array = (Array)instance!;
        var elementType = array.GetType().GetElementType();

        //注意：不再需要读取元素个数，已由序列化器读过
        if (elementType == typeof(byte)) //short path for byte[]
            bs.ReadBytes((byte[])array);
        else
            bs.ReadCollection(elementType!, array.Length, (i, v) => array.SetValue(v, i));
        return array;
    }
}