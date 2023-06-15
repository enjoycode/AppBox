using System;
using System.Threading.Tasks;
using AppBoxStore;
using AppBoxStore.Entities;
using NUnit.Framework;

namespace Tests.Store;

public class SqlCommandTest
{
    static SqlCommandTest()
    {
        TestHelper.TryInitDefaultStore();
    }

    [Test]
    public async Task SqlUpdateTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t["Name"] == "Test");
        var e = await q.ToSingleAsync();

        var cmd = new SqlUpdateCommand(Employee.MODELID);
        cmd.Where(t => t["Id"] == e!.Id);
        cmd.Update(t => t["Birthday"].Assign(DateTime.Now));
        // //返回单个值
        // var output = cmd.Output(r => r.ReadDateTimeMember(0), cmd["Birthday"]);
        //返回多个字段组成的匿名类
        var outputs = cmd.Output(r =>
                new
                {
                    Id = r.ReadGuidMember(0),
                    Name = r.ReadStringMember(1),
                    Birthday = r.ReadDateTimeMember(2),
                },
            t => new[]
            {
                t["Id"],
                t["Name"],
                t["Birthday"]
            });

        var count = await cmd.ExecAsync();
        Assert.True(count == 1);
        Assert.True(outputs[0].Name == "Test");
        Assert.True(outputs[0].Id == e!.Id);
        Console.WriteLine(outputs[0].Birthday);
    }

    [Test]
    public async Task SqlDeleteTest()
    {
        var db = SqlStore.Default;
        var e = new Employee(Guid.NewGuid()) { Name = "Rick", Birthday = DateTime.Now };
        await db.InsertAsync(e);

        var cmd = new SqlDeleteCommand(Employee.MODELID);
        cmd.Where(t => t["Id"] == e.Id);
        var count = await cmd.ExecAsync();
        Assert.True(count == 1);
    }
}