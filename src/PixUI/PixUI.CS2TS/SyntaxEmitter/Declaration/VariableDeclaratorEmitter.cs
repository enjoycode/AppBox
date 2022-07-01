using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class VariableDeclaratorEmitter : SyntaxEmitter<VariableDeclaratorSyntax>
    {
        internal static readonly VariableDeclaratorEmitter Default = new();

        private VariableDeclaratorEmitter() { }

        internal override void Emit(Emitter emitter, VariableDeclaratorSyntax node)
        {
            var parent = (VariableDeclarationSyntax)node.Parent!;
            if (parent.Parent is FieldDeclarationSyntax fieldDeclaration)
            {
                emitter.WriteModifiers(fieldDeclaration.Modifiers);
            }

            emitter.Write(node.Identifier.Text);
            if (!emitter.ToJavaScript && parent.Type is not IdentifierNameSyntax { IsVar: true })
            {
                // 不再需要，已关闭ts的严格null检查
                // if (node.Initializer != null && node.Initializer.Value.Kind() ==
                //     SyntaxKind.SuppressNullableWarningExpression)
                // {
                //     //definite assignment assertion
                //     emitter.Write('!');
                // }

                emitter.Write(": ");
                emitter.Visit(parent.Type);
            }

            if (node.Initializer != null)
            {
                // 忽略 xx = null!
                if (node.Initializer.Value is PostfixUnaryExpressionSyntax postfixUnary &&
                    postfixUnary.Operand.Kind() == SyntaxKind.NullLiteralExpression) return;

                emitter.Write(" = ");

                //判断是否需要隐式转换类型
                var typeInfo = emitter.SemanticModel.GetTypeInfo(node.Initializer.Value);
                emitter.TryImplictConversionOrStructClone(typeInfo, node.Initializer.Value);
            }
            else
            {
                //尝试写入非空值类型的默认值，暂简单排除readonly field declaration(肯定由构造初始化值)
                if (parent.Parent is FieldDeclarationSyntax field &&
                    field.HasReadOnlyModifier()) return;
                emitter.TryWriteDefaultValueForValueType(parent.Type, node);
            }
        }
    }
}