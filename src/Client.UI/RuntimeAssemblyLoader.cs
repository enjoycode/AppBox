using System.IO.Compression;
using System.Reflection;
using System.Runtime.Loader;
using System.Text.Json;
using PixUI;

namespace AppBoxClient;

/// <summary>
/// 客户端运行时加载视图程序集及依赖程序集
/// </summary>
public static class AppAssemblies
{
    private static AppAssemblyLoader _loader = new();
    private static readonly Dictionary<string, Func<Widget>> ViewCreator = new();
    private static readonly Dictionary<string, Type> ViewTypes = new();

    /// <summary>
    /// 创建视图模型的实例，如果尚未加载程序集则从服务端加载所有依赖的程序集
    /// </summary>
    /// <param name="viewModelName">eg: sys.HomePage</param>
    public static async ValueTask<Widget> MakeViewWidgetAsync(string viewModelName)
    {
        //TODO: catch exception and return ErrorWidget
        if (ViewCreator.TryGetValue(viewModelName, out var exists))
            return exists();

        var widgetType = await GetViewType(viewModelName);
        var creator = () => (Widget)Activator.CreateInstance(widgetType)!;
        ViewCreator.Add(viewModelName, creator);
        return creator();
    }

    private static async Task<Type> GetViewType(string viewModelName)
    {
        if (ViewTypes.TryGetValue(viewModelName, out var exists))
            return exists;

        //从服务端获取所有依赖的程序集
        var asmJson = await Channel.Invoke<byte[]?>("sys.SystemService.GetViewAssemblies",
            new object?[] { viewModelName });
        if (asmJson == null) throw new Exception($"Can't find view: {viewModelName}");
        var asmNames = JsonSerializer.Deserialize<string[]>(asmJson);
        if (asmNames == null || asmNames.Length == 0) 
            throw new Exception($"获取视图模型[{viewModelName}]的程序集列表失败");

        var needLoads = asmNames.Where(asmName => !_loader.HasLoad(asmName));
        foreach (var asmName in needLoads)
        {
            var data = await Channel.Invoke<byte[]?>("sys.SystemService.LoadAppAssembly", new object?[] { asmName });
            if (data == null)
                throw new Exception($"Can't load assembly: {asmName}");

            using var input = new MemoryStream(data);
            using var output = new MemoryStream();
            await using var cs = new DeflateStream(input, CompressionMode.Decompress, true);
            await cs.CopyToAsync(output);
            cs.Flush();

            _loader.AddAssemblyData(asmName, output.ToArray());
        }

        //开始加载程序集
        var viewAsm = _loader.GetOrLoadViewAssembly(asmNames[0]);

        var names = viewModelName.Split('.');
        var viewFullName = $"{names[0]}.Views.{names[1]}";
        var widgetType = viewAsm.GetType(viewFullName);
        if (widgetType == null)
            throw new Exception($"Can't find widget type: {viewFullName}");
        ViewTypes.Add(viewModelName, widgetType);
        return widgetType;
    }

    internal static async Task<Type?> TryGetViewType(string viewModelName)
    {
        try
        {
            var res = await GetViewType(viewModelName);
            return res;
        }
        catch (Exception ex)
        {
            Log.Warn(ex.Message);
            return null;
        }
    }

    internal static void Reset()
    {
        var old = Interlocked.Exchange(ref _loader, new AppAssemblyLoader());
        ViewTypes.Clear();
        ViewCreator.Clear();
        old.Unload();
    }
}

internal sealed class AppAssemblyLoader : AssemblyLoadContext
{
    public AppAssemblyLoader() : base(true) { }

    private readonly Dictionary<string, object> _loaded = new();

    public bool HasLoad(string assemblyName) => _loaded.ContainsKey(assemblyName);

    public void AddAssemblyData(string assemblyName, byte[] data) => _loaded.Add(assemblyName, data);

    public Assembly GetOrLoadViewAssembly(string assemblyName)
    {
        if (!_loaded.TryGetValue(assemblyName, out var data))
            throw new Exception("Can't find assembly data");

        if (data is Assembly loaded) return loaded;

        Log.Debug($"Begin load: {assemblyName}");

        var assembly = LoadFromStream(new MemoryStream((byte[])data));
        _loaded[assemblyName] = assembly;
        return assembly;
    }

    protected override Assembly? Load(AssemblyName assemblyName)
    {
        if (assemblyName.Name != null && _loaded.TryGetValue(assemblyName.Name, out var data))
        {
            Log.Debug($"Begin load: {assemblyName.Name}");
            if (data is Assembly assembly) return assembly;

            assembly = LoadFromStream(new MemoryStream((byte[])data));
            _loaded[assemblyName.Name] = assembly;
            return assembly;
        }

        return null;
    }
}