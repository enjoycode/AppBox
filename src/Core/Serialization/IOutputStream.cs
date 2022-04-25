using AppBoxCore.Utils;

namespace AppBoxCore;

public interface IOutputStream
{
    void WriteByte(byte value);

    void WriteBytes(Span<byte> src);
}

public static class OutputStreamExtensions
{
    public static void WriteBool(this IOutputStream s, bool value)
        => s.WriteByte(value ? (byte)PayloadType.BooleanTrue : (byte)PayloadType.BooleanFalse);

    public static void WriteInt(this IOutputStream s, int value)
    {
        unsafe
        {
            var span = new Span<byte>(&value, 4);
            s.WriteBytes(span);
        }
    }

    public static void WriteNativeVariant(this IOutputStream s, uint value)
    {
        do
        {
            var temp = (byte)((value & 0x7F) | 0x80);
            if ((value >>= 7) != 0)
                s.WriteByte(temp);
            else
            {
                temp = (byte)(temp & 0x7F);
                s.WriteByte(temp);
                break;
            }
        } while (true);
    }

    public static void WriteVariant(this IOutputStream s, int value)
    {
        var num = (uint)((value << 1) ^ (value >> 0x1F));
        s.WriteNativeVariant(num);
    }

    /// <summary>
    /// 写入带长度信息且Utf8编码的字符串
    /// </summary>
    public static void WriteString(this IOutputStream s, string? value)
    {
        if (value == null) s.WriteVariant(-1);
        else if (value.Length == 0) s.WriteVariant(0);
        else
        {
            s.WriteVariant(value.Length); //注意非编码后的字节数量
            StringUtil.WriteTo(value, s.WriteByte);
        }
    }
}