using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal partial class ViewCodeGenerator
{
    public override SyntaxNode? VisitIdentifierName(IdentifierNameSyntax node)
    {
        //判断是否实体模型的类型，是则加入引用列表
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
        if (symbol != null && (symbol.IsAppBoxEntity(FindModel) || symbol.IsAppBoxView(FindModel)))
            AddUsedModel(symbol.ToString());

        return base.VisitIdentifierName(node);
    }
}