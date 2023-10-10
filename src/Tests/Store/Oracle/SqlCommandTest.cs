using AppBoxStore.Entities;
using AppBoxStore;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tests.Store.Oracle;

internal class SqlCommandTest
{
    static SqlCommandTest()
    {
        TestHelper.TryInitDefaultOracleStore();
    }

    [Test]
    public async Task SqlInsertTest()
    {
        var emp = new Employee()
        {
            Account = "wxf",
            Birthday = DateTime.Now,
            Male = true,
            Name = "wxf",
            Password = new byte[5] { 1, 2, 3, 4, 5 }
        };
        await SqlStore.Default.InsertAsync(emp);
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
