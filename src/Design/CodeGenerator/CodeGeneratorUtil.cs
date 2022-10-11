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
        var code = EntityCodeGenerator.GenRuntimeCode(modelNode);
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
                    hub.DesignTree.FindModelNode(refModelId)!;
                BuildUsagedEntity(hub, refModelNode, ctx, parseOptions);
            }
        }

        var sets = model.Members
            .Where(t => t.Type == EntityMemberType.EntitySet)
            .Cast<EntitySetModel>();
        foreach (var setModel in sets)
        {
            var setModelNode =
                hub.DesignTree.FindModelNode(setModel.RefModelId)!;
            BuildUsagedEntity(hub, setModelNode, ctx, parseOptions);
        }
        //TODO:实体枚举成员的处理
    }

    private const string EmptyEntityFactories =
        "private static readonly AppBoxCore.EntityFactory[] _entityFactories=Array.Empty<EntityFactory>();\n";

    /// <summary>
    /// 生成反序列化时的实体工厂
    /// </summary>
    /// <returns></returns>
    internal static string GenerateEntityFactoriesCode(DesignHub hub, HashSet<string> usedModels)
    {
        if (usedModels.Count == 0)
            return EmptyEntityFactories;

        var entities = usedModels.Select(name => hub.DesignTree.FindModelNodeByFullName(name))
            .Where(node => node != null && node.Model.ModelType == ModelType.Entity)
            .ToArray();
        if (entities.Length == 0)
            return EmptyEntityFactories;

        var sb = StringBuilderCache.Acquire();
        sb.Append("private static readonly AppBoxCore.EntityFactory[] _entityFactories={");
        var sep = false;
        foreach (var usedEntity in entities)
        {
            if (sep == false) sep = true;
            else sb.Append(',');

            sb.Append("new (");
            sb.Append(usedEntity!.Model.Id.Value.ToString());
            sb.Append("L, typeof(");
            sb.Append(usedEntity.AppNode.Model.Name);
            sb.Append(".Entities.");
            sb.Append(usedEntity.Model.Name);
            sb.Append("))");
        }

        sb.Append("};\n");
        return StringBuilderCache.GetStringAndRelease(sb);
    }
}