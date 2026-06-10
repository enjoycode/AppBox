using System.Text;

namespace AppBoxCore;

/// <summary>
/// Represents indexing a property or array.
/// </summary>
public sealed class IndexExpression : Expression
{
    internal IndexExpression() { }

    internal IndexExpression(Expression instance, string indexerName, Expression[] arguments,
        ExpressionTypeInfo typeInfo)
    {
        StaticType = ExpressionTypeInfo.Empty;
        Instance = instance;
        IndexerName = indexerName;
        Arguments = arguments;
        _typeInfo = typeInfo;
    }

    public override ExpressionType NodeType => ExpressionType.IndexExpression;

    public ExpressionTypeInfo StaticType { get; private set; } //暂保留用于静态类型
    public Expression? Instance { get; private set; }
    public string IndexerName { get; private set; } = string.Empty;
    public Expression[] Arguments { get; private set; } = null!;

    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public bool IsArray => string.IsNullOrEmpty(IndexerName);

    public bool IsStatic => !StaticType.IsEmpty;

    public override LinqExpression ToLinqExpression(IExpressionContext ctx)
    {
        if (IsStatic || IsArray)
            throw new NotImplementedException();

        var instanceType = ctx.ResolveType(Instance!.TypeInfo);
        var argTypes = new Type[Arguments.Length];
        for (var i = 0; i < argTypes.Length; i++)
        {
            argTypes[i] = ctx.ResolveType(Arguments[i].TypeInfo);
        }

        var indexerPropertyInfo = instanceType.GetProperty(IndexerName, argTypes)!;
        var args = new LinqExpression[Arguments.Length];
        for (var i = 0; i < args.Length; i++)
        {
            args[i] = Arguments[i].ToLinqExpression(ctx)!;
        }

        return LinqExpression.Property(Instance.ToLinqExpression(ctx), indexerPropertyInfo, args);
    }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        //TODO:
        Instance!.ToCode(sb, preTabs);
        sb.Append('[');
        for (var i = 0; i < Arguments.Length; i++)
        {
            if (i != 0) sb.Append(", ");
            Arguments[i].ToCode(sb, 0);
        }

        sb.Append(']');
    }

    #region ====Serialization====

    protected internal override void WriteTo<T>(ref T writer)
    {
        writer.WriteBool(IsStatic);
        writer.WriteBool(IsArray);

        if (IsStatic)
            StaticType.WriteTo(ref writer);
        else
            writer.SerializeExpression(Instance);

        if (!IsArray)
            writer.WriteString(IndexerName);

        _typeInfo.WriteTo(ref writer);

        writer.WriteVariant(Arguments.Length);
        foreach (var argument in Arguments)
            writer.SerializeExpression(argument);
    }

    protected internal override void ReadFrom<T>(ref T reader)
    {
        var isStatic = reader.ReadBool();
        var isArray = reader.ReadBool();

        if (isStatic)
            StaticType = ExpressionTypeInfo.ReadFrom(ref reader);
        else
            Instance = (Expression)reader.Deserialize()!;

        if (!isArray)
            IndexerName = reader.ReadString()!;

        _typeInfo = ExpressionTypeInfo.ReadFrom(ref reader);

        var argsCount = reader.ReadVariant();
        Arguments = new Expression[argsCount];
        for (var i = 0; i < argsCount; i++)
            Arguments[i] = (Expression)reader.Deserialize()!;
    }

    #endregion
}