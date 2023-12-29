using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{

    private static TypeExpression MakeTypeExpression(INamedTypeSymbol namedTypeSymbol)
    {
        if (namedTypeSymbol.IsGenericType)
            throw new NotImplementedException();

        return new TypeExpression(namedTypeSymbol.ToString()!);
    }
    
}