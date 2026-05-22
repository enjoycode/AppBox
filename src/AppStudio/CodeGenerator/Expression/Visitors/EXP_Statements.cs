using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override ParseResult VisitLocalDeclarationStatement(LocalDeclarationStatementSyntax node)
    {
        return node.Declaration.Accept(this);
    }

    public override ParseResult VisitExpressionStatement(ExpressionStatementSyntax node)
    {
        return node.Expression.Accept(this);
    }
}