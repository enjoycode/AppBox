using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitArgument(ArgumentSyntax node)
        {
            //TODO: 处理包装ref or out为委托, 以及非ref struct的clone

            if (node.NameColon != null)
                throw new EmitException("Named argument not supported", node.Span);


            var typeInfo = SemanticModel.GetTypeInfo(node.Expression);
            //先判断是否需要转换charCode为String
            var charCodeToString = false;
            if (CharCodeToString && typeInfo.Type != null && typeInfo.Type.ToString() == "char")
            {
                charCodeToString = true;
                Write("String.fromCharCode(");
            }

            //再判断是否需要隐式类型转换
            TryImplictConversionOrStructClone(typeInfo, node.Expression);

            if (charCodeToString)
                Write(')');
        }
    }
}