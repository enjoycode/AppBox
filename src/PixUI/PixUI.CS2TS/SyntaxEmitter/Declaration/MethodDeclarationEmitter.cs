using System.Linq;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class MethodDeclarationEmitter : SyntaxEmitter<MethodDeclarationSyntax>
    {
        internal static readonly MethodDeclarationEmitter Default = new();

        private MethodDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, MethodDeclarationSyntax node)
        {
            //暂时忽略一些特殊方法 eg: GetHashCode
            if (TryIgnoreSome(emitter, node)) return;

            var isAbstract = node.HasAbstractModifier();
            if (isAbstract && emitter.ToJavaScript) return;

            if (node.IsTSRawScript(out var script))
            {
                emitter.Write(script!);
                return;
            }

            emitter.WriteLeadingTrivia(node);
            if (node.Parent is not InterfaceDeclarationSyntax)
                emitter.WriteModifiers(node.Modifiers);

            // method name, maybe renamed by TSRenameAttribute
            var methodName = node.Identifier.Text;
            TryRenameMethod(node, ref methodName);
            emitter.Write(methodName);

            // generic type parameters
            if (!emitter.ToJavaScript)
                emitter.WriteTypeParameters(node.TypeParameterList, node.ConstraintClauses);

            // parameters
            emitter.Write('(');
            emitter.VisitSeparatedList(node.ParameterList.Parameters);
            emitter.Write(')');

            // return type
            var isReturnVoid = node.IsVoidReturnType();
            if (!emitter.ToJavaScript)
            {
                if (!isReturnVoid)
                {
                    emitter.Write(": ");
                    emitter.DisableVisitLeadingTrivia();
                    emitter.Visit(node.ReturnType);
                    emitter.EnableVisitLeadingTrivia();
                }
                else if (node.Parent is InterfaceDeclarationSyntax || node.HasAbstractModifier())
                {
                    emitter.Write(": void");
                }

                // TrailingTrivia when has ConstraintClauses
                if (node.ConstraintClauses.Any())
                    emitter.WriteTrailingTrivia(node.ConstraintClauses.Last());
                else
                    emitter.VisitTrailingTrivia(node.ParameterList.CloseParenToken);
            }

            // abstract
            if (isAbstract)
            {
                emitter.VisitToken(node.SemicolonToken);
                return;
            }

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
                if (!isReturnVoid && node.ExpressionBody.Expression is not ThrowExpressionSyntax)
                    emitter.Write("return ");
                emitter.Visit(node.ExpressionBody!.Expression);
                emitter.Write("; }");
                emitter.VisitTrailingTrivia(node.SemicolonToken);

                return;
            }

            // interface method
            emitter.VisitToken(node.SemicolonToken);
        }

        /// <summary>
        /// 暂忽略一些特殊方法的转换
        /// </summary>
        private static bool TryIgnoreSome(Emitter emitter, MethodDeclarationSyntax node)
        {
            if (node.Modifiers.Any(m => m.Kind() == SyntaxKind.OverrideKeyword))
            {
                //TODO:精确判断，暂简单实现
                if (node.Identifier.Text == "GetHashCode" &&
                    node.ParameterList.Parameters.Count == 0)
                    return true;

                if (node.Identifier.Text == "Equals" && node.ParameterList.Parameters.Count == 1)
                {
                    var para = node.ParameterList.Parameters[0];
                    var typeString = para.Type!.ToString();
                    return typeString.StartsWith("object");
                }
            }

            return false;
        }

        /// <summary>
        /// 用于重命名
        /// 1.标记为TSRenameAttribute的方法定义,以解决无法重载方法的问题
        /// 2.override ToString()
        /// </summary>
        private static void TryRenameMethod(MethodDeclarationSyntax node, ref string name)
        {
            if (node.Identifier.Text == "ToString" && node.ParameterList.Parameters.Count == 0)
            {
                name = "toString";
                return;
            }

            var attribute =
                SyntaxExtensions.TryGetAttribute(node.AttributeLists, Emitter.IsTSRenameAttribute);
            if (attribute == null) return;

            var nameLiteral =
                (LiteralExpressionSyntax)attribute.ArgumentList!.Arguments[0].Expression;
            name = nameLiteral.Token.ValueText;
        }
    }
}