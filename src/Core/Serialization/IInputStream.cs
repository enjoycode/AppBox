using AppBoxCore.Utils;

namespace AppBoxCore;

public interface IInputStream
{
    byte ReadByte();

    void ReadBytes(Span<byte> dest);
}

public static class InputStreamExtensions
{
    public static bool ReadBool(this IInputStream s)
        => s.ReadByte() == (byte)PayloadType.BooleanTrue;

    public static int ReadInt(this IInputStream s)
    {
        var res = 0;
        unsafe
        {
            var span = new Span<byte>(&res, 4);
            s.ReadBytes(span);
        }

        return res;
    }

    public static uint ReadNativeVariant(this IInputStream s)
    {
        var data = (uint)s.ReadByte();
        if ((data & 0x80) != 0)
        {
            data &= 0x7F;
            var num2 = (uint)s.ReadByte();
            data |= ((num2 & 0x7F) << 7);
            if ((num2 & 0x80) == 0)
                return data;

            num2 = s.ReadByte();
            data |= ((num2 & 0x7F) << 14);
            if ((num2 & 0x80) == 0)
                return data;

            num2 = s.ReadByte();
            data |= ((num2 & 0x7F) << 0x15);
            if ((num2 & 0x80) == 0)
                return data;

            num2 = s.ReadByte();
            data |= num2 << 0x1C;
            if ((num2 & 240) != 0)
                throw new SerializationException(SerializationError.ReadVariantOutOfRange);
        }

        return data;
    }

    public static int ReadVariant(this IInputStream s)
    {
        var temp = (int)s.ReadNativeVariant();
        return -(temp & 1) ^ ((temp >> 1) & 0x7fffffff);
    }

    public static int ReadFieldId(this IInputStream s) => s.ReadVariant();

    public static string? ReadString(this IInputStream s)
    {
        var len = s.ReadVariant();
        return len switch
        {
            -1 => null,
            0 => string.Empty,
            _ => StringUtil.ReadFrom(len, s.ReadByte)
        };
    }
}