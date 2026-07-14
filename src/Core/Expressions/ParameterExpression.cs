namespace AppBoxCore;

public sealed class ParameterExpression : Expression
{
    internal ParameterExpression() { }

    internal ParameterExpression(string name, ExpressionTypeInfo type)
    {
        if (string.IsNullOrEmpty(name))
            throw new ArgumentNullException(nameof(name));
        if (type.IsEmpty)
            throw new ArgumentException("Type must not be empty", nameof(type));

        Name = name;
        _typeInfo = type;
    }

    public string Name { get; private set; } = null!;
    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;

    public override ExpressionType NodeType => ExpressionType.ParameterExpression;

    public override LinqExpression ToLinqExpression(IExpressionContext ctx) =>
        LinqExpression.Parameter(ctx.ResolveType(_typeInfo), Name);

    public override void ToCode(IExpressionCodeBuilder builder)
    {
        builder.StringBuilder.Append(Name);
    }

    protected internal override void WriteTo<T>(ref T writer)
    {
        writer.WriteString(Name);
        _typeInfo.WriteTo(ref writer);
    }

    protected internal override void ReadFrom<T>(ref T reader)
    {
        Name = reader.ReadString()!;
        _typeInfo = ExpressionTypeInfo.ReadFrom(ref reader);
    }
}