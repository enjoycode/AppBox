using System;
using System.Diagnostics;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitInvocationExpression(InvocationExpressionSyntax node)
        {
            //特例处理nameof(xxx)
            if (TryEmitNameof(node))
                return;

            var symbolInfo = SemanticModel.GetSymbolInfo(node);
            Debug.Assert(symbolInfo.Symbol is IMethodSymbol);
            var methodSymbol = (IMethodSymbol)symbolInfo.Symbol!;

            //特殊处理Equals(a,b) or ReferenceEquals(a,b)
            if (TryEmitEquals(node, methodSymbol))
                return;

            //尝试转换EnumValue.ToString()
            if (TryEmitEnumToString(node, methodSymbol))
                return;

            //尝试Delegate.Invoke
            if (TryEmitDelegateInvoke(node, methodSymbol))
                return;

            //尝试转换系统方法调用, eg: Console.Write(), Math.Max()
            if (methodSymbol.IsSystemNamespace())
            {
                var systemType = methodSymbol.ContainingType.IsGenericType
                    ? methodSymbol.ContainingType.OriginalDefinition
                    : methodSymbol.ContainingType;
                if (SystemInterceptorMap.TryGetInterceptor(systemType.ToString(), out var systemInterceptor))
                {
                    WriteLeadingTrivia(node);
                    systemInterceptor.Emit(this, node, methodSymbol);
                    return;
                }
            }

            //尝试使用拦截器
            if (TryGetInterceptor(methodSymbol, out var interceptor))
            {
                interceptor!.Emit(this, node, methodSymbol);
                return;
            }

            //尝试特殊处理调用AppBox的服务
            if (TryEmitInvokeAppBoxService(node, methodSymbol))
                return;
            //尝试特殊处理Entity.Observe() or RxEntity.Observe()
            if (TryEmitEntityObserve(node, methodSymbol))
                return;
            //尝试处理扩展方法调用
            if (TryEmitExtensionMethod(node, methodSymbol))
                return;

            IgnoreDelegateBind = true;
            Visit(node.Expression);
            IgnoreDelegateBind = false;

            VisitToken(node.ArgumentList.OpenParenToken);
            var argIndex = 0;
            foreach (var item in node.ArgumentList.Arguments.GetWithSeparators())
            {
                if (item.IsToken)
                {
                    VisitToken(item.AsToken());
                    continue;
                }

                var argNode = (ArgumentSyntax)item.AsNode()!;
                var isNullArg = argNode.Expression is LiteralExpressionSyntax literal &&
                                literal.Kind() == SyntaxKind.NullLiteralExpression;
                //需要判断是否params参数，是则加...前缀
                if (!isNullArg && methodSymbol.Parameters[argIndex].IsParams)
                    Write("...");

                Visit(argNode);

                //特殊处理JsNativeArray
                if (!isNullArg && methodSymbol.Parameters[argIndex].IsParams)
                {
                    var jsArrayType = GetJsNativeArrayType(methodSymbol.Parameters[argIndex].Type);
                    if (jsArrayType != null)
                        Write(".ToArray()");
                }

                argIndex++;
            }

            VisitToken(node.ArgumentList.CloseParenToken);
        }

        private bool TryEmitEnumToString(InvocationExpressionSyntax node, IMethodSymbol symbol)
        {
            if (symbol.ContainingType.SpecialType == SpecialType.System_Enum && symbol.Name == "ToString")
            {
                var memberAccess = (MemberAccessExpressionSyntax)node.Expression;
                var enumTypeSymbol = SemanticModel.GetTypeInfo(memberAccess.Expression).Type;

                WriteTypeSymbol(enumTypeSymbol!, true);
                Write('[');
                Visit(memberAccess.Expression);
                Write(']');
                return true;
            }

            return false;
        }

        private bool TryEmitNameof(InvocationExpressionSyntax node)
        {
            if (node.Expression is not IdentifierNameSyntax { Identifier: { Text: "nameof" } })
                return false;

            WriteLeadingTrivia(node);
            Write('"');
            Write(node.ArgumentList.Arguments[0].Expression.ToString());
            Write('"');
            WriteTrailingTrivia(node);

            return true;
        }

        private bool TryEmitEquals(InvocationExpressionSyntax node, IMethodSymbol methodSymbol)
        {
            if (node.Expression is IdentifierNameSyntax
                {
                    Identifier: { Text: "ReferenceEquals" or "Equals" }
                } identifier
                &&
                methodSymbol.ContainingType.SpecialType == SpecialType.System_Object)
            {
                WriteLeadingTrivia(node);
                var isEquals = identifier.Identifier.Text == "Equals";
                if (isEquals)
                {
                    AddUsedModule("System");
                    Write("System.Equals");
                }
                
                Write('(');
                Visit(node.ArgumentList.Arguments[0]);
                Write(isEquals ? ", " : " === ");
                Visit(node.ArgumentList.Arguments[1]);
                Write(')');
                return true;
            }

            return false;
        }

        private bool TryEmitDelegateInvoke(InvocationExpressionSyntax node, IMethodSymbol symbol)
        {
            //先判断是否事件
            var isEvent = false;
            var isConditionalAceess = false;
            if (node.Parent is ConditionalAccessExpressionSyntax accessExpressionSyntax)
            {
                isEvent = SemanticModel.GetSymbolInfo(accessExpressionSyntax.Expression)
                    .Symbol is IEventSymbol;
                isConditionalAceess = true;
            }
            else
            {
                isEvent = SemanticModel.GetSymbolInfo(node.Expression).Symbol is IEventSymbol;
            }

            if (isEvent || (node.Expression.GetLastToken().Text == "Invoke" &&
                            symbol.ContainingType.IsInherits(TypeOfDelegate)))
            {
                if (!isEvent)
                {
                    Visit(node.Expression);
                    //替换名称 Invoke => call
                    RemoveLast(symbol.Name.Length);
                    Write("call");
                }
                else
                {
                    if (isConditionalAceess) RemoveLast(1); //remove '?'
                    else Visit(node.Expression);
                    Write(".Invoke");
                }

                VisitToken(node.ArgumentList.OpenParenToken);
                if (!isEvent)
                    Write(node.ArgumentList.Arguments.Count > 0 ? "this, " : "this");
                VisitSeparatedList(node.ArgumentList.Arguments);
                VisitToken(node.ArgumentList.CloseParenToken);

                return true;
            }

            return false;
        }

        private bool TryEmitInvokeAppBoxService(InvocationExpressionSyntax node, IMethodSymbol symbol)
        {
            if (!symbol.IsAppBoxServiceMethod()) return false;

            //需要检查返回类型内是否包含实体，是则加入引用模型列表内
            if (AppBoxContext != null && !symbol.ReturnsVoid)
                symbol.ReturnType.CheckTypeHasAppBoxModel(AppBoxContext.FindModel, AppBoxContext.AddUsedModel);

            //开始转换为前端服务调用
            AddUsedModule("AppBoxClient");
            Write("AppBoxClient.Channel.Invoke('");
            //参数1: 服务名称 eg: sys.HelloService.SayHello
            Write(symbol.ContainingNamespace.ContainingNamespace.Name);
            Write('.');
            Write(symbol.ContainingType.Name);
            Write('.');
            Write(symbol.Name);
            Write("'");
            //参数2: 服务方法参数列表
            if (node.ArgumentList.Arguments.Count > 0)
            {
                Write(", [");
                VisitSeparatedList(node.ArgumentList.Arguments);
                Write(']');
            }
            else
            {
                Write(", null");
            }

            //参数3: 传入根据视图模型引用的实体模型所生成的EntityFactory
            Write(", EntityFactories");

            Write(')');

            return true;
        }

        private bool TryEmitEntityObserve(InvocationExpressionSyntax node, IMethodSymbol symbol)
        {
            var typeFullName = symbol.ContainingType.ToString();
            if (typeFullName != "AppBoxClient.EntityExtensions" && !typeFullName.StartsWith("AppBoxClient.RxEntity<"))
                return false;

            //方法参数暂只支持指向实体成员的表达式, eg: e => e.Name
            var arg = node.ArgumentList.Arguments[0];
            if (arg.Expression is not LambdaExpressionSyntax argLambda)
                throw new Exception("Only support LambdaExpression now.");
            if (argLambda.ExpressionBody is not MemberAccessExpressionSyntax memberAccess)
                throw new Exception("Only support MemberAccess now.");

            var propSymbol = (IPropertySymbol)SemanticModel.GetSymbolInfo(memberAccess).Symbol!;
            if (!propSymbol.ContainingType.IsAppBoxEntity(AppBoxContext!.FindModel))
                throw new Exception("Must be a Entity");

            var entityFullName = propSymbol.ContainingType.ToString();
            var memberName = memberAccess.Name.Identifier.Text;
            var memberId = AppBoxContext!.FindEntityMemberId(entityFullName, memberName);

            Visit(node.Expression);
            Write('(');
            Write(memberId.ToString());
            Write(',');
            Write($"e=>e.{memberName},");
            Write($"(e,v)=>e.{memberName}=v");
            Write(')');
            WriteTrailingTrivia(node);

            return true;
        }

        private bool TryEmitExtensionMethod(InvocationExpressionSyntax node, IMethodSymbol symbol)
        {
            if (!symbol.IsExtensionMethod || symbol.IsSystemNamespace() /*暂排除系统库*/)
                return false;
            if (node.Expression is not MemberAccessExpressionSyntax memberAccess)
                return false;

            WriteTypeSymbol(symbol.ContainingType, true);
            Write('.');
            Visit(memberAccess.Name);

            VisitToken(node.ArgumentList.OpenParenToken);
            Visit(memberAccess.Expression);
            Write(',');
            VisitSeparatedList(node.ArgumentList.Arguments);
            VisitToken(node.ArgumentList.CloseParenToken);

            return true;
        }
    }
}