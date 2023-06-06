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
#if DEBUG
            var ts = Stopwatch.GetTimestamp();
#endif
            var asmData = await Channel.Invoke<byte[]>("sys.DesignService.GetDesktopPreview",
                new object?[] { _controller.ModelNode.Id });
            _assemblyLoader = new ViewAssemblyLoader();
            var asm = _assemblyLoader.LoadViewAssembly(asmData!);
            var modelNode = _controller.ModelNode;
            var widgetTypeName = $"{modelNode.AppName}.Views.{modelNode.Label.Value}";
            var widgetType = asm.GetType(widgetTypeName);

            //先判断是否有静态预览方法
            Widget widget;
            var previewMethod = widgetType!.GetMethod("Preview", BindingFlags.Static | BindingFlags.Public);
            if (previewMethod != null)
                widget = (Widget)previewMethod.Invoke(null, null)!;
            else
                widget = (Widget)Activator.CreateInstance(widgetType!)!;
            widget.DebugLabel = asm.FullName;

#if DEBUG
            Console.WriteLine(
                $"Load preview widget: {widget.GetType()}, ms={Stopwatch.GetElapsedTime(ts).TotalMilliseconds}");
#endif

            _containerRef.Widget.Child = widget;
        }
        catch (Exception e)
        {
            _containerRef.Widget.Child = new Center
            {
                Child = new Text($"Has Error:\n{e.Message}") { MaxLines = 20 }
            };
        }

        _containerRef.Widget.Invalidate(InvalidAction.Relayout);
        //Sync outline view
        _controller.CurrentWidget = _containerRef.Widget.Child;
        _controller.RefreshOutlineAction?.Invoke();
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
        #if DEBUG
        Console.WriteLine($"ViewAssemblyLoader.Load: {assemblyName.Name}");
        #endif
        //TODO:加载依赖的实体及视图组件
        return null;
    }
}
#endif