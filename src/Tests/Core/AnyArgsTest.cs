using System.Runtime.CompilerServices;
using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public class AnyArgsTest
{
    private enum Gender : byte
    {
        Unknown = 0,
        Male = 1,
        Female = 2,
    }

    [Test]
    public void AnyValueCastTest()
    {
        var anyValue = AnyValue.From(123);
        Assert.IsTrue(anyValue.CastTo<int>() == 123);

        anyValue = AnyValue.Empty;
        Assert.Throws<InvalidCastException>(() => anyValue.CastTo<int>());

        Assert.IsTrue(anyValue.CastTo<int?>() == null);
    }

    [Test]
    public void AnyValueOfEnumTest()
    {
        var anyValue = AnyValue.From(Gender.Male);
        var gender = anyValue.GetEnum<Gender>();
        Assert.True(gender == Gender.Male);
    }

    [Test]
    public void GetArrayTest()
    {
        //模拟Web前端序列化的object[]转换为指定类型的int[]
        var src = new object[] { 1, 2, 3 };
        var args = AnyArgs.Make(src);
        var dest = args.GetArray<int>();
        Assert.True(dest is { Length: 3 });
    }

    [Test]
    public void GetListTest()
    {
        //模拟Web前端序列化的List<object>转换为指定类型的List
        var src = new List<object> { 1, 2, 3 };
        var args = AnyArgs.Make(src);
        var dest = args.GetList<int>();
        Assert.True(dest is { Count: 3 });
    }

    [Test]
    public void GetWhenNothingToRead()
    {
        var ws = new MessageWriteStream();
        ws.WriteByte((byte)MessageType.InvokeRequest);
        ws.WriteInt(1);
        ws.WriteString("sys.OrderService.GetOrders2");
        var reqData = ws.FinishWrite();

        var rs = new MessageReadStream(reqData.First!);
        rs.ReadByte(); //MsgType
        rs.ReadInt(); //MsgId
        var service = rs.ReadString();

        // var args = AnyArgs.From(rs);
        // args.GetObject();
        Assert.Throws<SerializationException>(() => rs.Deserialize());

        rs.Free();
    }
}