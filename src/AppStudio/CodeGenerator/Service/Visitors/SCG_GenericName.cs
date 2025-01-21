using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitGenericName(GenericNameSyntax node)
    {
        var symbol = ModelExtensions.GetSymbolInfo(SemanticModel, node).Symbol;
        if (IsToNoneGeneric(symbol))
        {
            return SyntaxFactory.ParseName(node.Identifier.Text);
        }

        return base.VisitGenericName(node);
    }

    private static bool IsToNoneGeneric(ISymbol? symbol)
    {
        if (symbol == null || symbol is not INamedTypeSymbol typeSymbol)
            return false;

        return typeSymbol.GetAttributes()
            .Any(a => a.AttributeClass != null &&
                      a.AttributeClass.ToString() == "AppBoxStore.NoneGenericAttribute");
    }
}