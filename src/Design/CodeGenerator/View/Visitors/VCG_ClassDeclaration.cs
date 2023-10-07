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
    private static bool CheckIsDynamicWidget(ClassDeclarationSyntax node)
    {
        var attribute = TypeHelper.TryGetAttribute(node.AttributeLists, IsDynamicWidgetAttribute);
        return attribute != null;
    }

    private static bool IsDynamicWidgetAttribute(AttributeSyntax attribute)
    {
        const string shortName = "DynamicWidget";
        var name = attribute.Name.ToString();
        if (name == shortName) return true;

        return name == $"{shortName}Attribute"
               || name == $"PixUI.{shortName}"
               || name == $"PixUI.{shortName}Attribute";
    }
}