using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class OperatorDeclarationEmitter : SyntaxEmitter<OperatorDeclarationSyntax>
    {
        internal static readonly OperatorDeclarationEmitter Default = new();

        private OperatorDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, OperatorDeclarationSyntax node)
        {
            //TODO:判断相同操作符有无重载，有则抛不支持异常

            emitter.WriteLeadingTrivia(node);
            emitter.WriteModifiers(node.Modifiers);

            // method name
            emitter.Write(GetOpName(node.OperatorToken));

            // parameters
            emitter.Write('(');
            emitter.VisitSeparatedList(node.ParameterList.Parameters);
            emitter.Write(')');

            // return type
            // var isReturnVoid = node.IsVoidReturnType();
            // if (!isReturnVoid)
            // {
            emitter.Write(": ");
            emitter.DisableVisitLeadingTrivia();
            emitter.Visit(node.ReturnType);
            emitter.EnableVisitLeadingTrivia();
            // }
            // else if (node.Parent is InterfaceDeclarationSyntax || node.HasAbstractModifier())
            // {
            //     emitter.Write(": void");
            // }

            // body
            if (node.Body != null)
            {
                emitter.Visit(node.Body);
                return;
            }

            //TypeScript不支持ExpressionBody
            if (node.ExpressionBody != null)
            {
                emitter.Write(" { ");
                if ( /*!isReturnVoid &&*/
                    node.ExpressionBody.Expression is not ThrowExpressionSyntax)
                    emitter.Write("return ");
                emitter.Visit(node.ExpressionBody!.Expression);
                emitter.Write("; }");
                emitter.VisitTrailingTrivia(node.SemicolonToken);
            }
        }

        private static string GetOpName(SyntaxToken opToken)
        {
            return opToken.Text switch
            {
                "+" => "op_Addition",
                "-" => "op_Subtraction",
                "*" => "op_Multiply",
                "/" => "op_Division",

                "==" => "op_Equality",
                "!=" => "op_Inequality",
                ">" => "op_GreaterThan",
                ">=" => "op_GreaterThanOrEqual",
                "<" => "op_LessThan",
                "<=" => "op_LessThanOrEqual",
                _ => throw new NotSupportedException("Not supported override operator: " +
                                                     opToken.Text)
            };
        }
    }
}