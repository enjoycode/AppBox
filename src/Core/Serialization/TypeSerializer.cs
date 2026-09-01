namespace AppBoxCore;

/// <summary>
/// 类型的二进制序列化实现
/// </summary>
public abstract class TypeSerializer
{
    /// <summary>
    /// 系统已知类型序列化实现构造
    /// </summary>
    protected TypeSerializer(PayloadType payloadType, Type sysType, Func<object>? creator = null,
        bool notWriteAttachInfo = false)
    {
        if (payloadType == PayloadType.ExtKnownType)
            throw new ArgumentException("payloadType can not be ExtKnownType", nameof(payloadType));

        _notWriteAttachInfo = notWriteAttachInfo;
        PayloadType = payloadType;
        TargetType = sysType;
        Creator = creator;
        ExtKnownTypeId = ExtKnownTypeId.Empty;

        if (sysType.IsGenericType && !notWriteAttachInfo)
        {
            if (!sysType.IsGenericTypeDefinition)
                throw new ArgumentException("targetType must be a GenericTypeDefinition", nameof(sysType));
            GenericTypeCount = sysType.GetGenericArguments().Length;
        }
        else
        {
            GenericTypeCount = 0;
        }
    }

    /// <summary>
    /// 扩展已知类型序列化实现构造
    /// </summary>
    protected TypeSerializer(ExtKnownTypeId extKnownTypeId, Type extType, Func<Object> creator)
    {
        if (extKnownTypeId.IsEmpty) throw new ArgumentException(nameof(extKnownTypeId));

        PayloadType = PayloadType.ExtKnownType;
        ExtKnownTypeId = extKnownTypeId;
        TargetType = extType;
        Creator = creator;

        if (extType.IsGenericType)
        {
            if (!extType.IsGenericTypeDefinition)
                throw new ArgumentException("targetType must be a GenericTypeDefinition", nameof(extType));
            GenericTypeCount = extType.GetGenericArguments().Length;
        }
        else
        {
            GenericTypeCount = 0;
        }
    }

    /// <summary>
    /// 用于实体EntityField成员不写入附加范型信息
    /// </summary>
    private readonly bool _notWriteAttachInfo;

    public readonly PayloadType PayloadType;

    /// <summary>
    /// 对应的类型，范型为对应的GenericTypeDefinition
    /// </summary>
    public readonly Type TargetType;

    /// <summary>
    /// 范型类型的范型参数个数
    /// </summary>
    public readonly int GenericTypeCount;

    /// <summary>
    /// 扩展类型的标识
    /// </summary>
    /// <value>The ext known type identifier.</value>
    public ExtKnownTypeId ExtKnownTypeId { get; }

    /// <summary>
    /// 引用类型的实例构造器，数组及范型类型除外
    /// </summary>
    public Func<object>? Creator { get; private set; }

    /// <summary>
    /// Write data to output stream
    /// </summary>
    /// <param name="bs">Bs.</param>
    /// <param name="instance">None null instance</param>
    public abstract void Write<T>(ref T bs, object instance) where T : struct, IOutputStream;

    /// <summary>
    /// 1.用于非范型值类型的反序列化，由实现自行创建实例
    /// 2.用于引用类型及范型值类型的反序列化，由序列化器创建实例
    /// </summary>
    /// <param name="bs">Bs.</param>
    /// <param name="instance">用于引用类型及范型值类型的反序列化，由序列化器创建的实例</param>
    public abstract object? Read<T>(ref T bs, object? instance) where T : struct, IInputStream;

    /// <summary>
    /// 写入附加类型信息(数组或其他范型类型的范型参数)
    /// </summary>
    internal void WriteAttachTypeInfo<T>(ref T bs, Type type) where T : struct, IOutputStream
    {
        if (_notWriteAttachInfo)
            return;

        if (PayloadType == PayloadType.Array)
        {
            var elementType = type.GetElementType();
            bs.WriteType(elementType!);
        }
        else
        {
            if (PayloadType == PayloadType.ExtKnownType) //扩展类型先写入扩展类型标识
            {
                bs.WriteUShort(ExtKnownTypeId);
            }

            //再判断是否范型，是则写入范型各参数的类型信息
            if (GenericTypeCount > 0)
            {
                var genericTypes = type.GetGenericArguments();
                foreach (var genericType in genericTypes)
                {
                    bs.WriteType(genericType);
                }
            }
        }
    }

    #region ====Static Methods====

    static TypeSerializer()
    {
        //基本类型
        RegisterKnownType(new ByteSerializer());
        RegisterKnownType(new ShortSerializer());
        RegisterKnownType(new IntSerializer());
        RegisterKnownType(new LongSerializer());
        RegisterKnownType(new DateTimeSerializer());
        RegisterKnownType(new GuidSerializer());
        RegisterKnownType(new StringSerializer());
        RegisterKnownType(new BinSerializer(PayloadType.JsonResult, typeof(JsonResult), () => new JsonResult()));
        //Collection
        RegisterKnownType(new ArraySerializer());
        RegisterKnownType(new ListSerializer());
        //运行时类型
        //@formatter:off
        RegisterKnownType(new BinSerializer(PayloadType.PermissionNode, typeof(PermissionNode), () => new PermissionNode()));
        RegisterKnownType(new BinSerializer(PayloadType.DataTable, typeof(DataTable), () => new DataTable()));
        RegisterKnownType(new BinSerializer(PayloadType.DynamicQuery, typeof(DynamicQuery), () => new DynamicQuery()));
        RegisterKnownType(new BinSerializer(PayloadType.PrimaryKeyField, typeof(PrimaryKeyField), () => new PrimaryKeyField()));
        RegisterKnownType(new BinSerializer(PayloadType.WorkflowTaskInfo, typeof(WorkflowTaskInfo), () => new WorkflowTaskInfo()));
        //@formatter:on
    }

    private static readonly Dictionary<Type, TypeSerializer> KnownTypes = new(256);

    private static readonly Dictionary<PayloadType, TypeSerializer> SysKnownTypesIndexer = new(256);
    private static readonly Dictionary<ExtKnownTypeId, TypeSerializer> ExtKnownTypesIndexer = new();

    /// <summary>
    /// 注册已知类型的序列化器
    /// </summary>
    public static void RegisterKnownType(TypeSerializer serializer)
    {
        if (!KnownTypes.TryAdd(serializer.TargetType, serializer))
            throw new ArgumentException("Already exists type: " + serializer.TargetType.FullName);

        if (serializer.PayloadType == PayloadType.ExtKnownType)
            ExtKnownTypesIndexer.Add(serializer.ExtKnownTypeId, serializer);
        else
            SysKnownTypesIndexer.Add(serializer.PayloadType, serializer);
    }

    /// <summary>
    /// 序列化时根据目标类型获取相应的序列化实现
    /// </summary>
    public static TypeSerializer? GetSerializer(Type type)
    {
        TypeSerializer? serializer;
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
    public static TypeSerializer GetSerializer(PayloadType payloadType)
    {
        if (payloadType == PayloadType.ExtKnownType)
            throw new InvalidOperationException();

        return SysKnownTypesIndexer[payloadType];
    }

    /// <summary>
    /// 反序列化时根据ExtKnownTypeID获取相应的扩展已知类型的序列化实现
    /// </summary>
    public static TypeSerializer GetSerializer(ExtKnownTypeId extKnownTypeId)
    {
        return ExtKnownTypesIndexer[extKnownTypeId];
    }

    #endregion
}