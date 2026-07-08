namespace AppBoxCore;

partial class Expression
{
    public static ConstantExpression Constant(AnyValue value, ExpressionTypeInfo? typeInfo = null) =>
        new(value, typeInfo);

    public static ConstantExpression Constant(object? value, ExpressionTypeInfo? typeInfo = null) =>
        new(AnyValue.From(value), typeInfo);

    public static ParameterExpression Parameter(string name, ExpressionTypeInfo typeInfo) =>
        new(name, typeInfo);

    public static BinaryExpression Assign(Expression left, Expression right)
        => new(left, right, BinaryOperatorType.Assign);

    public static BinaryExpression GreaterThan(Expression left, Expression right)
        => new(left, right, BinaryOperatorType.Greater);

    public static BinaryExpression Divide(Expression left, Expression right)
        => new(left, right, BinaryOperatorType.Divide, left.TypeInfo);

    public static MemberExpression StaticProperty(ExpressionTypeInfo staticType, string memberName,
        ExpressionTypeInfo typeInfo) =>
        new(staticType, null, memberName, false, typeInfo);

    public static MemberExpression StaticField(ExpressionTypeInfo staticType, string memberName,
        ExpressionTypeInfo typeInfo) =>
        new(staticType, null, memberName, true, typeInfo);

    public static MemberExpression InstanceProperty(Expression instance, string memberName,
        ExpressionTypeInfo typeInfo) =>
        new(ExpressionTypeInfo.Empty, instance, memberName, false, typeInfo);

    public static IndexExpression InstancePropertyIndexer(Expression instance, string indexerName,
        Expression[] arguments, ExpressionTypeInfo typeInfo)
        => new(instance, indexerName, arguments, typeInfo);

    public static IndexExpression ArrayAccess(Expression instance, Expression[] arguments, ExpressionTypeInfo typeInfo)
        => new(instance, string.Empty, arguments, typeInfo);

    public static MemberExpression InstanceField(Expression instance, string memberName,
        ExpressionTypeInfo typeInfo) =>
        new(ExpressionTypeInfo.Empty, instance, memberName, true, typeInfo);

    public static MethodCallExpression StaticCall(ExpressionTypeInfo staticType, string methodName,
        ExpressionTypeInfo typeInfo, Expression[]? arguments = null, ExpressionTypeInfo[]? genericTypes = null) =>
        new(staticType, null, methodName, typeInfo, arguments, genericTypes);

    public static MethodCallExpression InstanceCall(Expression instance, string methodName,
        ExpressionTypeInfo typeInfo, Expression[]? arguments = null, ExpressionTypeInfo[]? genericTypes = null) =>
        new(ExpressionTypeInfo.Empty, instance, methodName, typeInfo, arguments, genericTypes);
}