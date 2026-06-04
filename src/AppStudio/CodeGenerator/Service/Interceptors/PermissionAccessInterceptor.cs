using System;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal sealed class PermissionAccessInterceptor : IMemberAccessInterceptor<SyntaxNode>
{
    internal const string Name = "PermissionAccess";

    public SyntaxNode VisitMemberAccess(MemberAccessExpressionSyntax node, ISymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        var generator = (ServiceCodeGenerator)visitor!;
        var appName = symbol.ContainingType.ContainingNamespace.Name;
        var appNode = generator.DesignContext.DesignTree.FindApplicationNodeByName(appName.AsMemory())!;
        var modelNode = generator.DesignContext.DesignTree.FindModelNodeByName(appNode.Model.Id,
            ModelType.Permission, symbol.Name.AsMemory())!;

        return SyntaxFactory.ParseExpression(
            $"AppBoxCore.RuntimeContext.HasPermission({modelNode.Model.Id.Value}L)");
    }
}