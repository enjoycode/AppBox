using System.Collections.Generic;
using System.Linq;
using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public sealed class SerializationTest
{
    private static readonly EntityFactory[] _entityFactories =
        { new(TestEntity.MODELID, typeof(TestEntity)) };

    private static BytesSegment Serialize<T>(T obj)
    {
        var writer = MessageWriteStream.Rent();
        writer.Serialize(obj);
        var segment = writer.FinishWrite();
        MessageWriteStream.Return(writer);
        return segment;
    }

    private static object? Deserialize(BytesSegment data, EntityFactory[]? factories = null)
    {
        var reader = MessageReadStream.Rent(data.First!);
        if (factories != null)
            reader.Context.SetEntityFactories(factories);
        var res = reader.Deserialize();
        MessageReadStream.Return(reader);
        return res;
    }

    [Test]
    public void Utf8EncodeAndDecodeTest()
    {
        const string src = "h中😀";
        var buf = new byte[100];
        var pos = 0;
        StringUtil.WriteTo(src, (b) => buf[pos++] = b);

        var utf8Len = pos;
        Assert.True(utf8Len == 8);

        pos = 0;
        var res = StringUtil.ReadFrom(src.Length, () => buf[pos++]);
        Assert.True(src == res);
    }

    [Test]
    public void MessageStreamTest()
    {
        const string src = "h中😀";

        var writer = MessageWriteStream.Rent();
        writer.WriteBool(true);
        writer.WriteInt(1234);
        writer.WriteVariant(5678);
        writer.WriteString(src);
        var segment = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        var reader = MessageReadStream.Rent(segment.First!);
        Assert.True(reader.ReadBool() == true);
        Assert.True(reader.ReadInt() == 1234);
        Assert.True(reader.ReadVariant() == 5678);
        Assert.True(reader.ReadString() == src);
        MessageReadStream.Return(reader);
    }

    [Test]
    public void EntitySerializationTest()
    {
        var src = new TestEntity() { Name = "Rick", Score = 100 };
        var data = Serialize(src);
        var dest = (TestEntity)Deserialize(data, _entityFactories)!;

        Assert.True(src.Name == dest.Name && src.Score == dest.Score);
    }

    [Test]
    public void EntityArraySerializationTest()
    {
        var src = new TestEntity[]
        {
            new() { Name = "Rick", Score = 100 }
        };
        var data = Serialize(src);
        var dest = (TestEntity[])Deserialize(data, _entityFactories)!;
        Assert.True(src.Length == dest.Length);
    }

    [Test]
    public void ListOfValueSerializationTest()
    {
        var src = new List<int> { 1, 2, 3, 4 };
        var data = Serialize(src);
        var dest = (List<int>)Deserialize(data)!;
        Assert.True(src.Count == dest.Count);
        Assert.AreEqual(src, dest);
    }

    [Test]
    public void ListOfEntitySerializationTest()
    {
        var src = new List<TestEntity>
        {
            new() { Name = "Rick", Score = 100 },
            new() { Name = "Eric", Score = 200 }
        };
        var data = Serialize(src);
        var dest = (List<TestEntity>)Deserialize(data, _entityFactories)!;
        Assert.True(src.Count == dest.Count);
        Assert.AreEqual(src, dest);
    }
}