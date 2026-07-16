using System.Diagnostics;
using AppBoxCore;

namespace AppBoxDesign.CodeGenerator;

internal static class WorkflowCodeGenerator
{
    public static string GenProxyCode(ModelNode modelNode)
    {
        Debug.Assert(modelNode.Model.ModelType == ModelType.Workflow);
        var model = (WorkflowModel)modelNode.Model;
        var sb = StringBuilderCache.Acquire();

        sb.AppendLine("using System;");
        sb.AppendLine("using System.Threading.Tasks;");
        sb.AppendLine($"namespace {modelNode.AppName}.Workflows;");

        sb.AppendLine($"public static class {model.Name} {{");

        // interceptor attribute
        sb.Append('\t');
        sb.Append('[');
        sb.Append(TypeHelper.InvocationInterceptorAttribute);
        sb.Append("(\"");
        sb.Append(StartWorkflowInterceptor.Name);
        sb.Append("\")]\n");

        sb.Append("\tpublic static Task StartAsync(");
        var sep = false;
        foreach (var parameter in model.Parameters)
        {
            if (parameter.IsLocalVariable) continue;
            if (sep) sb.Append(", ");

            sep = true;
            sb.Append(GetParameterRuntimeType(parameter, modelNode.DesignTree!));
            sb.Append(' ');
            sb.Append(parameter.Name);
        }

        sb.AppendLine(") => Task.CompletedTask;");

        sb.Append('}');

        return StringBuilderCache.GetStringAndRelease(sb);
    }

    /// <summary>
    /// 获取工作流参数的运行时类型
    /// </summary>
    public static string GetParameterRuntimeType(WorkflowParameter parameter, DesignTree designTree)
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
                var modelNode = designTree.FindModelNode(parameter.EntityModelId!.Value)!;
                typeName = $"{modelNode.AppName}.Entities.{modelNode.Model.Name}";
                break;
            default: throw new NotImplementedException(parameter.Type.ToString());
        }

        if (parameter.IsArray)
            typeName = $"{typeName}[]";
        return typeName;
    }
}