using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class TaskInterceptor : ITSInterceptor
    {
        public void Emit(Emitter emitter, SyntaxNode node, ISymbol symbol)
        {
            if (node is InvocationExpressionSyntax invocation)
            {
                InterceptInvocation(emitter, invocation, symbol);
            }
            else if (node is IdentifierNameSyntax)
            {
                emitter.Write("Promise<void>");
            }
            else if (node is GenericNameSyntax genericName)
            {
                emitter.Write("Promise");
                emitter.Visit(genericName.TypeArgumentList);
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        private void InterceptInvocation(Emitter emitter, InvocationExpressionSyntax node,
            ISymbol symbol)
        {
            //Only support Task.Delay() now
            var memberAccess = (MemberAccessExpressionSyntax)node.Expression;
            var methodName = memberAccess.Name.Identifier.Text;
            if (methodName != "Delay")
                throw new NotImplementedException("Only support Task.Delay() now");

            emitter.Write("new Promise<void>(resolve => setTimeout(() => resolve(),");
            emitter.Visit(node.ArgumentList);
            emitter.Write("))");
        }
    }
}