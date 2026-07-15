namespace AppBoxCore;

public sealed class ParameterExpression : Expression
{
    internal ParameterExpression() { }

    internal ParameterExpression(string name, ExpressionTypeInfo type, bool isByRef = false)
    {
        if (string.IsNullOrEmpty(name))
            throw new ArgumentNullException(nameof(name));
        if (type.IsEmpty || type.Type == ExpressionTypeInfo.KnownType.Void)
            throw new ArgumentException("Type must not be empty", nameof(type));

        Name = name;
        IsByRef = isByRef;
        _typeInfo = type;
    }

    public string Name { get; private set; } = null!;
    private ExpressionTypeInfo _typeInfo;
    public override ExpressionTypeInfo TypeInfo => _typeInfo;
    public bool IsByRef { get; private set; }

    public override ExpressionType NodeType => ExpressionType.ParameterExpression;

    public override LinqExpression ToLinqExpression(IExpressionContext ctx)
    {
        var runtimeType = ctx.ResolveType(_typeInfo);
        if (IsByRef)
            runtimeType = runtimeType.MakeByRefType();
        return LinqExpression.Parameter(runtimeType, Name);
    }

    public override void ToCode(IExpressionCodeBuilder builder)
    {
        builder.StringBuilder.Append(Name);
    }

    protected internal override void WriteTo<T>(ref T writer)
    {
        writer.WriteString(Name);
        writer.WriteBool(IsByRef);
        _typeInfo.WriteTo(ref writer);
    }

    protected internal override void ReadFrom<T>(ref T reader)
    {
        Name = reader.ReadString()!;
        IsByRef = reader.ReadBool();
        _typeInfo = ExpressionTypeInfo.ReadFrom(ref reader);
    }
}