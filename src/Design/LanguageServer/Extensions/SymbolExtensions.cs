using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

public static class SymbolExtensions
{
    public static string GetKind(this ISymbol symbol)
    {
        if (symbol is INamedTypeSymbol namedType)
        {
            return Enum.GetName(namedType.TypeKind.GetType(), namedType.TypeKind);
        }

        if (symbol.Kind == SymbolKind.Field &&
            symbol.ContainingType?.TypeKind == TypeKind.Enum &&
            symbol.Name != WellKnownMemberNames.EnumBackingFieldName)
        {
            return "EnumMember";
        }

        if ((symbol as IFieldSymbol)?.IsConst == true)
        {
            return "Const";
        }

        return Enum.GetName(symbol.Kind.GetType(), symbol.Kind);
    }

    public static string? GetAccessibilityString(this ISymbol symbol)
    {
        return symbol.DeclaredAccessibility switch
        {
            Accessibility.Public => SymbolAccessibilities.Public,
            Accessibility.Internal => SymbolAccessibilities.Internal,
            Accessibility.Private => SymbolAccessibilities.Private,
            Accessibility.Protected => SymbolAccessibilities.Protected,
            Accessibility.ProtectedOrInternal => SymbolAccessibilities.ProtectedInternal,
            Accessibility.ProtectedAndInternal => SymbolAccessibilities.PrivateProtected,
            _ => null
        };
    }

    public static string GetKindString(this ISymbol symbol)
    {
        return symbol switch
        {
            INamespaceSymbol _ => SymbolKinds.Namespace,
            INamedTypeSymbol namedTypeSymbol => namedTypeSymbol.GetKindString(),
            IMethodSymbol methodSymbol => methodSymbol.GetKindString(),
            IFieldSymbol fieldSymbol => fieldSymbol.GetKindString(),
            IPropertySymbol propertySymbol => propertySymbol.GetKindString(),
            IEventSymbol _ => SymbolKinds.Event,
            _ => SymbolKinds.Unknown
        };
    }

    public static string GetKindString(this INamedTypeSymbol namedTypeSymbol)
    {
        return namedTypeSymbol.TypeKind switch
        {
            TypeKind.Class => SymbolKinds.Class,
            TypeKind.Delegate => SymbolKinds.Delegate,
            TypeKind.Enum => SymbolKinds.Enum,
            TypeKind.Interface => SymbolKinds.Interface,
            TypeKind.Struct => SymbolKinds.Struct,
            _ => SymbolKinds.Unknown
        };
    }

    public static string GetKindString(this IMethodSymbol methodSymbol)
    {
        return methodSymbol.MethodKind switch
        {
            MethodKind.Ordinary => SymbolKinds.Method,
            MethodKind.ReducedExtension => SymbolKinds.Method,
            MethodKind.ExplicitInterfaceImplementation => SymbolKinds.Method,
            MethodKind.Constructor => SymbolKinds.Constructor,
            MethodKind.StaticConstructor => SymbolKinds.Constructor,
            MethodKind.Destructor => SymbolKinds.Destructor,
            MethodKind.Conversion => SymbolKinds.Operator,
            MethodKind.BuiltinOperator => SymbolKinds.Operator,
            MethodKind.UserDefinedOperator => SymbolKinds.Operator,
            _ => SymbolKinds.Unknown
        };
    }

    public static string GetKindString(this IFieldSymbol fieldSymbol)
    {
        if (fieldSymbol.ContainingType?.TypeKind == TypeKind.Enum &&
            fieldSymbol.HasConstantValue)
        {
            return SymbolKinds.EnumMember;
        }

        return fieldSymbol.IsConst
            ? SymbolKinds.Constant
            : SymbolKinds.Field;
    }

    public static string GetKindString(this IPropertySymbol propertySymbol)
    {
        return propertySymbol.IsIndexer
            ? SymbolKinds.Indexer
            : SymbolKinds.Property;
    }
}