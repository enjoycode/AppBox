using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitBinaryExpression(BinaryExpressionSyntax node)
        {
            var opKind = node.OperatorToken.Kind();
            //特殊处理 obj is string
            if (opKind == SyntaxKind.IsKeyword)
            {
                NeedGenericTypeArguments = false;
                WriteIsExpression(node.Left, node.Right);
                NeedGenericTypeArguments = true;
                return;
            }

            //判断是否Override的操作符
            var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
            if (symbol is IMethodSymbol { MethodKind: MethodKind.UserDefinedOperator } methodSymbol
                && node.Right.Kind() != SyntaxKind.NullLiteralExpression &&
                node.Left.Kind() != SyntaxKind.NullLiteralExpression)
            {
                EmitUserDefinedOperator(node, opKind, methodSymbol);
                return;
            }

            Visit(node.Left);
            VisitToken(node.OperatorToken);
            Visit(node.Right);
        }

        private void EmitUserDefinedOperator(BinaryExpressionSyntax node, SyntaxKind opKind, IMethodSymbol symbol)
        {
            //特殊处理 == 或 !=, TODO:另考虑判断两者是否Nullable,非Nullable不需要特殊处理
            var isEquality = opKind == SyntaxKind.EqualsEqualsToken || opKind == SyntaxKind.ExclamationEqualsToken;
            if (isEquality)
            {
                AddUsedModule("System");
                Write(opKind == SyntaxKind.EqualsEqualsToken
                    ? "System.OpEquality"
                    : "System.OpInequality");
            }
            else
            {
                WriteTypeSymbol(symbol.ContainingType, !node.InSameSourceFile(symbol));
                Write('.');

                Write(symbol.Name); //eg: op_Subtraction
            }

            Write('(');
            DisableVisitTrailingTrivia();
            Visit(node.Left);
            EnableVisitTrailingTrivia();
            Write(", ");
            Visit(node.Right);
            Write(')');
        }
    }
}