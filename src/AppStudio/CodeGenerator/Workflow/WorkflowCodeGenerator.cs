using AppBoxCore;

namespace AppBoxDesign.CodeGenerator;

internal static class WorkflowCodeGenerator
{
    /// <summary>
    /// 获取工作流参数的运行时类型
    /// </summary>
    public static string GetParameterRuntimeType(WorkflowParameter parameter, DesignContext designContext)
    {
        string typeName;
        switch (parameter.Type)
        {
            case WorkflowParameter.ValueType.Integer: typeName = "int"; break;
            case WorkflowParameter.ValueType.Double: typeName = "double"; break;
            case WorkflowParameter.ValueType.String: typeName = "string"; break;
            case WorkflowParameter.ValueType.Boolean: typeName = "bool"; break;
            case WorkflowParameter.ValueType.Guid: typeName = "Guid"; break;
            case WorkflowParameter.ValueType.Entity:
                var modelNode = designContext.DesignTree.FindModelNode(parameter.EntityModelId!.Value)!;
                typeName = $"{modelNode.AppName}.Entities.{modelNode.Model.Name}";
                break;
            default: throw new NotImplementedException(parameter.Type.ToString());
        }

        if (parameter.IsArray)
            typeName = $"{typeName}[]";
        return typeName;
    }
}