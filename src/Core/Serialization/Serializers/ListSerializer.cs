using System.Collections;

namespace AppBoxCore;

internal sealed class ListSerializer : TypeSerializer
{
    public ListSerializer() : base(PayloadType.List, typeof(List<>)) { }

    public override void Write(IOutputStream bs, object instance)
    {
        var list = (IList)instance;
        var elementType = list.GetType().GenericTypeArguments[0];
        //先写入元素个数
        bs.WriteVariant(list.Count);
        //再写入各元素
        bs.WriteCollection(elementType!, list.Count, i => list[i]);
    }

    public override object? Read(IInputStream bs, object? instance)
    {
        var list = (IList)instance!;
        var elementType = list.GetType().GenericTypeArguments[0];
        //读到元数个数
        var count = bs.ReadVariant();
        //读各元数
        bs.ReadCollection(elementType, count, (i, v) => list.Add(v));
        return list;
    }
}