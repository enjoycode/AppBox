#if !__WEB__
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.Loader;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class DesktopPreviewer : View
{
    public DesktopPreviewer(PreviewController controller)
    {
        _controller = controller;
        _controller.InvalidateAction = Run;

        Child = new Container()
        {
            Ref = _containerRef,
            Child = _loading,
        };
    }

    private readonly PreviewController _controller;
    private readonly WidgetRef<Container> _containerRef = new();
    private ViewAssemblyLoader? _assemblyLoader;
    private static readonly Widget _loading = new Center { Child = new Text("Loading....") };
    private bool _hasLoaded = false;

    protected override void OnMounted()
    {
        base.OnMounted();
        if (!_hasLoaded)
        {
            _hasLoaded = true;
            Run();
        }
    }

    private async void Run()
    {
        _containerRef.Widget!.Child?.Dispose();
        _containerRef.Widget!.Child = null;
        _assemblyLoader?.Unload();
        _assemblyLoader = null;

        try
        {
            var sw = Stopwatch.StartNew();
            var res = await Channel.Invoke("sys.DesignService.GetDesktopPreview",
                new object?[] { _controller.ModelNode.Id });
            var asmData = (byte[])res!;
            _assemblyLoader = new ViewAssemblyLoader();
            var asm = _assemblyLoader.LoadViewAssembly(asmData);
            var widgetTypeName = _controller.ModelNode.Label;
            var widgetType = asm.GetType(widgetTypeName);
            var widget = (Widget)Activator.CreateInstance(widgetType!)!;
            widget.DebugLabel = asm.FullName;
            sw.Stop();
            Console.WriteLine(
                $"Load preview widget: {widget.GetType()}, ms={sw.ElapsedMilliseconds}");
            _containerRef.Widget.Child = widget;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Can't load preview widget: {e.Message}");
            _containerRef.Widget.Child = new Center { Child = new Text("Has Error") };
        }

        _containerRef.Widget.Invalidate(InvalidAction.Relayout);
    }
}

internal sealed class ViewAssemblyLoader : AssemblyLoadContext //TODO: move to AppBoxClient
{
    public ViewAssemblyLoader() : base(true) { }

    public Assembly LoadViewAssembly(byte[] asmData)
    {
        if (asmData == null)
            throw new ArgumentNullException(nameof(asmData));

        using var oms = new MemoryStream(asmData);
        return LoadFromStream(oms);
    }

    protected override Assembly? Load(AssemblyName assemblyName)
    {
        //TODO:加载依赖的实体及视图组件
        return null;
    }
}
#endif