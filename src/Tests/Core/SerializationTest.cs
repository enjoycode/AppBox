using AppBoxCore;
using AppBoxCore.Utils;
using NUnit.Framework;

namespace Tests.Core;

public sealed class SerializationTest
{
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

        var reader = MessageReadStream.RentFrom(segment.First!);
        Assert.True(reader.ReadBool() == true);
        Assert.True(reader.ReadInt() == 1234);
        Assert.True(reader.ReadVariant() == 5678);
        Assert.True(reader.ReadString() == src);
        MessageReadStream.Return(reader);
    }
}