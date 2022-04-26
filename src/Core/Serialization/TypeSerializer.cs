namespace AppBoxCore;

/// <summary>
/// 类型的二进制序列化实现
/// </summary>
public abstract class TypeSerializer
{
    /// <summary>
    /// 用于实体DataField成员不写入附加范型信息
    /// </summary>
    private readonly bool _notWriteAttachInfo = false;

    public readonly PayloadType PayloadType;

    /// <summary>
    /// 对应的类型，范型为对应的GenericTypeDefinition
    /// </summary>
    public readonly Type TargetType;

    /// <summary>
    /// 范型类型的范型参数个数
    /// </summary>
    public readonly int GenericTypeCount;

    // private ExtKnownTypeID extKnownTypeID;

    // /// <summary>
    // /// 扩展类型的标识
    // /// </summary>
    // /// <value>The ext known type identifier.</value>
    // public ExtKnownTypeID ExtKnownTypeID
    // {
    //     get { return extKnownTypeID; }
    // }

    /// <summary>
    /// 引用类型的实例构造器，数组及范型类型除外
    /// </summary>
    public Func<object>? Creator { get; private set; }

    /// <summary>
    /// 系统已知类型序列化实现构造
    /// </summary>
    public TypeSerializer(PayloadType payloadType, Type sysType, Func<object>? creator = null,
        bool notWriteAttachInfo = false)
    {
        if (payloadType == PayloadType.ExtKnownType)
            throw new ArgumentException("payloadType can not be ExtKnownType", nameof(payloadType));

        this._notWriteAttachInfo = notWriteAttachInfo;
        PayloadType = payloadType;
        TargetType = sysType;
        Creator = creator;

        if (sysType.IsGenericType && !notWriteAttachInfo)
        {
            if (!sysType.IsGenericTypeDefinition)
                throw new ArgumentException("targetType must be a GenericTypeDefinition",
                    nameof(sysType));
            GenericTypeCount = sysType.GetGenericArguments().Length;
        }
        else
        {
            GenericTypeCount = 0;
        }
    }

    // /// <summary>
    // /// 扩展已知类型序列化实现构造
    // /// </summary>
    // public TypeSerializer(Type extType, uint assemblyID, uint typeID, Func<Object> creator = null)
    // {
    //     this.PayloadType = PayloadType.ExtKnownType;
    //     this.TargetType = extType;
    //     this.Creator = creator;
    //     this.extKnownTypeID.AssemblyID = assemblyID;
    //     this.extKnownTypeID.TypeID = typeID;
    //
    //     if (extType.IsGenericType)
    //     {
    //         if (!extType.IsGenericTypeDefinition)
    //             throw new ArgumentException("targetType must be a GenericTypeDefinition",
    //                 nameof(extType));
    //         this.GenericTypeCount = extType.GetGenericArguments().Length;
    //     }
    //     else
    //     {
    //         this.GenericTypeCount = 0;
    //     }
    // }

    /// <summary>
    /// Write data to BinSerializaer
    /// </summary>
    /// <param name="bs">Bs.</param>
    /// <param name="instance">None null instance</param>
    public abstract void Write(IOutputStream bs, object instance);

    /// <summary>
    /// 1.用于非范型值类型的反序列化，由实现自行创建实例
    /// 2.用于引用类型及范型值类型的反序列化，由序列化器创建实例
    /// </summary>
    /// <param name="bs">Bs.</param>
    /// <param name="instance">用于引用类型及范型值类型的反序列化，由序列化器创建的实例</param>
    public abstract object? Read(IInputStream bs, object instance);

    internal void WriteAttachTypeInfo(IOutputStream bs, Type type)
    {
        if (_notWriteAttachInfo)
            return;

        throw new NotImplementedException("TypeSerializer.WriteAttachTypeInfo");

        // if (this.PayloadType == PayloadType.Array)
        // {
        //     Type elementType = type.GetElementType();
        //     bs.WriteType(elementType);
        // }
        // else
        // {
        //     if (this.PayloadType == PayloadType.ExtKnownType) //扩展类型先写入扩展类型标识
        //     {
        //         VariantHelper.WriteUInt32(this.extKnownTypeID.AssemblyID, bs.Stream);
        //         VariantHelper.WriteUInt32(this.extKnownTypeID.TypeID, bs.Stream);
        //     }
        //
        //     //再判断是否范型，是则写入范型各参数的类型信息
        //     if (this.GenericTypeCount > 0)
        //     {
        //         var genericTypes = type.GetGenericArguments();
        //         for (int i = 0; i < genericTypes.Length; i++)
        //         {
        //             bs.WriteType(genericTypes[i]);
        //         }
        //     }
        // }
    }

    #region ====Static Methods====

    static TypeSerializer()
    {
        RegisterKnownType(new StringSerializer());
    }

    private static readonly Dictionary<Type, TypeSerializer> KnownTypes = new(256);

    private static readonly Dictionary<PayloadType, TypeSerializer> SysKnownTypesIndexer = new(256);

    /// <summary>
    /// 注册已知类型的序列化器
    /// </summary>
    public static void RegisterKnownType(TypeSerializer serializer)
    {
        if (KnownTypes.ContainsKey(serializer.TargetType))
            throw new ArgumentException("Already exists type: " + serializer.TargetType.FullName);

        KnownTypes.Add(serializer.TargetType, serializer);
        if (serializer.PayloadType == PayloadType.ExtKnownType)
            throw
                new NotImplementedException(); //extKnownTypesIndexer.Add(serializer.ExtKnownTypeID, serializer);
        else
            SysKnownTypesIndexer.Add(serializer.PayloadType, serializer);
    }

    /// <summary>
    /// 序列化时根据目标类型获取相应的序列化实现
    /// </summary>
    public static TypeSerializer? GetSerializer(Type type)
    {
        TypeSerializer? serializer = null;
        var targetType = type;

        if (type.IsGenericType)
        {
            //注意：先尝试直接获取
            if (KnownTypes.TryGetValue(targetType, out serializer))
                return serializer;
            targetType = type.GetGenericTypeDefinition();
        }
        else if (type.IsArray)
            targetType = type.BaseType!;

        KnownTypes.TryGetValue(targetType, out serializer);
        return serializer;
    }

    /// <summary>
    /// 反序列化时根据PayloadType获取相应的系统已知类型的序列化实现
    /// </summary>
    public static TypeSerializer? GetSerializer(PayloadType payloadType)
    {
        if (payloadType == PayloadType.ExtKnownType)
            throw new InvalidOperationException();

        return SysKnownTypesIndexer[payloadType];
    }

    #endregion
}