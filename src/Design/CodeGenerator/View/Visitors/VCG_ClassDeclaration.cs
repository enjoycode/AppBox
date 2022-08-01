using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ViewCodeGenerator
{
    public override SyntaxNode? VisitClassDeclaration(ClassDeclarationSyntax node)
    {
        if (TypeHelper.IsViewClass(node, AppName, ViewModel.Name))
        {
            var updatedNode = (ClassDeclarationSyntax)base.VisitClassDeclaration(node)!;
            //实体工厂
            var entityFactoriesCode =
                CodeGeneratorUtil.GenerateEntityFactoriesCode(DesignHub, _usedModels);
            var entityFactories =
                SyntaxFactory.ParseCompilationUnit(entityFactoriesCode).Members[0];
            return updatedNode.AddMembers(entityFactories);
        }

        return base.VisitClassDeclaration(node);
    }
}