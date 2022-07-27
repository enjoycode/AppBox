using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitIdentifierName(IdentifierNameSyntax node)
    {
        //判断是否实体模型的类型，是则加入引用列表
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
        if (symbol is INamedTypeSymbol typeSymbol &&
            typeSymbol.ContainingNamespace.Name == "Entities" &&
            typeSymbol.IsInherits(TypeOfEntity))
        {
            AddUsedEntity(typeSymbol.ToString());
        }

        return base.VisitIdentifierName(node);
    }
}