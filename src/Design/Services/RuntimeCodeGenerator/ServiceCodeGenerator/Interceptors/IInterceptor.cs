using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

public interface IMemberAccessInterceptor<T>
{
    T VisitMemberAccess(MemberAccessExpressionSyntax node, ISymbol symbol,
        CSharpSyntaxVisitor<T> visitor);
}

public interface IInvocationInterceptor<T>
{
    T VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<T> visitor);
}