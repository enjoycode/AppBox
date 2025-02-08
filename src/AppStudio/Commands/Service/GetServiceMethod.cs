using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.FindSymbols;

namespace AppBoxDesign;

/// <summary>
/// 定位服务方法及获取参数
/// </summary>
internal static class GetServiceMethod
{
    internal static async Task<ServiceMethodInfo> GetByPosition(ModelNode modelNode, int position)
    {
        //定位服务入口方法
        var hub = DesignHub.Current;
        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId);
        var semanticModel = await doc!.GetSemanticModelAsync();
        var symbol = await SymbolFinder.FindSymbolAtPositionAsync(semanticModel!, position, hub.TypeSystem.Workspace);
        return GetBySymbol(symbol, modelNode);
    }

    internal static async Task<ServiceMethodInfo> GetByName(DesignHub hub, string methodPath)
    {
        //methodName eg: sys.OrderService.GetOrders
        var sr = methodPath.Split('.');
        var fullName = $"{sr[0]}.Services.{sr[1]}";
        var methodName = sr[2];
        var modelNode = hub.DesignTree.FindModelNodeByFullName(fullName);
        if (modelNode == null)
            throw new Exception("Can't find service model node");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId);
        var semanticModel = await doc!.GetSemanticModelAsync();
        var rootNode = await doc!.GetSyntaxRootAsync();
        var method = rootNode!.DescendantNodes()
            .OfType<MethodDeclarationSyntax>()
            .FirstOrDefault(m => m.Identifier.Text == methodName);
        if (method == null) throw new Exception($"Can't find method: {methodName}");

        var symbol = semanticModel!.GetDeclaredSymbol(method);
        return GetBySymbol(symbol, modelNode);
    }

    private static ServiceMethodInfo GetBySymbol(ISymbol? symbol, ModelNode modelNode)
    {
        if (symbol == null)
            throw new Exception("Can't find service method");
        if (symbol.Kind != SymbolKind.Method)
            throw new Exception("Not a method");
        if (symbol.ContainingType.ToString() !=
            modelNode.Model.Name) //$"{modelNode.AppNode.ID}.ServiceLogic.{modelNode.Model.Name}")
            throw new Exception("Not a service method");
        if (symbol.DeclaredAccessibility.ToString() != "Public")
            throw new Exception("Not a public service method");

        var method = symbol as IMethodSymbol;

        var methodParameters = new ServiceMethodParameterInfo[method!.Parameters.Length];
        for (var i = 0; i < method.Parameters.Length; i++)
        {
            methodParameters[i] = new ServiceMethodParameterInfo
                { Name = method.Parameters[i].Name, Type = method.Parameters[i].Type.ToString()! };
        }

        var methodInfo = new ServiceMethodInfo { Name = method.Name, Args = methodParameters };
        return methodInfo;
    }
}