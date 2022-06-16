using System.Threading;
using AppBoxCore;
using AppBoxStore;
using AppBoxServer;

namespace Tests;

public static class TestHelper
{
    private static int _initFlag = 0;

    public static void TryInitDefaultStore()
    {
        if (Interlocked.CompareExchange(ref _initFlag, 1, 0) == 0)
        {
            RuntimeContext.Init(new HostRuntimeContext(), null);
            SqlStore.InitDefault("AppBoxStore.PostgreSql",
                "AppBoxStore.PgSqlStore",
                "Server=127.0.0.1;Port=5432;Database=AppBox;Userid=rick;Password=;Enlist=true;Pooling=true;MinPoolSize=1;MaxPoolSize=200;");
            MetaStore.Init(new SqlMetaStore());
        }
    }
}