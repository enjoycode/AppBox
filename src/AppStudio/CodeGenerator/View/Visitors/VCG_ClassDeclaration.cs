using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ViewCsGenerator
{
    public override SyntaxNode? VisitClassDeclaration(ClassDeclarationSyntax node)
    {
        if (TypeHelper.IsViewClass(node, AppName, ViewModel.Name))
        {
            IsDynamicWidget = CheckIsDynamicWidget(node);
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

    /// <summary>
    /// 是否标记了DynamicWidgetAttribute的视图模型
    /// </summary>
    internal static bool CheckIsDynamicWidget(ClassDeclarationSyntax node)
    {
        var attribute = TypeHelper.TryGetAttribute(node.AttributeLists, static a =>
        {
            const string shortName = "DynamicWidget";
            var name = a.Name.ToString();
            if (name == shortName) return true;

            return name is $"{shortName}Attribute" or $"PixUI.{shortName}" or $"PixUI.{shortName}Attribute";
        });
        return attribute != null;
    }
}