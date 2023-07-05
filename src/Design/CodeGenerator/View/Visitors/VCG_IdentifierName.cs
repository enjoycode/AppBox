using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal partial class ViewCsGenerator
{
    public override SyntaxNode? VisitIdentifierName(IdentifierNameSyntax node)
    {
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
        //判断是否实体模型或视图模型，是则加入引用列表
        if (symbol != null && (symbol.IsAppBoxEntity(FindModel) || symbol.IsAppBoxView(FindModel)))
            AddUsedModel(symbol.ToString());
        //判断是否响应实体类，是则转换eg: RxEmployee转换为RxEntity<Employee>并加入引用列表
        if (symbol != null && IsRxEntity(symbol, out var entityFullName))
        {
            AddUsedModel(entityFullName);
            var types = SyntaxFactory.TypeArgumentList()
                .AddArguments(SyntaxFactory.ParseTypeName(entityFullName));
            return SyntaxFactory.GenericName("RxEntity").WithTypeArgumentList(types);
        }

        return base.VisitIdentifierName(node);
    }

    private bool IsRxEntity(ISymbol symbol, out string entityFullName)
    {
        if (symbol is INamedTypeSymbol typeSymbol && typeSymbol.ContainingNamespace.Name == "Entities")
        {
            //TODO:暂简单判断
            var fullName = symbol.ToString(); //eg: sys.Entities.RxEmployee
            if (fullName.Contains(".Entities.Rx"))
            {
                fullName = fullName.Replace(".Entities.Rx", ".Entities.");
                if (FindModel(fullName))
                {
                    entityFullName = fullName;
                    return true;
                }
            }
        }

        entityFullName = string.Empty;
        return false;
    }
}