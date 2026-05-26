using AppBoxCore;
using AppBoxDesign.Debugging;
using NUnit.Framework;

namespace Tests.Core;

public sealed class SerializationTest
{
    static SerializationTest()
    {
        AppBoxDesign.DesignTypeSerializer.Register();
    }

    private static readonly EntityFactory[] EntityFactories = [new(DemoEntity.MODELID, typeof(DemoEntity))];

    internal static BytesSegment Serialize<T>(T obj)
    {
        var writer = new MessageWriteStream();
        writer.Serialize(obj);
        var segment = writer.FinishWrite();
        return segment;
    }

    internal static object? Deserialize(BytesSegment data, EntityFactory[]? factories = null)
    {
        var reader = new MessageReadStream(data.First!);
        if (factories != null)
            reader.Context.SetEntityFactories(factories);
        var res = reader.Deserialize();
        reader.Free();
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

        var writer = new MessageWriteStream();
        writer.WriteBool(true);
        writer.WriteInt(1234);
        writer.WriteVariant(5678);
        writer.WriteString(src);
        var segment = writer.FinishWrite();

        var reader = new MessageReadStream(segment.First!);
        Assert.True(reader.ReadBool() == true);
        Assert.True(reader.ReadInt() == 1234);
        Assert.True(reader.ReadVariant() == 5678);
        Assert.True(reader.ReadString() == src);
        reader.Free();
    }

    [Test]
    public void EntitySerializationTest()
    {
        var src = new DemoEntity() { Name = "Rick", Score = 100 };
        var data = Serialize(src);
        var dest = (DemoEntity)Deserialize(data, EntityFactories)!;

        Assert.True(src.Name == dest.Name && src.Score == dest.Score);
    }

    [Test]
    public void EntityArraySerializationTest()
    {
        var src = new DemoEntity[]
        {
            new() { Name = "Rick", Score = 100 }
        };
        var data = Serialize(src);
        var dest = (DemoEntity[])Deserialize(data, EntityFactories)!;
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
        var src = new List<DemoEntity>
        {
            new() { Name = "Rick", Score = 100 },
            new() { Name = "Eric", Score = 200 }
        };
        var data = Serialize(src);
        var dest = (List<DemoEntity>)Deserialize(data, EntityFactories)!;
        Assert.True(src.Count == dest.Count);
        Assert.AreEqual(src, dest);
    }

    /// <summary>
    /// 测试有导航属性的实体序列化
    /// </summary>
    [Test]
    public void EntityWithNavigationSerializationTest()
    {
        var ou1 = new AppBoxStore.Entities.OrgUnit { Name = "Company" };
        var ou2 = new AppBoxStore.Entities.OrgUnit { Name = "Rick", Parent = ou1 };
        ou1.Children!.Add(ou2);

        var data = Serialize(ou1);

        var dest = (AppBoxStore.Entities.OrgUnit)Deserialize(data,
            [new(AppBoxStore.Entities.OrgUnit.MODELID, typeof(AppBoxStore.Entities.OrgUnit))])!;
        Assert.AreEqual(dest.Name, ou1.Name);
        Assert.AreEqual(dest.Children!.Count, 1);
        Assert.AreEqual(dest.Children[0].Name, ou2.Name);
        Assert.True(ReferenceEquals(dest.Children[0].Parent, dest));
    }

    /// <summary>
    /// DebugEventArgs序列化测试
    /// </summary>
    [Test]
    public void DebugEventArgsTest()
    {
        var eventArgs1 = new DebugEventArgs(12345678, new DebuggerExited { ExitCode = -1 });
        var args1 = AnyArgs.Make(eventArgs1);

        //序列化
        var writer = new MessageWriteStream();
        args1.SerializeTo(ref writer);
        var segment = writer.FinishWrite();

        //反序列化
        var reader = new MessageReadStream(segment.First!);
        var serverEventArgs = new ServerEventArgs<MessageReadStream>(reader);
        var eventArgs2 = (DebugEventArgs)serverEventArgs[0].GetObject()!;

        // var args2 = AnyArgs.From(reader);
        // var eventArgs2 = (DebugEventArgs)args2.GetObject()!;
        reader.Free();

        Assert.True(eventArgs1.TargetModelId == eventArgs2.TargetModelId);
    }
}