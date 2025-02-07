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

        Child = new Container { Child = _loading }.RefBy(ref _containerRef);
    }

    private readonly PreviewController _controller;
    private readonly Container _containerRef = null!;
    private ViewAssemblyLoader? _assemblyLoader;
    private static readonly Widget _loading = new Center { Child = new Text("Loading....") };
    private bool _hasLoaded;

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
        _containerRef.Child?.Dispose();
        _containerRef.Child = null;
        _assemblyLoader?.Unload();
        _assemblyLoader = null;

        try
        {
#if DEBUG
            var ts = Stopwatch.GetTimestamp();
#endif
            var asmData = await BuildViewPreview.Execute(_controller.ModelNode);
            _assemblyLoader = new ViewAssemblyLoader();
            var asm = _assemblyLoader.LoadViewAssembly(asmData!);
            var modelNode = _controller.ModelNode;
            var widgetTypeName = $"{modelNode.AppNode.Model.Name}.Views.{modelNode.Label.Value}";
            var widgetType = asm.GetType(widgetTypeName);

            //先判断是否有静态预览方法
            Widget widget;
            var previewMethod = widgetType!.GetMethod("Preview", BindingFlags.Static | BindingFlags.Public);
            if (previewMethod != null)
                widget = (Widget)previewMethod.Invoke(null, null)!;
            else
                widget = (Widget)Activator.CreateInstance(widgetType)!;
            widget.DebugLabel = asm.FullName;

#if DEBUG
            Console.WriteLine(
                $"Load preview widget: {widget.GetType()}, ms={Stopwatch.GetElapsedTime(ts).TotalMilliseconds}");
#endif

            _containerRef.Child = widget;
        }
        catch (Exception e)
        {
            _containerRef.Child = new Center
            {
                Child = new Text($"Has Error:\n{e.Message}") { MaxLines = 20 }
            };
        }

        _containerRef.Relayout();
        //Sync outline view
        _controller.CurrentWidget = _containerRef.Child;
        _controller.RefreshOutlineAction?.Invoke();
    }
}

internal sealed class ViewAssemblyLoader : AssemblyLoadContext
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
        //目前实现是所有依赖的其他模型已经打包入预览用的程序集
        return null;
    }
}
#endif