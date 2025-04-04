using AppBoxCore;
using AppBoxStore;
using static AppBoxServer.ServerLogger;

namespace AppBoxServer;

/// <summary>
/// 服务模型运行时实例容器
/// </summary>
public static class AppServiceContainer
{
    private struct ServiceInfo
    {
        public IService Instance;
        public ServiceAssemblyLoader Loader;
    }

    //TODO:use LRUCache
    private static readonly Dictionary<string, ServiceInfo> Services = new(100);

    /// <summary>
    /// 根据名称获取运行时服务实例
    /// </summary>
    /// <param name="name">eg:sys.HelloService</param>
    public static async ValueTask<IService?> TryGetAsync(string name)
    {
        if (Services.TryGetValue(name, out var service))
            return service.Instance;

        //加载服务模型的组件
        var asmData = await MetaStore.Provider.LoadServiceAssemblyAsync(name);
        if (asmData == null || asmData.Length == 0)
        {
            Logger.Warn($"无法从存储加载ServiceAssembly: {name}");
            return null;
        }

        //释放应用的第三方组件为临时文件，因非托管组件只能从文件加载
        //TODO:避免重复释放或者考虑获取服务模型后根据引用释放
        var dotIndex = name.AsSpan().IndexOf('.');
        var appName = name.AsSpan(0, dotIndex).ToString();
        var serviceName = name.AsSpan(dotIndex + 1).ToString();
        var libPath = Path.Combine(typeof(AppServiceContainer).Assembly.Location, "libs", appName);
        // await MetaStore.Provider.ExtractAppAssemblies(appName, libPath);

        lock (Services)
        {
            if (!Services.TryGetValue(name, out service))
            {
                var asmLoader = new ServiceAssemblyLoader(libPath);
                var asm = asmLoader.LoadServiceAssembly(asmData);
                var instance = asm.CreateInstance(serviceName) as IService;
                if (instance == null)
                    return null;
                service = new ServiceInfo { Instance = instance, Loader = asmLoader };
                Services.TryAdd(name, service);
                Logger.Debug($"加载服务实例: {asm.FullName}");
            }
        }

        return service.Instance;
    }

    /// <summary>
    /// 预先注入调试目标服务实例，防止从存储加载
    /// </summary>
    internal static void InjectDebugService(int debugSessionId)
    {
        var debugFolder =
            Path.Combine(AppContext.BaseDirectory, "debug", debugSessionId.ToString());
        if (!Directory.Exists(debugFolder))
        {
            Logger.Warn("Start debug process can't found target folder.");
            return;
        }

        var files = Directory.GetFiles(debugFolder);
        var asmLoader = new ServiceAssemblyLoader(Path.Combine(debugFolder, "lib"));
        foreach (var file in files)
        {
            if (Path.GetExtension(file) == ".dll")
            {
                var sr = Path.GetFileName(file).Split('.');
                var asm = asmLoader.LoadFromAssemblyPath(file);
                // var type = asm.GetType($"{sr[0]}.ServiceLogic.{sr[2]}", true);
                var instance = (IService)asm.CreateInstance(sr[2])!;
                Services.TryAdd($"{sr[0]}.{sr[2]}",
                    new ServiceInfo { Instance = instance, Loader = asmLoader });
                Logger.Debug($"Inject debug service instance: {file}");
            }
        }
    }

    /// <summary>
    /// 主要用于热更新时移除旧的服务实例
    /// </summary>
    public static bool TryRemove(string name)
    {
        lock (Services)
        {
            if (Services.TryGetValue(name, out var service))
            {
                Services.Remove(name);
                //#if DEBUG
                //                    service.Loader.Unloading += OnUnloading;
                //#endif
                service.Loader.Unload();
                //#if DEBUG
                //                    service.Loader.Unloading -= OnUnloading;
                //#endif
            }
        }

        return true;
    }

    //#if DEBUG
    //        private static void OnUnloading(System.Runtime.Loader.AssemblyLoadContext context)
    //        {
    //            var sb = Caching.StringBuilderCache.Acquire();
    //            sb.AppendLine("Unloading service assemblies:");
    //            foreach (var asm in context.Assemblies)
    //            {
    //                sb.AppendLine(asm.FullName);
    //            }
    //            Log.Warn(Caching.StringBuilderCache.GetStringAndRelease(sb));
    //        }
    //#endif
}