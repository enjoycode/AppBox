using System.Text;
using AppBoxCore;

namespace AppBoxDesign.CodeGenerator;

/// <summary>
/// 将表达式转换为代码(用于表达式编辑器)
/// </summary>
public sealed class ExpressionCodeBuilder : IExpressionCodeBuilder, IDisposable
{
    public ExpressionCodeBuilder(DesignContext? context = null)
    {
        _context = context;
        _sb = StringBuilderCache.Acquire();
    }

    private readonly DesignContext? _context;
    private readonly StringBuilder _sb;

    public StringBuilder StringBuilder => _sb;

    public string GetCode() => _sb.ToString();

    public void Dispose() => StringBuilderCache.Release(_sb);

    public string ResolveModelTypeName(ModelId modelId)
    {
        throw new NotImplementedException();
    }
}