namespace AppBoxCore;

public interface IInputStream : IEntityMemberReader
{
    DeserializeContext Context { get; }

    byte ReadByte();

    void ReadBytes(Span<byte> dest);

    bool HasRemaning { get; }

    #region ====IEntityMemberReader====

    string IEntityMemberReader.ReadStringMember(int flags)
    {
        if (flags == 0) return this.ReadString()!;

        throw new NotImplementedException();
    }

    bool IEntityMemberReader.ReadBoolMember(int flags)
    {
        if (flags == 0) return this.ReadBool();

        throw new NotImplementedException();
    }

    byte IEntityMemberReader.ReadByteMember(int flags)
    {
        if (flags == 0) return ReadByte();

        throw new NotImplementedException();
    }

    int IEntityMemberReader.ReadIntMember(int flags)
    {
        if (flags == 0) return this.ReadInt();

        throw new NotImplementedException();
    }

    long IEntityMemberReader.ReadLongMember(int flags)
    {
        if (flags == 0) return this.ReadLong();

        throw new NotImplementedException();
    }

    float IEntityMemberReader.ReadFloatMember(int flags)
    {
        if (flags == 0) return this.ReadFloat();

        throw new NotImplementedException();
    }

    double IEntityMemberReader.ReadDoubleMember(int flags)
    {
        if (flags == 0) return this.ReadDouble();

        throw new NotImplementedException();
    }

    DateTime IEntityMemberReader.ReadDateTimeMember(int flags)
    {
        if (flags == 0) return this.ReadDateTime();

        throw new NotImplementedException();
    }

    Guid IEntityMemberReader.ReadGuidMember(int flags)
    {
        if (flags == 0) return this.ReadGuid();

        throw new NotImplementedException();
    }

    byte[] IEntityMemberReader.ReadBinaryMember(int flags)
    {
        if (flags == 0)
        {
            var len = this.ReadVariant();
            var data = new byte[len];
            ReadBytes(data);
            return data;
        }

        throw new NotImplementedException();
    }

    T IEntityMemberReader.ReadEntityRefMember<T>(int flags, Func<T>? creator)
    {
        return this.DeserializeEntity(creator)!;
    }

    void IEntityMemberReader.ReadEntitySetMember<T>(int flags, EntitySet<T> entitySet)
    {
        ((IBinSerializable)entitySet).ReadFrom(this);
    }

    #endregion
}

public static class InputStreamExtensions
{
    #region ====Read(常规类型)====

    public static bool ReadBool(this IInputStream s)
        => s.ReadByte() == (byte)PayloadType.BooleanTrue;

    public static short ReadShort(this IInputStream s)
    {
        short res = 0;
        unsafe
        {
            var span = new Span<byte>(&res, 2);
            s.ReadBytes(span);
        }

        return res;
    }

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

    public static long ReadLong(this IInputStream s)
    {
        long res = 0;
        unsafe
        {
            var span = new Span<byte>(&res, 8);
            s.ReadBytes(span);
        }

        return res;
    }

    public static float ReadFloat(this IInputStream s)
    {
        float res = 0f;
        unsafe
        {
            var span = new Span<byte>(&res, 4);
            s.ReadBytes(span);
        }

        return res;
    }

    public static double ReadDouble(this IInputStream s)
    {
        double res = 0;
        unsafe
        {
            var span = new Span<byte>(&res, 8);
            s.ReadBytes(span);
        }

        return res;
    }

    public static DateTime ReadDateTime(this IInputStream s)
    {
        var ticks = s.ReadLong();
        return new DateTime(ticks);
    }

    public static decimal ReadDecimal(this IInputStream s)
    {
        decimal res = 0;
        unsafe
        {
            var span = new Span<byte>(&res, 16);
            s.ReadBytes(span);
        }

        return res;
    }

    public static Guid ReadGuid(this IInputStream s)
    {
        var res = Guid.Empty;
        unsafe
        {
            var span = new Span<byte>(&res, 16);
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
        //TODO:限制大小
        return len switch
        {
            -1 => null,
            0 => string.Empty,
            _ => StringUtil.ReadFrom(len, s.ReadByte)
        };
    }

    #endregion

    #region ====ReadType====

    public static Type ReadType(this IInputStream s)
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

    public static void ReadCollection(this IInputStream s, Type elementType, int count,
        Action<int, object?> elementSetter)
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
                    serializer.Read(s, element);
                    elementSetter(i, element);
                }
            }
            else if (serializer.Creator != null) //带有构造器的值类型
            {
                for (var i = 0; i < count; i++)
                {
                    var element = serializer.Creator();
                    serializer.Read(s, element);
                    elementSetter(i, element);
                }
            }
            else //其他值类型
            {
                for (var i = 0; i < count; i++)
                {
                    elementSetter(i, serializer.Read(s, null));
                }
            }
        }
    }

    #endregion

    #region ====Deserialize====

    public static object? Deserialize(this IInputStream s)
    {
        var payloadType = (PayloadType)s.ReadByte();
        switch (payloadType)
        {
            case PayloadType.Null: return null;
            case PayloadType.BooleanTrue: return true;
            case PayloadType.BooleanFalse: return false;
            case PayloadType.ObjectRef: return s.Context.GetDeserialized(s.ReadVariant());
            case PayloadType.Entity: return s.ReadEntity<Entity>(null);
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
            return serializer.Read(s, null);
        }

        //其他需要创建实例的类型
        object result = null!;
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
            result = Activator.CreateInstance(type);
        }
        else
        {
            result = serializer.Creator!.Invoke();
        }

        if (serializer.TargetType.IsClass && serializer.TargetType != typeof(string))
            s.Context.AddToDeserialized(result); //引用类型加入已序列化列表

        //读取数据
        serializer.Read(s, result);
        return result;
    }

    internal static T? DeserializeEntity<T>(this IInputStream s, Func<T>? creator) where T : Entity
    {
        var payloadType = (PayloadType)s.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.ObjectRef => (T)s.Context.GetDeserialized(s.ReadVariant()),
            PayloadType.Entity => s.ReadEntity(creator),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    private static T ReadEntity<T>(this IInputStream s, Func<T>? creator) where T : Entity
    {
        var modelId = s.ReadLong();
        var entity = creator != null ? creator() : s.Context.MakeEntity(modelId);
        s.Context.AddToDeserialized(entity);
        ((IBinSerializable)entity).ReadFrom(s);
        return (T)entity;
    }

    private static Expression ReadExpression(this IInputStream s)
    {
        var expType = (ExpressionType)s.ReadByte();
        var exp = ExpressionFactory.Make(expType);
        s.Context.AddToDeserialized(exp);
        exp.ReadFrom(s);
        return exp;
    }

    #endregion
}