using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.FindSymbols;

namespace AppBoxDesign;

internal static class SymbolUtils
{
    public static async Task<ISymbol?> GetSymbolAtPosition(this Document document, int position)
    {
        var symbol = await SymbolFinder.FindSymbolAtPositionAsync(document, position);

        return symbol switch
        {
            INamespaceSymbol => null,
            // Always prefer the partial implementation over the definition
            IMethodSymbol { IsPartialDefinition: true, PartialImplementationPart: var impl } => impl,
            // Don't return property getters/settings/initers
            IMethodSymbol { AssociatedSymbol: IPropertySymbol } => null,
            _ => symbol
        };
    }
}