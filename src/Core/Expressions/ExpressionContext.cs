namespace AppBoxCore;

public interface IExpressionContext
{
    //TODO: ResolveParameter

    Type ResolveType(ExpressionTypeInfo typeInfo);
}

public class ExpressionContext : IExpressionContext
{
    public static readonly ExpressionContext Default = new();

    private readonly Dictionary<string, Type> _knownTypes = new()
    {
        { "bool", typeof(bool) },
        { "byte", typeof(byte) },
        { "sbyte", typeof(sbyte) },
        { "short", typeof(short) },
        { "ushort", typeof(ushort) },
        { "int", typeof(int) },
        { "uint", typeof(uint) },
        { "long", typeof(long) },
        { "ulong", typeof(ulong) },
        { "float", typeof(float) },
        { "double", typeof(double) },
        { "decimal", typeof(decimal) },
        { "char", typeof(char) },
        { "string", typeof(string) },
        { "object", typeof(object) },
    };

    public virtual Type ResolveType(ExpressionTypeInfo typeInfo)
    {
        //TODO:暂简单实现,maybe use cache
        if (_knownTypes.TryGetValue(typeInfo.TypeName, out var sysType))
            return sysType;

        var type = Type.GetType(typeInfo.TypeName);
        if (type == null)
            throw new Exception($"Can't find type: {typeInfo.TypeName} ");

        if (typeInfo.GenericArguments is { Length: > 0 })
        {
            var genericTypes = new Type[typeInfo.GenericArguments.Length];
            for (var i = 0; i < genericTypes.Length; i++)
            {
                genericTypes[i] = ResolveType(typeInfo.GenericArguments[i]);
            }

            type = type.MakeGenericType(genericTypes);
        }

        return type;
    }
}