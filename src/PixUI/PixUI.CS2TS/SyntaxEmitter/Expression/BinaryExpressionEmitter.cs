using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class BinaryExpressionEmitter : SyntaxEmitter<BinaryExpressionSyntax>
    {
        internal static readonly BinaryExpressionEmitter Default = new();

        private BinaryExpressionEmitter() { }

        internal override void Emit(Emitter emitter, BinaryExpressionSyntax node)
        {
            var opKind = node.OperatorToken.Kind();
            //特殊处理 obj is string
            if (opKind == SyntaxKind.IsKeyword)
            {
                emitter.NeedGenericTypeArguments = false;
                emitter.WriteIsExpression(node.Left, node.Right);
                emitter.NeedGenericTypeArguments = true;
                return;
            }

            //判断是否Override的操作符
            var symbol = emitter.SemanticModel.GetSymbolInfo(node).Symbol;
            if (symbol is IMethodSymbol { MethodKind: MethodKind.UserDefinedOperator } methodSymbol
                && node.Right.Kind() != SyntaxKind.NullLiteralExpression &&
                node.Left.Kind() != SyntaxKind.NullLiteralExpression)
            {
                EmitUserDefinedOperator(emitter, node, opKind, methodSymbol);
                return;
            }

            emitter.Visit(node.Left);
            emitter.VisitToken(node.OperatorToken);
            emitter.Visit(node.Right);
        }

        private static void EmitUserDefinedOperator(Emitter emitter, BinaryExpressionSyntax node,
            SyntaxKind opKind, IMethodSymbol symbol)
        {
            //特殊处理 == 或 !=, TODO:另考虑判断两者是否Nullable,非Nullable不需要特殊处理
            var isEquality = opKind == SyntaxKind.EqualsEqualsToken ||
                             opKind == SyntaxKind.ExclamationEqualsToken;
            if (isEquality)
            {
                emitter.AddUsedModule("System");
                emitter.Write(opKind == SyntaxKind.EqualsEqualsToken
                    ? "System.OpEquality"
                    : "System.OpInequality");
            }
            else
            {
                emitter.WriteTypeSymbol(symbol.ContainingType, !node.InSameSourceFile(symbol));
                emitter.Write('.');

                emitter.Write(symbol.Name); //eg: op_Subtraction
            }

            emitter.Write('(');
            emitter.DisableVisitTrailingTrivia();
            emitter.Visit(node.Left);
            emitter.EnableVisitTrailingTrivia();
            emitter.Write(", ");
            emitter.Visit(node.Right);
            emitter.Write(')');
        }
    }
}