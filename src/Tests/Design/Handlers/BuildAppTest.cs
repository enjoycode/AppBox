using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public sealed class BuildAppTest
{
    [Test]
    public async Task BuildTest()
    {
        var hub = await DesignHelper.MockDesignHub();
        // var handler = new BuildApp(); 
        // await handler.Handle(designHub, AnyArgs.Make(true));

        var ctx = new BuildAppContext(hub);
        var viewAssemblyMap = new Dictionary<ModelNode, List<AssemblyInfo>>();
        var viewModelNode = hub.DesignTree.FindModelNodeByFullName("sys.Views.DemoAI")!;

        await BuildApp.AnalyseView(ctx, viewModelNode);
        ctx.ResolveAssemblyDependencies();
        BuildApp.BuildViewAssemblyMap(ctx, viewAssemblyMap, viewModelNode);
        
        var allAssemblies = ctx.GetAllAssemblies();
        foreach (var assemblyInfo in allAssemblies)
        {
            assemblyInfo.TryCompile();
        }
    }
}