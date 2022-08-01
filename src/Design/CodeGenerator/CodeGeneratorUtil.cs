using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;

namespace AppBoxDesign;

internal static class CodeGeneratorUtil
{
    /// <summary>
    /// 检查编译是否成功，不成功则抛出异常
    /// </summary>
    internal static void CheckEmitResult(EmitResult emitResult)
    {
        if (emitResult.Success) return;

        var sb = new StringBuilder("编译错误:");
        sb.AppendLine();
        for (var i = 0; i < emitResult.Diagnostics.Length; i++)
        {
            var error = emitResult.Diagnostics[i];
            sb.AppendFormat("{0}. {1}", i + 1, error);
            sb.AppendLine();
        }

        throw new Exception(sb.ToString());
    }

    /// <summary>
    /// 生成使用到的实体模型的运行时代码，包括EntityRef有EntitySet的引用
    /// </summary>
    internal static void BuildUsagedEntity(DesignHub hub, ModelNode modelNode,
        IDictionary<string, SyntaxTree> ctx, CSharpParseOptions parseOptions)
    {
        if (ctx.ContainsKey(modelNode.Id)) return;

        //处理自身
        var code = EntityCodeGenerator.GenEntityRuntimeCode(modelNode);
        var syntaxTree = SyntaxFactory.ParseSyntaxTree(code, parseOptions);
        ctx.Add(modelNode.Id, syntaxTree);

        //处理引用
        var model = (EntityModel)modelNode.Model;
        var refs = model.Members
            .Where(t => t.Type == EntityMemberType.EntityRef)
            .Cast<EntityRefModel>();
        foreach (var refModel in refs)
        {
            foreach (var refModelId in refModel.RefModelIds)
            {
                var refModelNode =
                    hub.DesignTree.FindModelNode(ModelType.Entity, refModelId)!;
                BuildUsagedEntity(hub, refModelNode, ctx, parseOptions);
            }
        }

        var sets = model.Members
            .Where(t => t.Type == EntityMemberType.EntitySet)
            .Cast<EntitySetModel>();
        foreach (var setModel in sets)
        {
            var setModelNode =
                hub.DesignTree.FindModelNode(ModelType.Entity, setModel.RefModelId)!;
            BuildUsagedEntity(hub, setModelNode, ctx, parseOptions);
        }
        //TODO:实体枚举成员的处理
    }
}