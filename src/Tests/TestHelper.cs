using System.Threading;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxDesign;
using AppBoxStore;
using AppBoxServer;

namespace Tests;

public static class TestHelper
{
    private static int _initFlag = 0;

    // postgresql conn
    internal const string PgConnectionString
        = "Server=10.211.55.2;Port=5432;Database=AppBox;Userid=rick;Password=;Enlist=true;Pooling=true;MinPoolSize=1;MaxPoolSize=200;";

    // oracle conn
    internal const string OracleConnectionString
        = "DATA SOURCE=192.168.1.97/orcl;PASSWORD=123456;PERSIST SECURITY INFO=True;USER ID=wxf;Connection Timeout=120;Statement Cache Purge=true";

    public static void TryInitDefaultStore()
    {
        if (Interlocked.CompareExchange(ref _initFlag, 1, 0) != 0) return;

        RuntimeContext.Init(new HostRuntimeContext(), new PasswordHasher());
        SqlStore.InitDefault("AppBoxStore.PostgreSql", "AppBoxStore.PgSqlStore", PgConnectionString);
        MetaStore.Init(new SqlMetaStore());
    }

    public static void TryInitDefaultOracleStore()
    {
        if (Interlocked.CompareExchange(ref _initFlag, 1, 0) != 0) return;

        RuntimeContext.Init(new HostRuntimeContext(), new PasswordHasher());
        SqlStore.InitDefault("AppBoxStore.OracleSql", "AppBoxStore.OracleSqlStore", OracleConnectionString);
        MetaStore.Init(new SqlMetaStore());
    }

    internal static async Task<DesignHub> MockSession()
    {
        TryInitDefaultStore();

        var mockSession = new MockSession(12345);
        HostRuntimeContext.SetCurrentSession(mockSession);
        var designHub = mockSession.GetDesignHub();
        await designHub.DesignTree.LoadAsync();
        return designHub;
    }
}