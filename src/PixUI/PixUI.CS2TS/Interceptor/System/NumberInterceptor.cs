using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class NumberInterceptor : ITSInterceptor
    {
        internal static readonly NumberInterceptor Default = new();

        private NumberInterceptor() { }

        void ITSInterceptor.Emit(Emitter emitter, SyntaxNode node, ISymbol symbol)
        {
            if (node is MemberAccessExpressionSyntax memberAccess)
            {
                InterceptMemberAccess(emitter, memberAccess, symbol);
            }
            else if (node is InvocationExpressionSyntax invocation)
            {
                InterceptInvocation(emitter, invocation, (IMethodSymbol)symbol);
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        private static void InterceptInvocation(Emitter emitter, InvocationExpressionSyntax node,
            IMethodSymbol symbol)
        {
            emitter.Visit(node.Expression);
            emitter.VisitToken(node.ArgumentList.OpenParenToken);
            emitter.VisitSeparatedList(node.ArgumentList.Arguments);
            emitter.VisitToken(node.ArgumentList.CloseParenToken);
        }

        private static void InterceptMemberAccess(Emitter emitter, MemberAccessExpressionSyntax node, ISymbol symbol)
        {
            //TODO:

            var name = node.Name.Identifier.Text;

            if (name == "ToString")
            {
                emitter.Visit(node.Expression);
                emitter.Write(".toString");
                return;
            }

            if (name == "IsFinite")
            {
                emitter.Write("isFinite");
                return;
            }

            if (name == "NaN")
            {
                emitter.Write("NaN");
                return;
            }

            var specialType = symbol.ContainingType.SpecialType;
            if (specialType == SpecialType.System_Byte)
            {
                switch (name)
                {
                    case "MinValue":
                        emitter.Write('0');
                        break;
                    case "MaxValue":
                        emitter.Write("255");
                        break;
                    default:
                        throw new NotImplementedException();
                }
            }
            else if (specialType is SpecialType.System_Single or SpecialType.System_Double)
            {
                switch (name)
                {
                    case "MinValue":
                        emitter.Write("Number.MIN_VALUE");
                        break;
                    case "MaxValue":
                        emitter.Write("Number.MAX_VALUE");
                        break;
                    case "PositiveInfinity":
                        emitter.Write("Number.POSITIVE_INFINITY");
                        break;
                    case "IsNaN":
                        emitter.Write("Number.isNaN");
                        break;
                    case "Epsilon":
                        emitter.Write("Number.EPSILON");
                        break;
                    case "IsFinite":
                        emitter.Write("Number.isFinite");
                        break;
                    case "IsInfinity":
                        emitter.Write("!Number.isFinite");
                        break;
                    default:
                        throw new NotImplementedException($"{node} at File: {node.SyntaxTree.FilePath}");
                }
            }
            else if (specialType is SpecialType.System_Int32)
            {
                switch (name)
                {
                    case "MinValue":
                        emitter.Write("-2147483648");
                        break;
                    case "MaxValue":
                        emitter.Write("2147483647");
                        break;
                    default:
                        throw new NotImplementedException($"{node} at File: {node.SyntaxTree.FilePath}");
                }
            }
            else if (specialType is SpecialType.System_Int64)
            {
                switch (name)
                {
                    case "MinValue":
                        emitter.Write("BigInt('-9223372036854775808')");
                        break;
                    case "MaxValue":
                        emitter.Write("BigInt('9223372036854775807')");
                        break;
                    default:
                        throw new NotImplementedException($"{node} at File: {node.SyntaxTree.FilePath}");
                }
            }
        }
    }
}