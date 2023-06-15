using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitObjectCreationExpression(ObjectCreationExpressionSyntax node)
    {
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
        if (IsGenericCreate(symbol, out var toNoneGeneric))
        {
            var typeArgs = symbol!.ContainingType.TypeArguments;
            var modelType = typeArgs[0];
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(modelType.ToString())!;
            var model = (EntityModel)modelNode.Model;
            if (typeArgs.Length == 1)
            {
                var typeName = GetGenericTypeName(node.Type, toNoneGeneric);
                return SyntaxFactory
                    .ParseExpression($"new {typeName}({model.Id.Value}L)")
                    .WithTriviaFrom(node);
            }

            //TODO: IndexScan有多个范型参数
            throw new NotImplementedException();
        }

        return base.VisitObjectCreationExpression(node);
    }

    private static string GetGenericTypeName(TypeSyntax typeSyntax, bool toNoneGeneric)
    {
        if (!toNoneGeneric) return typeSyntax.ToString();

        if (typeSyntax is GenericNameSyntax genericNameSyntax)
            return genericNameSyntax.Identifier.Text;
        if (typeSyntax is QualifiedNameSyntax qualifiedNameSyntax)
            return $"{qualifiedNameSyntax.Left}.{((GenericNameSyntax)qualifiedNameSyntax.Right).Identifier.Text}";
        throw new NotImplementedException();
    }

    private static bool IsGenericCreate(ISymbol? methodSymbol, out bool toNoneGeneric)
    {
        var attribute = methodSymbol?.GetAttributes()
            .FirstOrDefault(a => a.AttributeClass != null &&
                                 a.AttributeClass.ToString() == "AppBoxStore.GenericCreateAttribute");
        if (attribute == null)
        {
            toNoneGeneric = false;
            return false;
        }

        toNoneGeneric = (bool)attribute.ConstructorArguments[0].Value!;
        return true;
    }
}