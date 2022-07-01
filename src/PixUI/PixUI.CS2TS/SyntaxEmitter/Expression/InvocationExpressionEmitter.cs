using System;
using System.Linq;
using System.Diagnostics;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class InvocationExpressionEmitter : SyntaxEmitter<InvocationExpressionSyntax>
    {
        internal static readonly InvocationExpressionEmitter Default = new();

        private InvocationExpressionEmitter() { }

        internal override void Emit(Emitter emitter, InvocationExpressionSyntax node)
        {
            //特例处理 eg: nameof(xxx)等
            if (TryEmitNameof(emitter, node) || TryEmitReferenceEquals(emitter, node) ||
                TryEmitIsNullOrEmpty(emitter, node) /*TODO: move this to StringInterceptor*/)
                return;

            var symbolInfo = emitter.SemanticModel.GetSymbolInfo(node);
            Debug.Assert(symbolInfo.Symbol is IMethodSymbol);
            var methodSymbol = (IMethodSymbol)symbolInfo.Symbol!;

            //尝试转换EnumValue.ToString()
            if (TryEmitEnumToString(emitter, node, methodSymbol))
                return;

            //尝试Delegate.Invoke
            if (TryEmitDelegateInvoke(emitter, node, methodSymbol))
                return;

            //尝试转换系统方法调用, eg: Console.Write(), Math.Max()
            if (methodSymbol.IsSystemNamespace() &&
                SystemInterceptorMap.TryGetInterceptor(methodSymbol.ContainingType.ToString(),
                    out var systemInterceptor))
            {
                emitter.WriteLeadingTrivia(node);
                systemInterceptor.Emit(emitter, node, methodSymbol);
                return;
            }

            //尝试使用拦截器
            if (emitter.TryGetInterceptor(methodSymbol, out var interceptor))
            {
                interceptor!.Emit(emitter, node, methodSymbol);
                return;
            }

            //尝试特殊处理调用AppBox的服务
            if (TryEmitInvokeAppBoxService(emitter, node, methodSymbol))
                return;

            emitter.NeedGenericTypeArguments = false;
            emitter.IgnoreDelegateBind = true;
            emitter.Visit(node.Expression);
            emitter.IgnoreDelegateBind = false;
            emitter.NeedGenericTypeArguments = true;
            emitter.VisitToken(node.ArgumentList.OpenParenToken);
            emitter.VisitSeparatedList(node.ArgumentList.Arguments);
            emitter.VisitToken(node.ArgumentList.CloseParenToken);
        }

        private static bool TryEmitEnumToString(Emitter emitter, InvocationExpressionSyntax node,
            IMethodSymbol symbol)
        {
            if (symbol.ContainingType.SpecialType == SpecialType.System_Enum &&
                symbol.Name == "ToString")
            {
                var memberAccess = (MemberAccessExpressionSyntax)node.Expression;
                var enumTypeSymbol =
                    emitter.SemanticModel.GetTypeInfo(memberAccess.Expression).Type;

                emitter.WriteTypeSymbol(enumTypeSymbol!, true);
                emitter.Write('[');
                emitter.Visit(memberAccess.Expression);
                emitter.Write(']');
                return true;
            }

            return false;
        }

        private static bool TryEmitInvokeAppBoxService(Emitter emitter,
            InvocationExpressionSyntax node, IMethodSymbol symbol)
        {
            if (symbol.ContainingNamespace.Name != "Services") return false;
            var interceptorAttribute = symbol.GetAttributes()
                .SingleOrDefault(t => t.AttributeClass != null &&
                                      t.AttributeClass.ToString() ==
                                      "System.Reflection.InvocationInterceptorAttribute");
            if (interceptorAttribute == null) return false;

            //需要检查返回类型内是否包含实体，是则加入引用模型列表内
            if (!symbol.ReturnsVoid)
                emitter.CheckTypeHasAppBoxModel(symbol.ReturnType);

            //开始转换为前端服务调用
            emitter.AddUsedModule("AppBoxClient");
            emitter.Write("AppBoxClient.Channel.Invoke('");
            //参数1: 服务名称 eg: sys.HelloService.SayHello
            emitter.Write(symbol.ContainingNamespace.ContainingNamespace.Name);
            emitter.Write('.');
            emitter.Write(symbol.ContainingType.Name);
            emitter.Write('.');
            emitter.Write(symbol.Name);
            emitter.Write("'");
            //参数2: 服务方法参数列表
            if (node.ArgumentList.Arguments.Count > 0)
            {
                emitter.Write(", [");
                emitter.VisitSeparatedList(node.ArgumentList.Arguments);
                emitter.Write(']');
            }
            else
            {
                emitter.Write(", null");
            }

            //参数3: 传入根据视图模型引用的实体模型所生成的EntityFactory
            emitter.Write(", EntityFactories");

            emitter.Write(')');

            return true;
        }

        private static bool TryEmitNameof(Emitter emitter, InvocationExpressionSyntax node)
        {
            if (node.Expression is not IdentifierNameSyntax { Identifier: { Text: "nameof" } })
                return false;

            emitter.WriteLeadingTrivia(node);
            emitter.Write('"');
            emitter.Write(node.ArgumentList.Arguments[0].Expression.ToString());
            emitter.Write('"');
            emitter.WriteTrailingTrivia(node);

            return true;
        }

        private static bool TryEmitIsNullOrEmpty(Emitter emitter, InvocationExpressionSyntax node)
        {
            if (node.Expression is MemberAccessExpressionSyntax memberAccess)
            {
                if (memberAccess.Name.Identifier.Text == "IsNullOrEmpty")
                {
                    var typeSymbol = emitter.SemanticModel.GetSymbolInfo(memberAccess.Expression)
                        .Symbol;
                    if (typeSymbol is { Name: "String" })
                    {
                        emitter.AddUsedModule("System");
                        emitter.WriteLeadingTrivia(node);
                        emitter.Write("System.IsNullOrEmpty(");
                        emitter.Visit(node.ArgumentList.Arguments[0]);
                        emitter.Write(')');
                        emitter.WriteTrailingTrivia(node);
                        return true;
                    }
                }
            }

            return false;
        }

        private static bool TryEmitReferenceEquals(Emitter emitter, InvocationExpressionSyntax node)
        {
            //TODO:
            if (node.Expression is IdentifierNameSyntax { Identifier: { Text: "ReferenceEquals" } })
            {
                emitter.Write('(');
                emitter.Visit(node.ArgumentList.Arguments[0]);
                emitter.Write(" === ");
                emitter.Visit(node.ArgumentList.Arguments[1]);
                emitter.Write(')');
                return true;
            }

            return false;
        }

        private static bool TryEmitDelegateInvoke(Emitter emitter, InvocationExpressionSyntax node,
            IMethodSymbol symbol)
        {
            //先判断是否事件
            var isEvent = false;
            var isConditionalAceess = false;
            if (node.Parent is ConditionalAccessExpressionSyntax accessExpressionSyntax)
            {
                isEvent = emitter.SemanticModel.GetSymbolInfo(accessExpressionSyntax.Expression)
                    .Symbol is IEventSymbol;
                isConditionalAceess = true;
            }
            else
            {
                isEvent =
                    emitter.SemanticModel.GetSymbolInfo(node.Expression).Symbol is IEventSymbol;
            }

            if (isEvent || (node.Expression.GetLastToken().Text == "Invoke" &&
                            symbol.ContainingType.IsInherits(emitter.TypeOfDelegate)))
            {
                if (!isEvent)
                {
                    emitter.Visit(node.Expression);
                    //替换名称 Invoke => call
                    emitter.RemoveLast(symbol.Name.Length);
                    emitter.Write("call");
                }
                else
                {
                    if (isConditionalAceess) emitter.RemoveLast(1); //remove '?'
                    else emitter.Visit(node.Expression);
                    emitter.Write(".Invoke");
                }

                emitter.VisitToken(node.ArgumentList.OpenParenToken);
                if (!isEvent)
                    emitter.Write(node.ArgumentList.Arguments.Count > 0 ? "this, " : "this");
                emitter.VisitSeparatedList(node.ArgumentList.Arguments);
                emitter.VisitToken(node.ArgumentList.CloseParenToken);

                return true;
            }

            return false;
        }
    }
}