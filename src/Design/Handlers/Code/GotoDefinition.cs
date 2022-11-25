using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.FindSymbols;

namespace AppBoxDesign;

internal sealed class GotoDefinition : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var line = args.GetInt();
        var column = args.GetInt();

        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var symbol = await GetDefinitionSymbol(doc, line, column);
        if (symbol?.Locations.IsDefaultOrEmpty != false)
            return AnyValue.Empty;

        //只处理有源码的
        if (!symbol.Locations[0].IsInSource) return AnyValue.Empty;
        var loc = symbol.Locations[0];
        //先判断是否在同一文件内
        if (loc.SourceTree!.FilePath == doc.Name)
        {
            var res = new ReferenceVO
            {
                ModelId = modelNode.Id, Offset = loc.SourceSpan.Start, Length = loc.SourceSpan.Length
            };
            return AnyValue.From(res);
        }

        //再判断是否模型源代码
        var targetModelId = DocNameUtil.TryGetModelIdFromDocName(loc.SourceTree.FilePath);
        if (targetModelId == null) return AnyValue.Empty;
        var targetModelNode = hub.DesignTree.FindModelNode(targetModelId.Value);
        if (targetModelNode == null) return AnyValue.Empty;

        //是否模型类型
        if (symbol is ITypeSymbol)
        {
            return AnyValue.From(new ReferenceVO { ModelId = targetModelNode.Id });
        }

        // 模型成员(eg: 实体属性 or 服务代理的方法 or 视图属性方法等)
        if (targetModelNode.Model.ModelType == ModelType.Entity)
        {
            //判断是否实体成员
            var entityModel = (EntityModel)targetModelNode.Model;
            var member = entityModel.GetMember(symbol.Name, false);
            var res = new ReferenceVO { ModelId = targetModelNode.Id, Location = member?.Name };
            return AnyValue.From(res);
        }

        if (targetModelNode.Model.ModelType == ModelType.Service)
        {
            //到这里肯定是服务代理类的方法，需要转换定位至服务代码的相应位置
            var methodSymbol = await hub.TypeSystem.GetServiceMethodSymbolAsync(targetModelNode, symbol.Name);
            var newLoc = methodSymbol?.Locations[0];
            var res = new ReferenceVO
            {
                ModelId = targetModelNode.Id,
                Offset = newLoc?.SourceSpan.Start ?? -1,
                Length = newLoc?.SourceSpan.Length ?? -1
            };
            return AnyValue.From(res);
        }

        return AnyValue.From(new ReferenceVO
        {
            ModelId = modelNode.Id, Offset = loc.SourceSpan.Start, Length = loc.SourceSpan.Length
        });
    }

    private static async Task<ISymbol?> GetDefinitionSymbol(Document document, int line, int column)
    {
        var sourceText = await document.GetTextAsync();
        var position = sourceText.GetPositionFromLineAndOffset(line, column);
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