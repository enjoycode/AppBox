using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.CSharp;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitArgument(ArgumentSyntax node)
        {
            if (node.NameColon != null)
                throw new EmitException("Named argument not supported", node.Span);
            if (node.RefKindKeyword.Kind() == SyntaxKind.OutKeyword)
                throw new EmitException("out argument not supported", node.Span);

            var isRefArg = node.RefKindKeyword.Kind() == SyntaxKind.RefKeyword;
            var typeInfo = SemanticModel.GetTypeInfo(node.Expression);

            //先判断处理按引用传参
            if (isRefArg)
            {
                AddUsedModule("System");
                Write("new System.Ref(()=>");
                Visit(node.Expression);
                Write(", ");
                Write("$v=>");
                Visit(node.Expression);
                Write("=$v)");
            }
            else
            {
                //判断是否需要转换charCode为String
                var charCodeToString = false;
                if (CharCodeToString && typeInfo.Type != null && typeInfo.Type.ToString() == "char")
                {
                    charCodeToString = true;
                    Write("String.fromCharCode(");
                }

                //判断是否需要隐式类型转换
                TryImplictConversionOrStructClone(typeInfo, node.Expression);

                if (charCodeToString)
                    Write(')');
            }
        }
    }
}