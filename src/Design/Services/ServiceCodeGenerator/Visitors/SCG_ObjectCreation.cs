using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitObjectCreationExpression(ObjectCreationExpressionSyntax node)
    {
        var symbol = ModelExtensions.GetSymbolInfo(SemanticModel, node).Symbol as IMethodSymbol;
        if (IsGenericCreate(symbol))
        {
            var typeArgs = symbol!.ContainingType.TypeArguments;
            var modelType = typeArgs[0];
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(modelType.ToString())!;
            var model = (EntityModel)modelNode.Model;
            if (typeArgs.Length == 1)
                return SyntaxFactory
                    .ParseExpression($"new {node.Type.ToString()}({model.Id.Value})")
                    .WithTriviaFrom(node);

            //TODO: IndexScan有多个范型参数
            throw new NotImplementedException();
        }

        return base.VisitObjectCreationExpression(node);
    }

    private static bool IsGenericCreate(IMethodSymbol? methodSymbol)
    {
        if (methodSymbol == null) return false;

        return methodSymbol.GetAttributes()
            .Any(a => a.AttributeClass != null &&
                      a.AttributeClass.ToString() == "AppBoxStore.GenericCreateAttribute");
    }
}