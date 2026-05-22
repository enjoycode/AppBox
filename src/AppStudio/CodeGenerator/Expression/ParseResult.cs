using AppBoxCore;

namespace AppBoxDesign.CodeGenerator;

public readonly struct ParseResult
{
    public static readonly ParseResult None = new();

    private ParseResult(Expression expression)
    {
        _expression = expression;
        _typeInfo = null;
    }

    private ParseResult(ExpressionTypeInfo typeInfo)
    {
        _expression = null;
        _typeInfo = typeInfo;
    }

    private readonly Expression? _expression;
    private readonly ExpressionTypeInfo? _typeInfo;

    public bool IsExpression => !Expression.IsNull(_expression);
    public bool IsTypeInfo => _typeInfo.HasValue;
    public bool IsNone => !IsExpression && !IsTypeInfo;

    public Expression Expression => IsExpression ? _expression! : throw new NotSupportedException();

    public ExpressionTypeInfo TypeInfo => IsTypeInfo ? _typeInfo!.Value : throw new NotSupportedException();

    public static implicit operator ParseResult(Expression expression) => new(expression);
    public static implicit operator ParseResult(ExpressionTypeInfo typeInfo) => new(typeInfo);
}