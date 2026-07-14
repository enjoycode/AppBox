using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 表达式的类型信息，用于解析为运行时类型
/// </summary>
public readonly struct ExpressionTypeInfo
{
    private const byte HasTypesMask = 1 << 5;
    private const byte IsNullableMask = 1 << 6;
    private const byte IsConvertedMask = 1 << 7;
    private const byte KnownTypeMask = 0x1F;

    public static readonly ExpressionTypeInfo Empty = new(KnownType.Empty);
    public static readonly ExpressionTypeInfo Boolean = new(KnownType.Boolean);
    public static readonly ExpressionTypeInfo Byte = new(KnownType.Byte);
    public static readonly ExpressionTypeInfo SByte = new(KnownType.SByte);
    public static readonly ExpressionTypeInfo Char = new(KnownType.Char);
    public static readonly ExpressionTypeInfo Int16 = new(KnownType.Int16);
    public static readonly ExpressionTypeInfo UInt16 = new(KnownType.UInt16);
    public static readonly ExpressionTypeInfo Int32 = new(KnownType.Int32);
    public static readonly ExpressionTypeInfo UInt32 = new(KnownType.UInt32);
    public static readonly ExpressionTypeInfo Int64 = new(KnownType.Int64);
    public static readonly ExpressionTypeInfo UInt64 = new(KnownType.UInt64);
    public static readonly ExpressionTypeInfo Float = new(KnownType.Float);
    public static readonly ExpressionTypeInfo Double = new(KnownType.Double);
    public static readonly ExpressionTypeInfo Decimal = new(KnownType.Decimal);
    public static readonly ExpressionTypeInfo DateTime = new(KnownType.DateTime);
    public static readonly ExpressionTypeInfo Guid = new(KnownType.Guid);
    public static readonly ExpressionTypeInfo String = new(KnownType.String);
    public static readonly ExpressionTypeInfo Object = new(KnownType.Object);

    #region ====Ctor====

    private ExpressionTypeInfo(byte typeFlag, string typeName, ExpressionTypeInfo[]? types)
    {
        _typeFlag = typeFlag;
        _typeName = typeName;
        Types = types;
    }

    /// <summary>
    /// From KnowType
    /// </summary>
    internal ExpressionTypeInfo(KnownType type, bool isConverted = false, bool isNullable = false,
        ExpressionTypeInfo[]? types = null)
    {
        if (type is KnownType.Unknown or KnownType.Model)
            throw new ArgumentException("Can't be Unknown or Model type", nameof(type));

        _typeName = string.Empty;
        _typeFlag = (byte)type;
        if (isConverted) _typeFlag |= IsConvertedMask;
        if (isNullable) _typeFlag |= IsNullableMask;
        if (types is { Length: > 0 }) _typeFlag |= HasTypesMask;

        Types = types;
    }

    /// <summary>
    /// From UnknownType
    /// </summary>
    internal ExpressionTypeInfo(string typeName, bool isConverted = false, bool isNullable = false,
        ExpressionTypeInfo[]? types = null)
    {
        _typeName = typeName;
        _typeFlag = (byte)KnownType.Unknown;
        if (isConverted) _typeFlag |= IsConvertedMask;
        if (isNullable) _typeFlag |= IsNullableMask;
        if (types is { Length: > 0 }) _typeFlag |= HasTypesMask;

        Types = types;
    }

    /// <summary>
    /// From Model Type
    /// </summary>
    internal ExpressionTypeInfo(ModelId modelId, bool isConverted = false, bool isNullable = false)
    {
        _typeName = modelId.ToString();
        _typeFlag = (byte)KnownType.Model;
        if (isConverted) _typeFlag |= IsConvertedMask;
        if (isNullable) _typeFlag |= IsNullableMask;
    }

    /// <summary>
    /// From AnyValue
    /// </summary>
    internal ExpressionTypeInfo(in AnyValue value)
    {
        this = value.Type switch
        {
            AnyValue.ValueType.Empty => new ExpressionTypeInfo(KnownType.Object, isNullable: true),
            AnyValue.ValueType.Object => value.BoxedValue is string
                ? new ExpressionTypeInfo(KnownType.String)
                : new ExpressionTypeInfo(KnownType.Object),
            _ => value.Type switch
            {
                AnyValue.ValueType.Boolean => new ExpressionTypeInfo(KnownType.Boolean),
                AnyValue.ValueType.Byte => new ExpressionTypeInfo(KnownType.Boolean),
                AnyValue.ValueType.SByte => new ExpressionTypeInfo(KnownType.SByte),
                AnyValue.ValueType.Char => new ExpressionTypeInfo(KnownType.Char),
                AnyValue.ValueType.Int16 => new ExpressionTypeInfo(KnownType.Int16),
                AnyValue.ValueType.UInt16 => new ExpressionTypeInfo(KnownType.UInt16),
                AnyValue.ValueType.Int32 => new ExpressionTypeInfo(KnownType.Int32),
                AnyValue.ValueType.UInt32 => new ExpressionTypeInfo(KnownType.UInt32),
                AnyValue.ValueType.Int64 => new ExpressionTypeInfo(KnownType.Int64),
                AnyValue.ValueType.UInt64 => new ExpressionTypeInfo(KnownType.UInt64),
                AnyValue.ValueType.Float => new ExpressionTypeInfo(KnownType.Float),
                AnyValue.ValueType.Double => new ExpressionTypeInfo(KnownType.Double),
                AnyValue.ValueType.Decimal => new ExpressionTypeInfo(KnownType.Decimal),
                AnyValue.ValueType.Guid => new ExpressionTypeInfo(KnownType.Guid),
                AnyValue.ValueType.DateTime => new ExpressionTypeInfo(KnownType.DateTime),
                _ => throw new UnreachableException()
            }
        };
    }

    // /// <summary>
    // /// From runtime type
    // /// </summary>
    // public ExpressionTypeInfo(Type runtimeType)
    // {
    //     // switch (runtimeType)
    //     // {
    //     //     case Type t when t == typeof(bool)
    //     // }
    //     throw new NotImplementedException();
    // }

    #endregion

    private readonly byte _typeFlag;
    private readonly string _typeName = string.Empty;

    public KnownType Type => (KnownType)(_typeFlag & KnownTypeMask);

    /// <summary>
    /// 包含Namespace的名称, eg: System.DateTime或者简称 eg: int
    /// </summary>
    public string TypeName => Type switch //TODO: nullable
    {
        KnownType.Empty => "",
        KnownType.Void => "void",
        KnownType.Boolean => "bool",
        KnownType.Byte => "byte",
        KnownType.SByte => "sbyte",
        KnownType.Char => "char",
        KnownType.Int16 => "short",
        KnownType.UInt16 => "short",
        KnownType.Int32 => "int",
        KnownType.UInt32 => "uint",
        KnownType.Int64 => "long",
        KnownType.UInt64 => "ulong",
        KnownType.Float => "float",
        KnownType.Double => "double",
        KnownType.Decimal => "decimal",
        KnownType.DateTime => "System.DateTime",
        KnownType.Guid => "System.Guid",
        KnownType.String => "string",
        KnownType.Object => "object",
        KnownType.Array => !HasTypes ? "object[]" : $"{Types![0].TypeName}[]",
        KnownType.List => $"System.Collections.Generic.List<{Types![0].TypeName}>",
        KnownType.Dictionary =>
            $"System.Collections.Generic.Dictionary<{Types![0].TypeName},{Types![1].TypeName}>",
        KnownType.Unknown => _typeName,
        KnownType.Model => _typeName,
        _ => throw new UnreachableException()
    };

    /// <summary>
    /// 范型类型的参数类型或者数组类型的元素类型
    /// </summary>
    public ExpressionTypeInfo[]? Types { get; }

    public bool IsNullable => (_typeFlag & IsNullableMask) == IsNullableMask;
    public bool IsConverted => (_typeFlag & IsConvertedMask) == IsConvertedMask;
    internal bool HasTypes => (_typeFlag & HasTypesMask) == HasTypesMask;

    public ModelId GetModelId()
    {
        if (Type != KnownType.Model)
            throw new InvalidOperationException();
        return _typeName;
    }

    public bool IsGeneric => HasTypes && Type != KnownType.Array;
    public bool IsEmpty => Type == KnownType.Empty;

    public ExpressionTypeInfo WithConverted() => new((byte)(_typeFlag | IsConvertedMask), _typeName, Types);

    public ExpressionTypeInfo WithNullable() => new((byte)(_typeFlag | IsNullableMask), _typeName, Types);

    // private bool TryGetFromRuntimeType(Type runtimeType,
    //     [MaybeNullWhen(returnValue: false)] out ExpressionTypeInfo typeInfo)
    // {
    //     if (runtimeType.IsArray)
    //     {
    //         if (TryGetFromRuntimeType(runtimeType.GetElementType()!, out var elementType))
    //         {
    //             typeInfo = new ExpressionTypeInfo(KnownType.Array, types: [elementType]);
    //             return true;
    //         }
    //     }
    //     else if (runtimeType.IsGenericType)
    //     {
    //         
    //     }
    // }

    public override string ToString() => TypeName;

    #region ====Serialization====

    internal void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteByte(_typeFlag);
        if (Type is KnownType.Unknown or KnownType.Model)
            ws.WriteString(_typeName);
        if (HasTypes)
            ws.WriteTypeInfoArray(Types);
    }

    internal static ExpressionTypeInfo ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var typeFlag = rs.ReadByte();
        var typeName = string.Empty;
        ExpressionTypeInfo[]? types = null;
        var knownType = (KnownType)(typeFlag & KnownTypeMask);
        if (knownType is KnownType.Unknown or KnownType.Model)
            typeName = rs.ReadString() ?? string.Empty;
        var hasTypes = (typeFlag & HasTypesMask) == HasTypesMask;
        if (hasTypes)
            types = rs.ReadTypeInfoArray();

        return new ExpressionTypeInfo(typeFlag, typeName, types);
    }

    #endregion

    public enum KnownType : byte
    {
        Empty = 0,
        Void = 1,
        Boolean = 2,
        Byte = 3,
        SByte = 4,
        Char = 5,
        Int16 = 6,
        UInt16 = 7,
        Int32 = 8,
        UInt32 = 9,
        Int64 = 10,
        UInt64 = 11,
        Float = 12,
        Double = 13,
        Decimal = 14,
        DateTime = 15,
        Guid = 16,
        String = 17,
        Object = 18,
        Model = 19, //AppBox模型
        Array = 28,
        List = 29,
        Dictionary = 30,
        Unknown = 31 //最大值，头部3位保留标识
    }
}