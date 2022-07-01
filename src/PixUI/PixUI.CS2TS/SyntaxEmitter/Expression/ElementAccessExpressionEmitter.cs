using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class ElementAccessExpressionEmitter
    {
        internal static void Emit(Emitter emitter, ElementAccessExpressionSyntax node)
        {
            var typeInfo = emitter.SemanticModel.GetTypeInfo(node.Expression).Type;
            if (typeInfo is { SpecialType: SpecialType.System_String })
            {
                //TODO:范围判断 eg: str[1^2]
                emitter.Visit(node.Expression);
                emitter.Write(".charCodeAt(");
                emitter.Visit(node.ArgumentList.Arguments[0]);
                emitter.Write(')');
                emitter.WriteTrailingTrivia(node);
            }
            else
            {
                emitter.Visit(node.Expression);
                emitter.Visit(node.ArgumentList);
            }
        }
    }
}