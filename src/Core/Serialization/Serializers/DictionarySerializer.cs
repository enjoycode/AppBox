using System.Collections;

namespace AppBoxCore;

internal sealed class DictionarySerializer : TypeSerializer
{
    public DictionarySerializer() : base(PayloadType.Dictionary, typeof(Dictionary<,>)) { }

    public override void Write<T>(ref T bs, object instance)
    {
        var dic = (IDictionary)instance;
        bs.WriteVariant(dic.Count);
        foreach (var key in dic.Keys)
        {
            bs.Serialize(key);
            bs.Serialize(dic[key]);
        }
    }

    public override object? Read<T>(ref T bs, object? instance)
    {
        var count = bs.ReadVariant();
        var dic = (IDictionary)instance!;
        for (var i = 0; i < count; i++)
        {
            dic.Add(bs.Deserialize()!, bs.Deserialize());
        }

        return instance;
    }
}