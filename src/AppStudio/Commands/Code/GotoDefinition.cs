using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.FindSymbols;

namespace AppBoxDesign;

internal static class GotoDefinition
{
    internal static async Task<Definition?> Execute(ModelId modelId, int position)
    {
        var hub = DesignHub.Current;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var symbol = await GetDefinitionSymbol(doc, position);
        if (symbol?.Locations.IsDefaultOrEmpty != false)
            return null;

        //只处理有源码的
        if (!symbol.Locations[0].IsInSource) return null;
        var loc = symbol.Locations[0];
        //先判断是否在同一文件内
        if (loc.SourceTree!.FilePath == doc.Name)
            return new Definition(modelNode, loc.SourceSpan.Start, loc.SourceSpan.Length);

        //再判断是否模型源代码
        var targetModelId = DocNameUtil.TryGetModelIdFromDocName(loc.SourceTree.FilePath);
        if (targetModelId == null) return null;
        var targetModelNode = hub.DesignTree.FindModelNode(targetModelId.Value);
        if (targetModelNode == null) return null;

        //是否模型类型
        if (symbol is ITypeSymbol)
            return new Definition(targetModelNode, null);

        // 模型成员(eg: 实体属性 or 服务代理的方法 or 视图属性方法等)
        if (targetModelNode.Model.ModelType == ModelType.Entity)
        {
            //判断是否实体构造
            if (symbol is IMethodSymbol methodSymbol && methodSymbol.MethodKind == MethodKind.Constructor)
                return new Definition(targetModelNode, null);

            //判断是否实体成员
            var entityModel = (EntityModel)targetModelNode.Model;
            var member = entityModel.GetMember(symbol.Name, false);
            return new Definition(targetModelNode, member?.Name);
        }

        if (targetModelNode.Model.ModelType == ModelType.Service)
        {
            //到这里肯定是服务代理类的方法，需要转换定位至服务代码的相应位置
            var methodSymbol = await hub.TypeSystem.GetServiceMethodSymbolAsync(targetModelNode, symbol.Name);
            var newLoc = methodSymbol?.Locations[0];
            return new Definition(targetModelNode, newLoc?.SourceSpan.Start ?? -1, newLoc?.SourceSpan.Length ?? -1);
        }

        return new Definition(targetModelNode, loc.SourceSpan.Start, loc.SourceSpan.Length);
    }

    private static async Task<ISymbol?> GetDefinitionSymbol(Document document, int position)
    {
        var symbol = await SymbolFinder.FindSymbolAtPositionAsync(document, position);

        return symbol switch
        {
            INamespaceSymbol => null,
            // Always prefer the partial implementation over the definition
            IMethodSymbol { IsPartialDefinition: true, PartialImplementationPart: var impl } => impl,
            // Don't return property getters/settings/initers
            IMethodSymbol { AssociatedSymbol: IPropertySymbol } => null,
            _ => symbol
        };
    }
}

internal readonly struct Definition : ILocation
{
    public Definition(ModelNode target, string? location)
    {
        Target = target;
        Location = location;
        Offset = -1;
        Length = -1;
    }

    public Definition(ModelNode target, int offset, int length)
    {
        Target = target;
        Location = null;
        Offset = offset;
        Length = length;
    }

    public ModelNode Target { get; init; }
    public string? Location { get; init; }
    public int Offset { get; init; }
    public int Length { get; init; }
}