namespace AppBoxCore;

/// <summary>
/// 表达式的类型信息，用于解析为运行时类型
/// </summary>
public readonly struct ExpressionTypeInfo
{
    public static readonly ExpressionTypeInfo Empty = new(string.Empty);
    public static readonly ExpressionTypeInfo DateTime = new("System.DateTime");
    public static readonly ExpressionTypeInfo Double = new("double");

    public ExpressionTypeInfo(string typeName, bool isConverted = false,
        bool isNullable = false, ExpressionTypeInfo[]? genericArguments = null)
    {
        TypeName = typeName;
        GenericArguments = genericArguments;
        IsNullable = isNullable;
        IsConverted = isConverted;
    }

    public static ExpressionTypeInfo FromAnyValue(in AnyValue value) => value.Type switch
    {
        AnyValue.AnyValueType.Boolean => new ExpressionTypeInfo("bool"),
        AnyValue.AnyValueType.Byte => new ExpressionTypeInfo("byte"),
        AnyValue.AnyValueType.Char => new ExpressionTypeInfo("char"),
        AnyValue.AnyValueType.Int16 => new ExpressionTypeInfo("short"),
        AnyValue.AnyValueType.UInt16 => new ExpressionTypeInfo("ushort"),
        AnyValue.AnyValueType.Int32 => new ExpressionTypeInfo("int"),
        AnyValue.AnyValueType.UInt32 => new ExpressionTypeInfo("uint"),
        AnyValue.AnyValueType.Int64 => new ExpressionTypeInfo("long"),
        AnyValue.AnyValueType.UInt64 => new ExpressionTypeInfo("ulong"),
        AnyValue.AnyValueType.Float => new ExpressionTypeInfo("float"),
        AnyValue.AnyValueType.Double => new ExpressionTypeInfo("double"),
        AnyValue.AnyValueType.Decimal => new ExpressionTypeInfo("decimal"),
        AnyValue.AnyValueType.Guid => new ExpressionTypeInfo("System.Guid"),
        AnyValue.AnyValueType.DateTime => new ExpressionTypeInfo("System.DateTime"),
        AnyValue.AnyValueType.Empty => new ExpressionTypeInfo("object", isNullable: true),
        _ => new ExpressionTypeInfo("object")
    };

    /// <summary>
    /// 包含Namespace的名称, eg: System.DateTime或者简称 eg: int
    /// </summary>
    public string TypeName { get; } = null!;

    /// <summary>
    /// 范型类型的参数类型
    /// </summary>
    public ExpressionTypeInfo[]? GenericArguments { get; }

    public bool IsNullable { get; }
    public bool IsConverted { get; }

    public bool IsGeneric => GenericArguments is { Length: > 0 };
    public bool IsEmpty => string.IsNullOrEmpty(TypeName);

    public ExpressionTypeInfo WithConverted(bool isConverted) =>
        new(TypeName, isConverted, IsNullable, GenericArguments);

    public override string ToString() => TypeName;

    #region ====Serialization====

    internal void WriteTo(IOutputStream ws)
    {
        ws.WriteBool(IsEmpty);
        if (IsEmpty) return;

        ws.WriteString(TypeName);
        ws.WriteTypeInfoArray(GenericArguments);
        ws.WriteBool(IsNullable);
        ws.WriteBool(IsConverted);
        ws.WriteFieldEnd(); //保留
    }

    internal static ExpressionTypeInfo ReadFrom(IInputStream rs)
    {
        var isEmpty = rs.ReadBool();
        if (isEmpty) return Empty;

        var typeName = rs.ReadString() ?? string.Empty;
        var genericArgs = rs.ReadTypeInfoArray();
        var isNullable = rs.ReadBool();
        var isConverted = rs.ReadBool();
        rs.ReadFieldId(); //保留
        return new ExpressionTypeInfo(typeName, isConverted, isNullable, genericArgs);
    }

    #endregion
}