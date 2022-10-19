using System.Reflection;

namespace AppBoxCore;

public interface IOutputStream : IEntityMemberWriter
{
    public SerializeContext Context { get; }

    void WriteByte(byte value);

    void WriteBytes(Span<byte> src);

    #region ====IEntityMemberWriter====

    void IEntityMemberWriter.WriteStringMember(short id, string? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteString(value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteBoolMember(short id, bool? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteBool(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteByteMember(short id, byte? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            WriteByte(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteIntMember(short id, int? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteInt(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteLongMember(short id, long? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteLong(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteDateTimeMember(short id, DateTime? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteDateTime(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteGuidMember(short id, Guid? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteGuid(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteBinaryMember(short id, byte[]? value, int flags)
    {
        if (flags == EntityMemberWriteFlags.None)
        {
            if (value == null) return;

            this.WriteShort(id);
            this.WriteVariant(value.Length);
            WriteBytes(value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    void IEntityMemberWriter.WriteEntityRefMember(short id, Entity? value, int flags)
    {
        if (flags != EntityMemberWriteFlags.None) return; //存储不需要写入
        if (value == null) return;

        this.WriteShort(id);
        this.Serialize(value);
    }

    void IEntityMemberWriter.WriteEntitySetMember<T>(short id, IList<T>? value, int flags)
    {
        if (flags != EntityMemberWriteFlags.None) return; //存储不需要写入
        if (value == null) return;

        this.WriteShort(id);
        this.WriteVariant(value.Count);
        foreach (var entity in value)
        {
            this.Serialize(entity);
        }
    }

    #endregion
}

public static class OutputStreamExtensions
{
    #region ====Write(常规类型)====

    public static void WriteBool(this IOutputStream s, bool value)
        => s.WriteByte(value ? (byte)PayloadType.BooleanTrue : (byte)PayloadType.BooleanFalse);

    public static void WriteShort(this IOutputStream s, short value)
    {
        unsafe
        {
            var span = new Span<byte>(&value, 2);
            s.WriteBytes(span);
        }
    }

    public static void WriteInt(this IOutputStream s, int value)
    {
        unsafe
        {
            var span = new Span<byte>(&value, 4);
            s.WriteBytes(span);
        }
    }

    public static void WriteLong(this IOutputStream s, long value)
    {
        unsafe
        {
            var span = new Span<byte>(&value, 8);
            s.WriteBytes(span);
        }
    }

    public static void WriteDateTime(this IOutputStream s, DateTime value)
    {
        s.WriteLong(value.Ticks);
    }

    public static void WriteGuid(this IOutputStream s, Guid value)
    {
        unsafe
        {
            var span = new Span<byte>(&value, 16);
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

    #endregion

    #region ====Write(实现了IBinSerializable的对象)

    public static void Write<T>(this IOutputStream s, T obj) where T : IBinSerializable
        => obj.WriteTo(s);

    #endregion

    #region ====WriteType====

    public static void WriteType(this IOutputStream s, Type type)
    {
        //TypeFlag定义： 0 = 系统已知类型 1 = 扩展已知类型 2 = Object, 3=Entity
        if (type == typeof(object))
        {
            s.WriteByte(2);
        }
        else if (type == typeof(Entity) || type.IsSubclassOf(typeof(Entity)))
        {
            s.WriteByte(3);
            //再写入模型标识, TODO:待C#11 直接用ModelId静态接口
            //https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/static-abstract-interface-methods
            var modelIdAttr = type.GetCustomAttribute(typeof(EntityModelIdAttribute));
            s.WriteLong(modelIdAttr == null ? 0 : ((EntityModelIdAttribute)modelIdAttr).Id);
        }
        else
        {
            var serializer = TypeSerializer.GetSerializer(type);
            if (serializer == null)
            {
                Log.Error("未能找到序列化实现 类型:" + type.FullName);
                throw new SerializationException(SerializationError.CanNotFindSerializer,
                    type.FullName);
            }

            if (serializer.PayloadType == PayloadType.ExtKnownType)
            {
                s.WriteByte(1);
            }
            else
            {
                s.WriteByte(0);
                s.WriteByte((byte)serializer.PayloadType);
            }

            //写入附加类型信息
            serializer.WriteAttachTypeInfo(s, type);
        }
    }

    #endregion

    #region ====WriteCollection====

    public static void WriteCollection(this IOutputStream s, Type elementType, int count,
        Func<int, object> elementGetter)
    {
        if (count == 0) return;

        var serializer = TypeSerializer.GetSerializer(elementType);
        var isRefObject = elementType.IsClass && elementType != typeof(string);
        if (serializer == null || isRefObject)
        {
            for (var i = 0; i < count; i++)
            {
                s.Serialize(elementGetter(i));
            }
        }
        else //值类型包括string
        {
            for (var i = 0; i < count; i++)
            {
                serializer.Write(s, elementGetter(i));
            }
        }
    }

    #endregion

    #region ====Write(字段标识)====

    public static IOutputStream WriteFieldId(this IOutputStream s, int fieldId)
    {
        s.WriteVariant(fieldId);
        return s;
    }

    public static void WriteFieldEnd(this IOutputStream s) => s.WriteVariant(0);

    #endregion

    #region ====Serialize(写入类型)====

    /// <summary>
    /// 检查是否已经序列化过，是则写入ObjectRef信息
    /// </summary>
    private static bool CheckSerialized(IOutputStream s, object obj)
    {
        var index = s.Context.GetSerializedIndex(obj);
        if (index == -1)
        {
            //不要在这里AddToSerialized(obj);
            return false;
        }

        s.WriteByte((byte)PayloadType.ObjectRef);
        s.WriteVariant(index);
        return true;
    }

    public static void Serialize(this IOutputStream s, object? value)
    {
        if (value == null)
        {
            s.WriteByte((byte)PayloadType.Null);
            return;
        }

        if (value is bool boolValue)
        {
            s.WriteByte(boolValue ? (byte)PayloadType.BooleanTrue : (byte)PayloadType.BooleanFalse);
            return;
        }
        else if (value is Entity entity)
        {
            s.Serialize(entity);
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
            if (CheckSerialized(s, value))
                return;
        }

        //写入类型信息
        s.WriteByte((byte)serializer.PayloadType);
        //写入附加类型信息
        serializer.WriteAttachTypeInfo(s, type);
        //判断是否引用类型，是则加入已序列化对象列表
        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
            s.Context.AddToSerialized(value);
        //写入数据
        serializer.Write(s, value);
    }

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

    public static void Serialize(this IOutputStream s, Entity? value)
    {
        if (value == null)
        {
            s.WriteByte((byte)PayloadType.Null);
            return;
        }

        if (CheckSerialized(s, value)) return;

        s.Context.AddToSerialized(value);
        s.WriteByte((byte)PayloadType.Entity);
        s.WriteLong(value.ModelId);
        ((IBinSerializable)value).WriteTo(s);
    }

    #endregion
}