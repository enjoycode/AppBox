using Microsoft.CodeAnalysis;
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
                throw new EmitException($"out argument not supported at File: {node.SyntaxTree.FilePath}", node.Span);

            var isRefArg = node.RefKindKeyword.Kind() == SyntaxKind.RefKeyword;
            //先判断处理按引用传参
            if (isRefArg)
            {
                var symbol = SemanticModel.GetSymbolInfo(node.Expression).Symbol;
                if (symbol is IParameterSymbol { RefKind: RefKind.Ref }) 
                {
                    //ref至参数且参数同样是ref的，则不需要转换了
                    Write(node.Expression.ToString()); //直接写入参数名称
                }
                else
                {
                    AddUsedModule("System");
                    Write("new System.Ref(()=>");
                    Visit(node.Expression);
                    Write(", ");
                    Write("$v=>");
                    Visit(node.Expression);
                    Write("=$v)");
                }
                return;
            }

            var typeInfo = SemanticModel.GetTypeInfo(node.Expression);
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