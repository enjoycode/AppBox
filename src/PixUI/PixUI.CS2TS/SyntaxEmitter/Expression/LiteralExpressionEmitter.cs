using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class LiteralExpressionEmitter : SyntaxEmitter<LiteralExpressionSyntax>
    {
        internal static readonly LiteralExpressionEmitter Default = new();

        private LiteralExpressionEmitter() { }

        internal override void Emit(Emitter emitter, LiteralExpressionSyntax node)
        {
            var kind = node.Kind();
            switch (kind)
            {
                case SyntaxKind.NumericLiteralExpression:
                {
                    var number = node.Token.Text;
                    if (!number.StartsWith("0x"))
                    {
                        var lastChar = number[^1];
                        number = lastChar switch
                        {
                            'f' or 'F' => number[..^1],
                            'l' or 'L' => number[..^1] + "n",
                            _ => number
                        };
                    }

                    emitter.Write(number);
                    break;
                }
                case SyntaxKind.DefaultLiteralExpression:
                case SyntaxKind.NullLiteralExpression:
                    emitter.Write("null"); //TODO:
                    break;
                case SyntaxKind.CharacterLiteralExpression:
                    int charCode = node.Token.ValueText[0];
                    emitter.Write(charCode.ToString()); //直接转换为编码值
                    break;
                case SyntaxKind.StringLiteralExpression:
                {
                    var content = node.Token.ToString();
                    if (content.StartsWith('@'))
                    {
                        emitter.Write('`');
                        emitter.Write(node.Token.ValueText);
                        emitter.Write('`');
                    }
                    else
                    {
                        emitter.Write(content);
                    }

                    break;
                }
                default:
                    emitter.Write(node.ToString());
                    break;
            }

            emitter.VisitTrailingTrivia(node.Token);
        }
    }
}