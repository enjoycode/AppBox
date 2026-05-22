using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override ParseResult VisitVariableDeclaration(VariableDeclarationSyntax node)
    {
        throw new NotImplementedException("Parse variable declaration");
    }
}