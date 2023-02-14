using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitElementAccessExpression(ElementAccessExpressionSyntax node)
        {
            var typeInfo = SemanticModel.GetTypeInfo(node.Expression).Type;
            if (typeInfo is { SpecialType: SpecialType.System_String })
            {
                //TODO:范围判断 eg: str[1^2]
                Visit(node.Expression);
                Write(".charCodeAt(");
                Visit(node.ArgumentList.Arguments[0]);
                Write(')');
                WriteTrailingTrivia(node);
            }
            else
            {
                Visit(node.Expression);
                Visit(node.ArgumentList);
            }
        }
    }
}