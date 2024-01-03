namespace AppBoxCore;

public interface IExpressionContext
{
    //TODO: ResolveParameter

    Type ResolveType(TypeExpression typeExpression);
}

public class ExpressionContext : IExpressionContext
{
    public static readonly ExpressionContext Default = new();

    private Dictionary<string, Type> _knownTypes = new()
    {
        { "bool", typeof(bool) },
        { "byte", typeof(byte) },
        { "short", typeof(short) },
        { "int", typeof(int) },
        { "long", typeof(long) },
        { "float", typeof(float) },
        { "double", typeof(double) },
        { "string", typeof(string) },
    };

    public Type ResolveType(TypeExpression typeExpression)
    {
        //TODO:暂简单实现,maybe use cache

        if (_knownTypes.TryGetValue(typeExpression.TypeName, out var sysType))
            return sysType;

        var type = Type.GetType(typeExpression.TypeName);
        if (type == null)
            throw new Exception($"Can't find type: {typeExpression.TypeName} ");

        return type;
    }
}