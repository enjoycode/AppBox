using AppBoxCore;
using AppBoxDesign.CodeGenerator;

namespace AppBoxDesign;

//TODO: 临时用，待实现完整的表达式编辑器后移除
internal sealed class ParseExpression : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var code = args.GetString()!;
        var exp = ExpressionParser.ParseCode(code);
        return new ValueTask<AnyValue>(AnyValue.From(exp));
    }
}