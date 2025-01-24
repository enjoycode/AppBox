using AppBoxCore;
using AppBoxServer;
using AppBoxStore;

namespace Tests;

public static class ServerRuntimeHelper
{
    private static int _initFlag = 0;

    internal const string ConnectionString
        = "Server=10.211.55.2;Port=5432;Database=iWareMaster;Userid=rick;Password=;Enlist=true;Pooling=true;MinPoolSize=1;MaxPoolSize=200;";

    private static void TryInitDefaultStore()
    {
        if (Interlocked.CompareExchange(ref _initFlag, 1, 0) != 0) return;

        RuntimeContext.Init(new HostRuntimeContext(), null);
        SqlStore.InitDefault("AppBoxStore.PostgreSql", "AppBoxStore.PgSqlStore", ConnectionString);
        MetaStore.Init(new SqlMetaStore());
    }

    public static IUserSession MockUserSession()
    {
        TryInitDefaultStore();

        var mockSession = new MockSession("12345");
        HostRuntimeContext.SetCurrentSession(mockSession);
        return mockSession;
    }
}