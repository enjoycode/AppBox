using Microsoft.CodeAnalysis;
using PixUI;

namespace AppBoxDesign;

internal abstract class InterceptorManager
{
    protected readonly Dictionary<string, IInvocationInterceptor<SyntaxNode>> InvocationInterceptors = new();

    protected readonly Dictionary<string, IMemberAccessInterceptor<SyntaxNode>> MemberAccessInterceptors = new();

    public IInvocationInterceptor<SyntaxNode>? GetInvocationInterceptor(ISymbol? symbol)
    {
        if (symbol == null) return null;

        var attribute = symbol.GetAttributes()
            .SingleOrDefault(a => a.AttributeClass != null &&
                                  a.AttributeClass.ToString() == TypeHelper.InvocationInterceptorAttribute);

        if (attribute == null) return null;

        var key = attribute.ConstructorArguments[0].Value!.ToString();
        if (string.IsNullOrEmpty(key)) return null;
        if (!InvocationInterceptors.TryGetValue(key, out var interceptor))
            Log.Debug($"Can't find InvocationInterceptor: {key}");
        return interceptor;
    }

    public IMemberAccessInterceptor<SyntaxNode>? GetMemberAccessInterceptor(ISymbol? symbol)
    {
        if (symbol == null) return null;

        var attribute = symbol.GetAttributes()
            .SingleOrDefault(a => a.AttributeClass != null &&
                                  a.AttributeClass.ToString() == TypeHelper.MemberAccessInterceptorAttribute);
        if (attribute == null) return null;

        var key = attribute.ConstructorArguments[0].Value!.ToString();
        if (string.IsNullOrEmpty(key)) return null;
        if (!MemberAccessInterceptors.TryGetValue(key, out var interceptor))
            Log.Debug($"Can't find MemberAccessInterceptor: {key}");
        return interceptor;
    }
}