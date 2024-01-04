using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitPrefixUnaryExpression(PrefixUnaryExpressionSyntax node)
    {
        //特殊处理 eg: -1 转换为ConstantExpression
        if (node.Operand is LiteralExpressionSyntax literal && node.OperatorToken.IsKind(SyntaxKind.MinusToken))
        {
            var value = literal.Token.Value;
            // ReSharper disable once HeapView.BoxingAllocation
            value = value switch
            {
                sbyte b => -b,
                short s => -s,
                int i => -i,
                long l => -l,
                float f => -f,
                double d => -d,
                decimal dd => -dd,
                _ => throw new NotImplementedException()
            };
            //以下通过反射报错: System.BadImageFormatException : Bad IL format.
            // var valueType = value!.GetType();
            // var type = typeof(IUnaryNegationOperators<,>).MakeGenericType(valueType, valueType);
            // var method = type.GetMethod("op_UnaryNegation", BindingFlags.Static | BindingFlags.Public);
            // value = method!.Invoke(null, new[] { value });

            var convertedType = GetConvertedType(node);
            return new ConstantExpression(value, convertedType);
        }

        throw new NotImplementedException();
    }
}