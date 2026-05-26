namespace AppBoxCore;

public interface IInputStream : IEntityMemberReader
{
    DeserializeContext Context { get; }

    byte ReadByte();

    void ReadBytes(Span<byte> dest);

    bool HasRemaining { get; } //TODO: change to Remaining

    void Free();
}

public static class InputStreamExtensions
{
    #region ====Read(常规类型)====

    public static bool ReadBool<T>(this ref T s) where T : struct, IInputStream
        => s.ReadByte() == (byte)PayloadType.BooleanTrue;

    public static unsafe char ReadChar<T>(this ref T s) where T : struct, IInputStream
    {
        char res = '\0';
        var span = new Span<byte>(&res, 2);
        s.ReadBytes(span);

        return res;
    }

    public static unsafe short ReadShort<T>(this ref T s) where T : struct, IInputStream
    {
        short res = 0;
        var span = new Span<byte>(&res, 2);
        s.ReadBytes(span);

        return res;
    }

    public static unsafe int ReadInt<T>(this ref T s) where T : struct, IInputStream
    {
        var res = 0;
        var span = new Span<byte>(&res, 4);
        s.ReadBytes(span);

        return res;
    }

    public static unsafe long ReadLong<T>(this ref T s) where T : struct, IInputStream
    {
        long res = 0;
        var span = new Span<byte>(&res, 8);
        s.ReadBytes(span);

        return res;
    }

    public static unsafe float ReadFloat<T>(this ref T s) where T : struct, IInputStream
    {
        float res = 0f;
        var span = new Span<byte>(&res, 4);
        s.ReadBytes(span);

        return res;
    }

    public static unsafe double ReadDouble<T>(this ref T s) where T : struct, IInputStream
    {
        double res = 0;
        var span = new Span<byte>(&res, 8);
        s.ReadBytes(span);

        return res;
    }

    public static DateTime ReadDateTime<T>(this ref T s) where T : struct, IInputStream
    {
        var ticks = s.ReadLong();
        return new DateTime(ticks);
    }

    public static unsafe decimal ReadDecimal<T>(this ref T s) where T : struct, IInputStream
    {
        decimal res = 0;
        var span = new Span<byte>(&res, 16);
        s.ReadBytes(span);

        return res;
    }

    public static unsafe Guid ReadGuid<T>(this ref T s) where T : struct, IInputStream
    {
        var res = Guid.Empty;
        var span = new Span<byte>(&res, 16);
        s.ReadBytes(span);

        return res;
    }

    public static uint ReadNativeVariant<T>(this ref T s) where T : struct, IInputStream
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

    public static int ReadVariant<T>(this ref T s) where T : struct, IInputStream
    {
        var temp = (int)s.ReadNativeVariant();
        return -(temp & 1) ^ ((temp >> 1) & 0x7fffffff);
    }

    public static int ReadFieldId<T>(this ref T s) where T : struct, IInputStream => s.ReadVariant();

    public static string? ReadString<T>(this ref T s) where T : struct, IInputStream
    {
        var len = s.ReadVariant();
        //TODO:限制大小
        return len switch
        {
            -1 => null,
            0 => string.Empty,
            _ => StringUtil.ReadFrom(len, ref s)
        };
    }

    #endregion

    #region ====ReadType====

    public static Type ReadType<T>(this ref T s) where T : struct, IInputStream
    {
        var typeFlag = s.ReadByte();
        switch (typeFlag)
        {
            case 0: //系统已知类型
            {
                var payloadType = (PayloadType)s.ReadByte();
                var serializer = TypeSerializer.GetSerializer(payloadType);
                if (serializer == null)
                    throw new SerializationException(SerializationError.CanNotFindSerializer,
                        payloadType.ToString());
                if (serializer.PayloadType == PayloadType.Array)
                {
                    var elementType = s.ReadType();
                    return elementType.MakeArrayType();
                }

                if (serializer.GenericTypeCount > 0)
                {
                    var genericTypes = new Type[serializer.GenericTypeCount];
                    for (var i = 0; i < serializer.GenericTypeCount; i++)
                    {
                        genericTypes[i] = s.ReadType();
                    }

                    return serializer.TargetType.MakeGenericType(genericTypes);
                }

                return serializer.TargetType;
            }
            case 1:
            {
                throw new NotImplementedException();
                // var extID = ReadExtKnownTypeID();
                // var serializer = GetSerializer(extID);
                // if (serializer == null)
                //     throw new SerializationException(SerializationError.CanNotFindSerializer,
                //         extID.ToString());
                // if (serializer.GenericTypeCount > 0)
                // {
                //     var genericTypes = new Type[serializer.GenericTypeCount];
                //     for (int i = 0; i < serializer.GenericTypeCount; i++)
                //     {
                //         genericTypes[i] = ReadType();
                //     }
                //
                //     return serializer.TargetType.MakeGenericType(genericTypes);
                // }
                //
                // return serializer.TargetType;
            }
            case 2:
                return typeof(object);
            case 3:
            {
                var modelId = s.ReadLong();
                return modelId == 0 ? typeof(Entity) : s.Context.GetEntityType(modelId);
            }
            default:
                throw new SerializationException(SerializationError.UnknownTypeFlag, typeFlag.ToString());
        }
    }

