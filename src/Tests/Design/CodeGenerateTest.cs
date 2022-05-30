using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Design;

public class CodeGenerateTest
{
    [Test]
    public void GenEntityCodeTest()
    {
        const int appId = 12345;
        var empModel = new EntityModel(
            ModelId.Make(appId, ModelType.Entity, 1, ModelLayer.SYS), "Employee");
        empModel.AddMember(new DataFieldModel(empModel, "Name", DataFieldType.String, false));

        var code = CodeGenService.GenEntityDummyCode(empModel, "sys", null);
        Console.Write(code);
    }
}