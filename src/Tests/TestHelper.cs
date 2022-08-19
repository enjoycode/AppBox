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