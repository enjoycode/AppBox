using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;
using AppBoxWebHost;
using NUnit.Framework;

namespace Tests.Store;

public sealed class SqlQueryTest
{
    [Test]
    public async Task Test1()
    {
        RuntimeContext.Init(new HostRuntimeContext(), null);
        SqlStore.InitDefault("AppBoxStore.PostgreSql",
            "AppBoxStore.PgSqlStore",
            "Server=127.0.0.1;Port=5432;Database=AppBox;Userid=rick;Password=;Enlist=true;Pooling=true;MinPoolSize=1;MaxPoolSize=200;");
        MetaStore.Init(new SqlMetaStore());

        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(q.T["Name"] == "Admin");
        var list = await q.ToListAsync();
        Assert.True(list.Count == 1);
    }
}