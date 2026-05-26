using System.Buffers;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace AppBoxCore;

public interface IOutputStream : IEntityMemberWriter
{
    public SerializeContext Context { get; }

    void WriteByte(byte value);

    void WriteBytes(ReadOnlySpan<byte> src);
}

public static class OutputStreamExtensions
{
    #region ====Write(常规类型)====

    public static void WriteBool<T>(this ref T s, bool value) where T : struct, IOutputStream
        => s.WriteByte(value ? (byte)PayloadType.BooleanTrue : (byte)PayloadType.BooleanFalse);

    public static unsafe void WriteChar<T>(this ref T s, char value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 2);
        s.WriteBytes(span);
    }

    public static unsafe void WriteShort<T>(this ref T s, short value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 2);
        s.WriteBytes(span);
    }

    public static unsafe void WriteInt<T>(this ref T s, int value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 4);
        s.WriteBytes(span);
    }

    public static unsafe void WriteLong<T>(this ref T s, long value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 8);
        s.WriteBytes(span);
    }

    public static unsafe void WriteFloat<T>(this ref T s, float value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 4);
        s.WriteBytes(span);
    }

    public static unsafe void WriteDouble<T>(this ref T s, double value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 8);
        s.WriteBytes(span);
    }

    public static void WriteDateTime<T>(this ref T s, DateTime value) where T : struct, IOutputStream
    {
        s.WriteLong(value.Ticks);
    }

    public static unsafe void WriteDecimal<T>(this ref T s, decimal value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 16);
        s.WriteBytes(span);
    }

    public static unsafe void WriteGuid<T>(this ref T s, Guid value) where T : struct, IOutputStream
    {
        var span = new Span<byte>(&value, 16);
        s.WriteBytes(span);
    }

    public static void WriteNativeVariant<T>(this ref T s, uint value) where T : struct, IOutputStream
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

    public static void WriteVariant<T>(this ref T s, int value) where T : struct, IOutputStream
    {
        var num = (uint)((value << 1) ^ (value >> 0x1F));
        s.WriteNativeVariant(num);
    }

    /// <summary>
    /// 写入带长度信息且Utf8编码的字符串
    /// </summary>
    public static void WriteString<T>(this ref T s, string? value) where T : struct, IOutputStream
    {
        if (value == null) s.WriteVariant(-1);
        else if (value.Length == 0) s.WriteVariant(0);
        else
        {
            s.WriteVariant(value.Length); //注意非编码后的字节数量
            StringUtil.WriteTo(value, ref s);
        }
    }

    #endregion

    #region ====Write(实现了IBinSerializable的对象)

    public static void Write<T, TValue>(this ref T s, TValue obj)
        where TValue : IBinSerializable where T : struct, IOutputStream
        => obj.WriteTo(ref s);

    #endregion

    #region ====WriteType====

    public static void WriteType<T>(this ref T s, Type type) where T : struct, IOutputStream
    {
        //TypeFlag定义： 0=系统已知类型; 1=扩展已知类型; 2=Object; 3=Entity
        if (type == typeof(object))
        {
            s.WriteByte(2);
        }
        else if (type == typeof(Entity) || type.IsSubclassOf(typeof(Entity)))
        {
            s.WriteByte(3);
            //再写入模型标识, TODO:暂使用反射，考虑只写入ModelId = 0，另编译并缓存表达式
            var staticModelIdProp = type.GetProperty("MODELID", BindingFlags.Static | BindingFlags.Public);
            s.WriteLong(staticModelIdProp == null ? 0 : (long)staticModelIdProp.GetValue(null)!);
        }
        else
        {
            var serializer = TypeSerializer.GetSerializer(type);
            if (serializer == null)
            {
                // Log.Error("未能找到序列化实现 类型:" + type.FullName);
                throw new SerializationException(SerializationError.CanNotFindSerializer, type.FullName);
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
            serializer.WriteAttachTypeInfo(ref s, type);
        }
    }

    #endregion

    #region ====WriteCollection====

    public static void WriteCollection<T, TValue>(this ref T s, IList<TValue> collection)
        where TValue : IBinSerializable where T : struct, IOutputStream
    {
        s.WriteVariant(collection.Count);
        for (var i = 0; i < collection.Count; i++)
        {
            collection[i].WriteTo(ref s);
        }
    }

    public static void WriteCollection<T>(this ref T s, Type elementType, int count,
        Func<int, object?> elementGetter) where T : struct, IOutputStream
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
                serializer.Write(ref s, elementGetter(i)!);
            }
        }
    }

    #endregion

    #region ====Write(字段标识)====

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void WriteFieldId<T>(this ref T s, int fieldId) where T : struct, IOutputStream =>
        s.WriteVariant(fieldId);

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void WriteFieldEnd<T>(this ref T s) where T : struct, IOutputStream => s.WriteVariant(0);

    #endregion

    #region ====WriteStream====

    public static void WriteStream<T>(this ref T s, Stream stream) where T : struct, IOutputStream
    {
        var buffer = ArrayPool<byte>.Shared.Rent(4096);
        try
        {
            int bytesRead;
            while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) != 0)
            {
                s.WriteBytes(buffer.AsSpan(0, bytesRead));
            }
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }

    #endregion

    #region ====Serialize(写入类型)====

    /// <summary>
    /// 检查是否已经序列化过，是则写入ObjectRef信息
    /// </summary>
    private static bool CheckSerialized<T>(ref T s, object obj) where T : struct, IOutputStream
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

    public static void Serialize<T>(this ref T s, object? value) where T : struct, IOutputStream
    {
        switch (value)
        {
            case null:
                s.WriteByte((byte)PayloadType.Null);
                return;
            case bool boolValue:
                s.WriteByte(boolValue ? (byte)PayloadType.BooleanTrue : (byte)PayloadType.BooleanFalse);
                return;
            case Entity entity:
                s.Serialize(entity);
                return;
            case Expression expression:
                s.SerializeExpression(expression);
                return;
        }

        var type = value.GetType();
        var serializer = TypeSerializer.GetSerializer(type);
        if (serializer == null)
        {
            // Log.Error($"Can't find serializer for: {type.FullName}");
            throw new SerializationException(SerializationError.CanNotFindSerializer, type.FullName);
        }

        //检查是否已经序列化过
        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
        {
            if (CheckSerialized(ref s, value))
                return;
        }

        //写入类型信息
        s.WriteByte((byte)serializer.PayloadType);
        //写入附加类型信息
        serializer.WriteAttachTypeInfo(ref s, type);
        //判断是否引用类型，是则加入已序列化对象列表
        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
            s.Context.AddToSerialized(value);
        //写入数据
        serializer.Write(ref s, value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, in AnyValue value) where T : struct, IOutputStream =>
        value.SerializeTo(ref s);

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, byte value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Byte);
        s.WriteByte(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, char value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Char);
        s.WriteChar(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, short value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Int16);
        s.WriteShort(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, int value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Int32);
        s.WriteInt(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, long value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Int64);
        s.WriteLong(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, float value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Float);
        s.WriteFloat(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, double value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Double);
        s.WriteDouble(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, decimal value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Decimal);
        s.WriteDecimal(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, DateTime value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.DateTime);
        s.WriteDateTime(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, Guid value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.Guid);
        s.WriteGuid(value);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static void Serialize<T>(this ref T s, string value) where T : struct, IOutputStream
    {
        s.WriteByte((byte)PayloadType.String);
        s.WriteString(value);
    }

    public static void Serialize<T>(this ref T s, Entity? value) where T : struct, IOutputStream
    {
        if (value == null)
        {
            s.WriteByte((byte)PayloadType.Null);
            return;
        }

        if (CheckSerialized(ref s, value)) return;

        s.Context.AddToSerialized(value);
        s.WriteByte((byte)PayloadType.Entity);
        s.WriteLong(value.ModelId);
        ((IBinSerializable)value).WriteTo(ref s);
    }

    // 因表达式隐式转换问题，所以不能重载Serialize方法
    public static void SerializeExpression<T>(this ref T s, Expression? value) where T : struct, IOutputStream
    {
        if (Expression.IsNull(value))
        {
            s.WriteByte((byte)PayloadType.Null);
            return;
        }

        //特殊处理非Root的EntityPathExpression,不用加入已序列化列表
        if (value is not IEntityPathExpression entityPath || Expression.IsNull(entityPath.Owner))
        {
            if (CheckSerialized(ref s, value!)) return;
            s.Context.AddToSerialized(value!);
        }

        s.WriteByte((byte)PayloadType.Expression);
        s.WriteByte((byte)value!.NodeType);
        value.WriteTo(ref s);
    }

    #endregion

    #region ====EntityMemberWriter====

    public static void WriteEntityStringMember<T>(this ref T w, short id, string? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityBoolMember<T>(this ref T w, short id, bool? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.WriteBool(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityByteMember<T>(this ref T w, short id, byte? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityIntMember<T>(this ref T w, short id, int? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityLongMember<T>(this ref T w, short id, long? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityFloatMember<T>(this ref T w, short id, float? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityDoubleMember<T>(this ref T w, short id, double? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityDecimalMember<T>(this ref T w, short id, decimal? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityDateTimeMember<T>(this ref T w, short id, DateTime? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityGuidMember<T>(this ref T w, short id, Guid? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value.Value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityBinaryMember<T>(this ref T w, short id, byte[]? value, int flags)
        where T : struct, IOutputStream
    {
        var forStore = (flags & EntityMemberWriteFlags.Store) == EntityMemberWriteFlags.Store;
        if (!forStore)
        {
            if (value == null) return;

            w.WriteShort(id);
            w.Serialize(value);
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    public static void WriteEntityRefMember<T>(this ref T w, short id, Entity? value, int flags)
        where T : struct, IOutputStream
    {
        if (flags != EntityMemberWriteFlags.None) return; //存储或忽略导航属性不需要写入
        if (value == null) return;

        w.WriteShort(id);
        w.Serialize(value);
    }

    public static void WriteEntitySetMember<T, TValue>(this ref T w, short id, EntitySet<TValue>? value, int flags)
        where T : struct, IOutputStream where TValue : Entity, new()
    {
        if (flags != EntityMemberWriteFlags.None) return; //存储或忽略导航属性不需要写入
        if (value == null) return;

        w.WriteShort(id);
        w.WriteByte((byte)PayloadType.EntitySet);
        ((IBinSerializable)value).WriteTo(ref w);
    }

    #endregion

    public static void CopyTo<T>(this Stream source, ref T dest) where T : struct, IOutputStream
    {
        var buffer = new byte[1024];
        while (true)
        {
            var readBytes = source.Read(buffer);
            if (readBytes <= 0)
                break;

            dest.WriteBytes(buffer.AsSpan(0, readBytes));
        }
    }
}