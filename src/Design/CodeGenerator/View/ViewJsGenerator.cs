using AppBoxCore;
using Microsoft.CodeAnalysis;
using PixUI.CS2TS;

namespace AppBoxDesign;

/// <summary>
/// 生成视图模型Web端的JS代码，用于预览或发布
/// </summary>
internal static class ViewJsGenerator
{
    internal static async ValueTask<string> GenViewWebCode(DesignHub hub, ModelId modelId, bool forPreview
#if DEBUG
        , bool forViteDev = false
#endif
    )
    {
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find view model: {modelId}");

        //开始转换生成视图模型的js代码
        var srcPrjId = hub.TypeSystem.ViewsProjectId;
        var translator = new Translator(hub.TypeSystem.Workspace, srcPrjId);
        var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);
        var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;

        // 始终检查语义错误，防止客户端与服务端代码同步过程出现问题
        var semanticModel = await srcDocument.GetSemanticModelAsync();
        var diagnostics = semanticModel!.GetDiagnostics();
        if (diagnostics.Any(t => t.Severity == DiagnosticSeverity.Error))
            throw new Exception("Has error");

        var appboxCtx = new AppBoxContext(
            fullName => hub.DesignTree.FindModelNodeByFullName(fullName)?.Id,
            (entityName, memberName) =>
                ((EntityModel)hub.DesignTree.FindModelNodeByFullName(entityName)!.Model)
                .GetMember(memberName)!.MemberId,
            forPreview, hub.Session.SessionId
#if DEBUG
            , forViteDev
#endif
        );
        var emitter = await Emitter.MakeAsync(translator, srcDocument, true, appboxCtx);
        emitter.Emit();
        var tsCode = emitter.GetTypeScriptCode();

        //附加import使用到的模型, 包括实体模型及视图模型
        if (appboxCtx.UsedModels.Count > 0)
        {
            var sb = StringBuilderCache.Acquire();
            var hasEntityModel = false;

            foreach (var fullName in appboxCtx.UsedModels)
            {
                //根据名称找到相关模型
                var usedModel = hub.DesignTree.FindModelNodeByFullName(fullName)!;
                var usedModelName = usedModel.Model.Name;
                var usedModelAppName = usedModel.AppNode.Model.Name;
                var usedFullName = $"{usedModelAppName}_{usedModelName}"; //加应用前缀防止同名
                var usedModelType = usedModel.Model.ModelType.ToString();
                var usedModelId = usedModel.Model.Id;

                if (forPreview)
                {
                    sb.Insert(0,
                        $"import {{{usedModelName} as {usedFullName}}} from '/preview/{usedModelType}/{hub.Session.SessionId}/{usedModelId}'\n");
                }
                else
                {
                    sb.Insert(0, usedModel.Model.ModelType == ModelType.View
                        ? $"import {{{usedModelName} as {usedFullName}}} from '/model/{usedModelType}/{usedModelAppName}.{usedModelName}'\n"
                        : $"import {{{usedModelName} as {usedFullName}}} from '/model/{usedModelType}/{usedModelId}'\n");
                }

                //如果是Entity模型附加EntityFactories常量
                if (usedModel.Model.ModelType == ModelType.Entity)
                {
                    if (!hasEntityModel)
                    {
                        sb.Append("\nconst EntityFactories=new Map([");
                        hasEntityModel = true;
                    }
                    else
                    {
                        sb.Append(',');
                    }

                    sb.Append($"[{usedModel.Model.Id.Value}n, ()=>new {usedFullName}()]");
                }
            }

            if (hasEntityModel)
                sb.Append("]);\n\n"); //end EntityFactories
            else
                sb.Append("const EntityFactories=null;\n\n");

            sb.Append(tsCode);
            tsCode = StringBuilderCache.GetStringAndRelease(sb);
        }
        else
        {
            tsCode += "\n\nconst EntityFactories=null;";
        }

        return tsCode;
    }
}