    #endregion

    #region ====ReadCollection====

    public static void ReadCollection<T, TValue>(this ref T s, ICollection<TValue> collection)
        where T : struct, IInputStream where TValue : IBinSerializable, new()
    {
        var count = s.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var obj = new TValue();
            obj.ReadFrom(ref s);
            collection.Add(obj);
        }
    }

    public static void ReadCollection<T>(this ref T s, Type elementType, int count,
        Action<int, object?> elementSetter) where T : struct, IInputStream
    {
        if (count == 0) return;

        var serializer = TypeSerializer.GetSerializer(elementType);
        var isRefObject = elementType.IsClass && elementType != typeof(string);
        if (serializer == null || isRefObject) //元素为引用类型
        {
            for (var i = 0; i < count; i++)
            {
                elementSetter(i, s.Deserialize());
            }
        }
        else //元素为值类型包括string
        {
            if (serializer.GenericTypeCount > 0) //范型值类型
            {
                for (var i = 0; i < count; i++)
                {
                    var element = Activator.CreateInstance(elementType);
                    serializer.Read(ref s, element);
                    elementSetter(i, element);
                }
            }
            else if (serializer.Creator != null) //带有构造器的值类型
            {
                for (var i = 0; i < count; i++)
                {
                    var element = serializer.Creator();
                    serializer.Read(ref s, element);
                    elementSetter(i, element);
                }
            }
            else //其他值类型
            {
                for (var i = 0; i < count; i++)
                {
                    elementSetter(i, serializer.Read(ref s, null));
                }
            }
        }
    }

    #endregion

    #region ====EntityMemberReader====

    private static void ReadExpectType<T>(this ref T s, PayloadType expected) where T : struct, IInputStream
    {
        var readType = (PayloadType)s.ReadByte();
        if (readType != expected)
            throw new SerializationException(SerializationError.PayloadTypeNotMatch);
    }

    public static string ReadEntityStringMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.String);
        return flags == 0 ? s.ReadString()! : throw new NotImplementedException();
    }

    public static bool ReadEntityBoolMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        return flags == 0 ? s.ReadBool() : throw new NotImplementedException();
    }

    public static byte ReadEntityByteMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Byte);
        return flags == 0 ? s.ReadByte() : throw new NotImplementedException();
    }

    public static int ReadEntityIntMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Int32);
        return flags == 0 ? s.ReadInt() : throw new NotImplementedException();
    }

    public static long ReadEntityLongMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Int64);
        return flags == 0 ? s.ReadLong() : throw new NotImplementedException();
    }

    public static float ReadEntityFloatMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Float);
        return flags == 0 ? s.ReadFloat() : throw new NotImplementedException();
    }

    public static double ReadEntityDoubleMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Double);
        return flags == 0 ? s.ReadDouble() : throw new NotImplementedException();
    }

    public static decimal ReadEntityDecimalMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Decimal);
        return flags == 0 ? s.ReadDecimal() : throw new NotImplementedException();
    }

    public static DateTime ReadEntityDateTimeMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.DateTime);
        return flags == 0 ? s.ReadDateTime() : throw new NotImplementedException();
    }

    public static Guid ReadEntityGuidMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        s.ReadExpectType(PayloadType.Guid);
        return flags == 0 ? s.ReadGuid() : throw new NotImplementedException();
    }

    public static byte[] ReadEntityBinaryMember<T>(this ref T s, int flags) where T : struct, IInputStream
    {
        if (flags == 0)
            return (byte[])s.Deserialize()!;

        throw new NotImplementedException();
    }

    public static TValue ReadEntityRefMember<T, TValue>(this ref T s, int flags, Func<TValue>? creator)
        where T : struct, IInputStream where TValue : Entity
    {
        return s.DeserializeEntity(creator)!;
    }

    public static void ReadEntitySetMember<T, TValue>(this ref T s, int flags, EntitySet<TValue> entitySet)
        where T : struct, IInputStream where TValue : Entity, new()
    {
        s.ReadExpectType(PayloadType.EntitySet);
        ((IBinSerializable)entitySet).ReadFrom(ref s);
    }

    #endregion

    #region ====Deserialize====

    public static object? Deserialize<T>(this ref T s) where T : struct, IInputStream
    {
        var payloadType = (PayloadType)s.ReadByte();
        return s.ReadObject(payloadType);
    }

    internal static object? ReadObject<T>(this ref T s, PayloadType payloadType) where T : struct, IInputStream
    {
        switch (payloadType)
        {
            case PayloadType.Null: return null;
            case PayloadType.BooleanTrue: return true;
            case PayloadType.BooleanFalse: return false;
            case PayloadType.ObjectRef: return s.Context.GetDeserialized(s.ReadVariant());
            case PayloadType.Entity: return s.ReadEntity<T, Entity>(null);
            case PayloadType.Expression: return s.ReadExpression();
        }

        TypeSerializer? serializer;
        if (payloadType == PayloadType.ExtKnownType)
            throw new NotImplementedException();
        else
            serializer = TypeSerializer.GetSerializer(payloadType);
        if (serializer == null)
            throw new SerializationException(SerializationError.CanNotFindSerializer, payloadType.ToString());

        //读取附加类型信息并创建实例
        if (serializer.Creator == null &&
            payloadType != PayloadType.Array && //非数组类型
            serializer.GenericTypeCount <= 0) //非范型类型
        {
            return serializer.Read(ref s, null);
        }

        //其他需要创建实例的类型
        object result;
        if (payloadType == PayloadType.Array) //数组实例创建
        {
            var elementType = s.ReadType();
            var elementCount = s.ReadVariant();
            result = Array.CreateInstance(elementType, elementCount);
        }
        else if (serializer.GenericTypeCount > 0) //范型类型实例创建
        {
            var genericTypes = new Type[serializer.GenericTypeCount];
            for (var i = 0; i < serializer.GenericTypeCount; i++)
            {
                genericTypes[i] = s.ReadType();
            }

            var type = serializer.TargetType.MakeGenericType(genericTypes);
            result = Activator.CreateInstance(type)!;
        }
        else
        {
            result = serializer.Creator!.Invoke();
        }

        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
            s.Context.AddToDeserialized(result); //引用类型加入已序列化列表

        //读取数据
        serializer.Read(ref s, result);
        return result;
    }

    internal static TValue? DeserializeEntity<T, TValue>(this ref T s, Func<TValue>? creator)
        where T : struct, IInputStream where TValue : Entity
    {
        var payloadType = (PayloadType)s.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.ObjectRef => (TValue)s.Context.GetDeserialized(s.ReadVariant()),
            PayloadType.Entity => s.ReadEntity(creator),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    private static TValue ReadEntity<T, TValue>(this ref T s, Func<TValue>? creator)
        where T : struct, IInputStream where TValue : Entity
    {
        var modelId = s.ReadLong();
        var entity = creator != null ? creator() : s.Context.MakeEntity(modelId);
        s.Context.AddToDeserialized(entity);
        entity.ReadFrom(ref s);
        return (TValue)entity;
    }

    private static Expression ReadExpression<T>(this ref T s) where T : struct, IInputStream
    {
        var expType = (ExpressionType)s.ReadByte();
        switch (expType)
        {
            //特殊处理EntityPath表达式
            case ExpressionType.EntityExpression:
                return EntityExpression.Read(ref s);
            case ExpressionType.EntityFieldExpression:
                return EntityFieldExpression.Read(ref s);
            default:
                var exp = ExpressionFactory.Make(expType);
                s.Context.AddToDeserialized(exp);
                exp.ReadFrom(ref s);
                return exp;
        }
    }

    #endregion
}