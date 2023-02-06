using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class ArgumentEmitter : SyntaxEmitter<ArgumentSyntax>
    {
        internal static readonly ArgumentEmitter Default = new();

        private ArgumentEmitter() { }

        internal override void Emit(Emitter emitter, ArgumentSyntax node)
        {
            //TODO: 处理包装ref or out为委托, 以及非ref struct的clone

            if (node.NameColon != null)
                throw new EmitException("Named argument not supported", node.Span);


            var typeInfo = emitter.SemanticModel.GetTypeInfo(node.Expression);
            //先判断是否需要转换charCode为String
            var charCodeToString = false;
            if (emitter.CharCodeToString && typeInfo.Type != null && typeInfo.Type.ToString() == "char")
            {
                charCodeToString = true;
                emitter.Write("String.fromCharCode(");
            }

            //再判断是否需要隐式类型转换
            emitter.TryImplictConversionOrStructClone(typeInfo, node.Expression);
            
            if (charCodeToString)
                emitter.Write(')');
        }
    }
}