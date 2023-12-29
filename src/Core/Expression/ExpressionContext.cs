namespace AppBoxCore;

public interface IExpressionContext
{
    //TODO: ResolveParameter

    Type ResolveType(TypeExpression typeExpression);
}

public class ExpressionContext : IExpressionContext
{
    public Type ResolveType(TypeExpression typeExpression)
    {
        //TODO:暂简单实现,maybe use cache

        var type = Type.GetType(typeExpression.TypeFullName);
        if (type == null)
            throw new Exception($"Can't find type: {typeExpression.TypeFullName} ");

        return type;
    }
}