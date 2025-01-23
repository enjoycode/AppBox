using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design.Handlers;

public class GotoDefinitionTest
{
    [Test]
    public async Task Test1()
    {
        throw new NotImplementedException();
        // var designHub = await TestHelper.MockSession();
        //
        // var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Views.EmployeeView")!;
        //
        // var handler = new GotoDefinition();
        // //实体成员 13 62
        // //实体 18 33
        // //同文件 22 38
        //
        // var res = await handler.Handle(designHub, InvokeArgs.Make(modelNode.Id, 18, 33));
        // var response = res.BoxedValue!;
    }

    [Test]
    public async Task Test2()
    {
        throw new NotImplementedException();
        // var designHub = await TestHelper.MockSession();
        // var modelNode = designHub.DesignTree.FindModelNodeByFullName("sys.Views.OrgUnitsView")!;
        // var handler = new GotoDefinition();
        // var res = await handler.Handle(designHub, InvokeArgs.Make(modelNode.Id, 110, 43));
        // var response = res.BoxedValue!;
    }
}