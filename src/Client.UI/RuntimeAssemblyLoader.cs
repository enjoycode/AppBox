using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Runtime.Loader;
using PixUI;

namespace AppBoxClient;

/// <summary>
/// 客户端运行时加载视图程序集及依赖程序集
/// </summary>
public static class AppAssembiles
{
    private static readonly AppAssemblyLoader _loader = new();
    private static Assembly? _viewsAssebly;

    public static Widget MakeHomePageWidget() //TODO:考虑改为异步同时使用LazyWidget
    {
        if (_viewsAssebly == null)
        {
            var asmData = Channel.Invoke<byte[]?>("sys.SystemService.GetAppAssembly",
                new object?[] { "sys.Views" }).GetAwaiter().GetResult();
            if (asmData == null || asmData.Length == 0)
                throw new Exception("Can't load app assembly");

            using var input = new MemoryStream(asmData);
            using var output = new MemoryStream(asmData.Length);
            using var cs = new BrotliStream(output, CompressionMode.Decompress, true);
            input.CopyTo(cs);
            cs.Flush();

            output.Position = 0;
            _viewsAssebly = _loader.LoadFromStream(output);
        }

        var widgetType = _viewsAssebly.GetType("sys.HomePage");
        if (widgetType == null)
            throw new Exception("Can't find HomePage widget");
        return (Widget)Activator.CreateInstance(widgetType)!;
    }
}

internal sealed class AppAssemblyLoader : AssemblyLoadContext
{
    protected override Assembly? Load(AssemblyName assemblyName)
    {
#if DEBUG
        Console.WriteLine($"AppAssemblyLoader.Load: {assemblyName.Name}");
#endif
        return null;
    }
}