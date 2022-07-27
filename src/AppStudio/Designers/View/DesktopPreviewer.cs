#if !__WEB__
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading;
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
            Child = new ViewModelWidget(_target)
        };
    }

    private readonly PreviewController _controller;
    private ViewAssemblyLoader? _assemblyLoader;
    private readonly State<Widget> _target = new Center { Child = new Text("Loading....") };

    protected override void OnMounted()
    {
        base.OnMounted();
        Run();
    }

    private async void Run()
    {
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
            sw.Stop();
            Console.WriteLine(
                $"Load preview widget: {widget.GetType()}, ms={sw.ElapsedMilliseconds}");
            _target.Value = widget;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Can't load preview widget: {e.Message}");
            _target.Value = new Center { Child = new Text("Has Error") };
        }
    }
}

internal sealed class ViewModelWidget : DynamicView
{
    internal ViewModelWidget(State<Widget> target)
    {
        _target = Bind(target, BindingOptions.None);
    }

    private readonly State<Widget> _target;

    public override void OnStateChanged(StateBase state, BindingOptions options)
    {
        if (ReferenceEquals(_target, state))
        {
            ReplaceTo(_target.Value);
            return;
        }

        base.OnStateChanged(state, options);
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
        //TODO:加载依赖的实体及视图组件
        return null;
    }
}
#endif