using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

/// <summary>
/// 用于代码编辑器内重命名
/// </summary>
/// <remarks>
/// 1.Symbol是服务模型类或服务方法,需要走重命名模型的流程
/// 2.Symbol是局部变量或方法参数或非服务方法,走简化流程
/// </remarks>
internal static class RenameSymbol
{
    internal static async Task Execute(DesignContext context, DocumentId docId, int position)
    {
        var doc = context.Workspace.CurrentSolution.GetDocument(docId);
        if (doc == null)
            return;

        var symbol = await doc.GetSymbolAtPosition(position);
        if (symbol?.Locations.IsDefaultOrEmpty != false)
            return;

        //只处理有源码的
        if (!symbol.Locations[0].IsInSource) return;
        var loc = symbol.Locations[0];
        //先判断是否在同一文件内
        if (loc.SourceTree!.FilePath != doc.Name)
            return;
        //TODO: 表达式编辑器禁止重命名除LocalSymbol以外的
        //var isExpressionEditor = doc.Name == DocNameUtil.ExpressionDocName;

        //TODO:暂只实现LocalSymbol
        if (symbol is not ILocalSymbol localSymbol)
            return;


        throw new NotImplementedException();
    }
}