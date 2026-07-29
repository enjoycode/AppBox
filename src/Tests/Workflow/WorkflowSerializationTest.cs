using AppBoxCore;
using NUnit.Framework;

namespace Tests.Workflow;

public class WorkflowSerializationTest
{
    [Test]
    public void ParametersSerializationTest()
    {
        var paras = new WorkflowParameters(["Days"], [3]);
        var data = WorkflowParameters.WriteToData(paras);
        var deserialized = WorkflowParameters.ReadFromData(data);
        Assert.IsTrue(deserialized != null && deserialized.TryGetValue("Days", out var days) && days.GetInt() == 3);
    }
}