using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 发布变更的模型包
/// </summary>
internal sealed class Publish : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var commitMessage = args.GetString();
        if (hub.PendingChanges == null || hub.PendingChanges.Length == 0)
            return AnyValue.Empty;
        
        //将PendingChanges转为PublishPackage
        var package = new PublishPackage();
        foreach (var change in hub.PendingChanges)
        {
            switch(change)
            {
                case ModelBase model:
                    package.Models.Add(model); break;
                case ModelFolder folder:
                    package.Folders.Add(folder); break;
                case StagedItems.StagedSourceCode code:
                    package.SourceCodes.Add(code.ModelId, code.CodeData); break;
                case StagedItems.StagedViewRuntimeCode viewAsm:
                {
                    //先找到名称
                    var viewModelNode = hub.DesignTree.FindModelNode(ModelType.View, viewAsm.ModelId);
                    var asmName = $"{viewModelNode.AppNode.Model.Name}.{viewModelNode.Model.Name}";
                    package.ViewAssemblies.Add(asmName, viewAsm.CodeData);
                }   
                    break;
                default:
                    Log.Warn($"Unknown pending change: {change.GetType()}"); break;
            }
        }

        throw new NotImplementedException();
    }
}