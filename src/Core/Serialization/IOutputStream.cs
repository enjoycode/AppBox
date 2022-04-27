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

    public static void Serialize(this IOutputStream s, object? value)
    {
        if (value == null)
        {
            s.WriteByte((byte)PayloadType.Null);
            return;
        }

        var type = value.GetType();
        var serializer = TypeSerializer.GetSerializer(type);
        if (serializer == null)
        {
            Log.Error($"Can't find serializer for: {type.FullName}");
            throw new SerializationException(SerializationError.CanNotFindSerializer,
                type.FullName);
        }

        //检查是否已经序列化过
        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
        {
            throw new NotImplementedException();
            // if (CheckSerialized(obj))
            //     return;
        }

        //写入类型信息
        s.WriteByte((byte)serializer.PayloadType);
        //写入附加类型信息
        serializer.WriteAttachTypeInfo(s, type);
        //判断是否引用类型，是则加入已序列化对象列表
        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
            throw new NotImplementedException(); //AddToObjectRefs(obj);
        //写入数据
        serializer.Write(s, value);
    }

    public static IOutputStream WriteFieldId(this IOutputStream s, int fieldId)
    {
        s.WriteVariant(fieldId);
        return s;
    }

    public static void WriteFieldEnd(this IOutputStream s) => s.WriteVariant(0);

    public static void Serialize(this IOutputStream s, in AnyValue value)
    {
        value.SerializeTo(s);
    }

    public static void Serialize(this IOutputStream s, byte value)
    {
        s.WriteByte((byte)PayloadType.Byte);
        s.WriteByte(value);
    }

    public static void Serialize(this IOutputStream s, int value)
    {
        s.WriteByte((byte)PayloadType.Int32);
        s.WriteInt(value);
    }
}