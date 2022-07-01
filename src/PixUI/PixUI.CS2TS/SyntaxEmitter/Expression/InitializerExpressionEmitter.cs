using System;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class InitializerExpressionEmitter : SyntaxEmitter<InitializerExpressionSyntax>
    {
        internal static readonly InitializerExpressionEmitter Default = new();

        private InitializerExpressionEmitter() { }

        internal override void Emit(Emitter emitter, InitializerExpressionSyntax node)
        {
            var typeInfo = emitter.SemanticModel.GetTypeInfo(node.Parent!);
            if (typeInfo.Type!.IsImplements(emitter.TypeOfIDictionary))
            {
                throw new NotImplementedException("Dictionary initializer");
            }

            emitter.Write(".Init(");
            var children = node.Parent!.ChildNodes().ToList();
            var index = children.IndexOf(node);
            if (index > 0)
                emitter.WriteTrailingTrivia(children[index - 1]);
            var isCollection = typeInfo.Type!.IsImplements(emitter.TypeOfICollection);

            emitter.VisitLeadingTrivia(node.OpenBraceToken);
            emitter.Write(isCollection ? '[' : '{');
            emitter.VisitTrailingTrivia(node.OpenBraceToken);

            var seps = node.Expressions.GetSeparators().ToArray();
            for (var i = 0; i < node.Expressions.Count; i++)
            {
                var expression = node.Expressions[i];
                
                emitter.WriteLeadingTrivia(expression);
                
                if (expression is AssignmentExpressionSyntax assignment)
                {
                    //Do not Visit assignment.Left
                    var memberName = assignment.Left.ToString();
                    emitter.TryRename(
                        emitter.SemanticModel.GetSymbolInfo(assignment.Left).Symbol!,
                        ref memberName);
                    emitter.Write(memberName);
                    emitter.Write(": ");

                    //这里同样需要隐式转换或结构体Clone
                    var valueTypeInfo = emitter.SemanticModel.GetTypeInfo(assignment.Right);
                    emitter.TryImplictConversionOrStructClone(valueTypeInfo, assignment.Right);
                }
                else
                {
                    emitter.Visit(expression);
                }

                if (i < seps.Length)
                {
                    var sepToken = node.Expressions.GetSeparator(i);
                    emitter.VisitToken(sepToken);
                }
            }

            emitter.VisitLeadingTrivia(node.CloseBraceToken);
            emitter.Write(isCollection ? ']' : '}');
            emitter.Write(')');
            emitter.VisitTrailingTrivia(node.CloseBraceToken);
        }
    }
}