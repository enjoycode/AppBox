using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitAttributeList(AttributeListSyntax node)
    {
        //TODO:暂全部移除Attribute
        base.VisitAttributeList(node);
        return node.RemoveNodes(node.ChildNodes(), SyntaxRemoveOptions.KeepEndOfLine);
    }
    
    public override SyntaxNode? VisitAttribute(AttributeSyntax node)
    {
        if (node.Parent?.Parent is MethodDeclarationSyntax methodDeclaration)
        {
            if (TypeHelper.IsServiceMethod(methodDeclaration)) //服务方法特殊Attribute处理
            {
                var symbol = SemanticModel.GetSymbolInfo(node.Name).Symbol;
                if (symbol != null && symbol.ContainingType.ToString() == TypeHelper.InvokePermissionAttribute)
                {
                    //TODO:***处理系统特殊权限,如流程引擎sys.Permissions.WorkflowEngine
                    var arg = (AttributeArgumentSyntax)node.ArgumentList!.ChildNodes().First();
                    var source = Visit(arg.Expression);
                    _publicMethodsInvokePermissions.Add(methodDeclaration.Identifier.ValueText, source.ToString());
                    return null; //TODO:暂直接返回null
                }
            }
        }

        return base.VisitAttribute(node);
    }
}