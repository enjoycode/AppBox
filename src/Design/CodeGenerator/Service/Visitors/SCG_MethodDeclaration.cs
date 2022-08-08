using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitMethodDeclaration(MethodDeclarationSyntax node)
    {
        var updateNode = (MethodDeclarationSyntax)base.VisitMethodDeclaration(node)!;

        //处理返回类型
        // if (node.ReturnType.ToString() != "void")
        // {
        //     var returnTypeSymbol = SemanticModel.GetSymbolInfo(node.ReturnType).Symbol;
        //     var returnRuntimeType = TypeHelper.ConvertToRuntimeType(returnTypeSymbol);
        //     if (returnRuntimeType != null)
        //         updateNode = updateNode.WithReturnType(returnRuntimeType);
        // }

        //判断方法是否属于服务类且标为公开
        if (TypeHelper.IsServiceClass(node.Parent as ClassDeclarationSyntax, AppName,
                ServiceModel.Name))
        {
            if (TypeHelper.IsServiceMethod(node)) //处理公开的服务方法，加入列表
            {
                _publicMethods.Add(node); //注意添加旧节点,非updateNode
            }
        }

        return updateNode;
    }
}