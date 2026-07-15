using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public sealed class BuildAppTest : DesignContextTestBase
{
    [Test]
    public async Task BuildTest()
    {
        // var handler = new BuildApp(); 
        // await handler.Handle(designHub, AnyArgs.Make(true));

        var ctx = new BuildAppContext(DesignContext);
        var viewAssemblyMap = new Dictionary<ModelNode, List<AssemblyInfo>>();
        var viewModelNode = DesignContext.DesignTree.FindModelNodeByFullName("sys.Views.DemoAI")!;

        await BuildAppCommand.AnalyseView(ctx, viewModelNode);
        ctx.ResolveAssemblyDependencies();
        BuildAppCommand.BuildViewAssemblyMap(ctx, viewAssemblyMap, viewModelNode);

        var allAssemblies = ctx.GetAllAssemblies();
        foreach (var assemblyInfo in allAssemblies)
        {
            assemblyInfo.TryCompile();
        }
    }
}