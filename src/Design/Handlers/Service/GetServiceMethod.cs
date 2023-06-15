using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.FindSymbols;
using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

/// <summary>
/// 用于前端调试服务方法或测试调用服务方法时定位服务方法及获取参数
/// </summary>
internal sealed class GetServiceMethod : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var modelID = args.GetString()!;
        var position = args.GetInt();

        var modelNode = hub.DesignTree.FindModelNode(modelID);
        if (modelNode == null)
            throw new Exception("Can't find service model node");

        //定位服务入口方法
        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId);
        var semanticModel = await doc!.GetSemanticModelAsync();
        var symbol = await SymbolFinder.FindSymbolAtPositionAsync(semanticModel!, position, hub.TypeSystem.Workspace);
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
        var sb = new StringBuilder("{\"Name\":\"");
        sb.Append(method!.Name);
        sb.Append("\", \"Args\":[");
        for (var i = 0; i < method.Parameters.Length; i++)
        {
            sb.AppendFormat("{{\"Name\":\"{0}\",\"Type\":\"{1}\"}}", method.Parameters[i].Name,
                method.Parameters[i].Type);
            if (i != method.Parameters.Length - 1)
                sb.Append(",");
        }

        sb.Append("]}");
        return sb.ToString();
    }
}