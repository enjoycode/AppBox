using System.Collections.Generic;
using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public class InvokeArgsTest
{
    [Test]
    public void GetArrayTest()
    {
        //模拟Web前端序列化的object[]转换为指定类型的int[]
        var src = new object[] { 1, 2, 3 };
        var args = InvokeArgs.Make(src);
        var dest = args.GetArray<int>();
        Assert.True(dest is { Length: 3 });
    }

    [Test]
    public void GetListTest()
    {
        //模拟Web前端序列化的List<object>转换为指定类型的List
        var src = new List<object> { 1, 2, 3 };
        var args = InvokeArgs.Make(src);
        var dest = args.GetList<int>();
        Assert.True(dest is { Count: 3 });
    }

    [Test]
    public void GetWhenNothingToRead()
    {
        var ws = MessageWriteStream.Rent();
        ws.WriteByte((byte)MessageType.InvokeRequest);
        ws.WriteInt(1);
        ws.WriteString("sys.OrderService.GetOrders2");
        var reqData = ws.FinishWrite();
        MessageWriteStream.Return(ws);

        var rs = MessageReadStream.Rent(reqData.First!);
        rs.ReadByte(); //MsgType
        rs.ReadInt(); //MsgId
        var service = rs.ReadString();

        // var args = InvokeArgs.From(rs);
        // args.GetObject();
        Assert.Throws<SerializationException>(() => rs.Deserialize());

        MessageReadStream.Return(rs);
    }
}