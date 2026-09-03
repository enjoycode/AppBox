using System.Reflection;
using AppBoxClient;
using AppBoxClient.Dynamic;
using AppBoxClient.Utils;
using AppBoxCore;
using PixUI.Dynamic;
using Expression = System.Linq.Expressions.Expression;
using ParameterExpression = System.Linq.Expressions.ParameterExpression;

namespace PixUI;

/// <summary>
/// 解析动态视图模型生成相应的组件
/// </summary>
public sealed class DynamicWidget : DynamicView, IDynamicContext
{
    public DynamicWidget(long viewModelId)
    {
        _viewModelId = viewModelId;
    }

    private readonly long _viewModelId;
    private bool _hasLoaded;
    private List<DynamicState>? _states;
    private DynamicBackground? _background;
    private IImage? _cachedImage;

    /// <summary>
    /// 成功解析json并加载后的事件
    /// </summary>
    public event Action? OnLoaded;

    DynamicState? IDynamicContext.FindState(string name)
    {
        if (_states == null || _states.Count == 0)
            return null;

        if (name.Contains('.'))
        {
            return _states.Where(s => s.Value is IWithChildStates)
                .SelectMany(s => ((IWithChildStates)s.Value!).GetChildStates(this, s))
                .FirstOrDefault(s => s.Name == name);
        }

        return _states?.SingleOrDefault(s => s.Name == name);
    }

    protected override void OnMounted()
    {
        base.OnMounted();
        if (!_hasLoaded)
        {
            _hasLoaded = true;
            LoadAsync();
        }
    }

    public override void OnPaint(ICanvas canvas, IDirtyArea? area = null)
    {
        if (_background != null && _background.ImageData != null)
        {
            _cachedImage ??= Image.FromEncodedData(_background.ImageData);
            canvas.DrawImage(_cachedImage!, Rect.FromLTWH(0, 0, W, H));
        }

        base.OnPaint(canvas, area);
    }

    private async void LoadAsync()
    {
        await DynamicInitiator.TryInitAsync();

        //TODO:考虑缓存加载过的(写入本地文件)
        await using var ms = new MemoryStream(2048);
        var pipeReader = Channel.Download("sys.SystemService.LoadDynamicView", _viewModelId);
        await pipeReader.CopyToStreamAsync(ms);

        if (ms.Length == 0)
        {
            ReplaceTo(new Text("Can't find dynamic view")); //TODO: ErrorWidget
            return;
        }

        try
        {
            ms.Position = 0;
            var root = ReadDynamicView(ms);
            ReplaceTo(root);
            OnLoaded?.Invoke();
        }
        catch (Exception e)
        {
            Log.Debug($"解析动态视图错误: {e.Message}\n{e.StackTrace}");
            ReplaceTo(new Text($"Parse error: {e.Message}"));
        }
    }

    #region ====Load Dynamic Widget====

    private Widget ReadDynamicView(Stream stream)
    {
        var reader = new SystemReadStream(stream);
        Widget? root = null;

        while (true)
        {
            var fieldId = reader.ReadFieldId();
            if (fieldId == 0) break;
            switch (fieldId)
            {
                case 1: _background = reader.ReadBackground(); break;
                case 2: _states = reader.ReadStates(DynamicInitiator.CreateStateValue); break;
                case 3: root = ReadWidget(ref reader); break;
                default: throw SerializationException.ReadUnknownField(nameof(DynamicWidget), fieldId);
            }
        }

        if (root == null) throw new Exception();
        return root;
    }

    private Widget ReadWidget<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        Widget result = null!;
        DynamicWidgetMeta meta = null!;

        while (true)
        {
            var propName = reader.ReadString();
            if (string.IsNullOrEmpty(propName)) break;

            if (propName == DynamicTypeSerializer.TYPE_PROPERTY)
            {
                var type = reader.ReadString();
                if (string.IsNullOrEmpty(type)) //element is a placeholder
                {
                    var width = reader.ReadFloat();
                    var height = reader.ReadFloat();
                    result = new Container() { Width = width, Height = height };
                    continue;
                }

                meta = DynamicWidgetManager.GetByName(type);
                result = meta.CreateInstance();
            }
            else if (propName == DynamicTypeSerializer.EVENT_PROPERTY)
            {
                ReadEvents(ref reader, result);
            }
            else if (meta.IsSlot(propName, out var childSlot))
            {
                if (childSlot!.ContainerType == ContainerType.MultiChild)
                {
                    var count = reader.ReadVariant();
                    for (var i = 0; i < count; i++)
                    {
                        var child = ReadWidget(ref reader);
                        childSlot.AddChild(result, child);
                    }
                }
                else
                {
                    var child = ReadWidget(ref reader);
                    childSlot.SetChild(result, child);
                }
            }
            else
            {
                var propMeta = meta.GetPropertyMeta(propName);
                var propValue = reader.ReadDynamicValue(propMeta);
                propMeta.SetRuntimeValue(meta, result, propValue, this);
            }
        }

        return result;
    }

    private void ReadEvents<TReader>(ref TReader reader, Widget widget) where TReader : struct, IInputStream
    {
        var count = reader.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var eventValue = reader.ReadEventValue();
            //绑定事件
            BindEventAction(widget, eventValue.Name, eventValue.Action);
        }
    }

    private void BindEventAction(Widget widget, string eventName, IEventAction eventAction)
    {
        //short path for Button.OnTap
        if (widget is Button button && eventName == nameof(Button.OnTap))
        {
            button.OnTap = e => eventAction.Run(this, e);
            return;
        }

        var widgetType = widget.GetType();
        var eventPropInfo = widgetType.GetProperty(eventName, BindingFlags.Public | BindingFlags.Instance);
        if (eventPropInfo == null)
        {
            Notification.Error($"Can't find event: {widgetType.Name}.{eventName}");
            return;
        }

        var actionType = eventPropInfo.PropertyType;
        var parameterTypes = DelegateTypeUtils.GetDelegateParameterTypes(actionType);
        var runMethodInfo = typeof(IEventAction).GetMethod(nameof(IEventAction.Run))!;

        var contextArg = Expression.Parameter(typeof(IDynamicContext), "context");
        var widgetArg = Expression.Parameter(typeof(Widget), "widget");
        var eventActionArg = Expression.Parameter(typeof(IEventAction), "eventAction");
        ParameterExpression[]? runParameters = null;
        if (parameterTypes.Length > 0)
        {
            runParameters = new ParameterExpression[parameterTypes.Length];
            for (var i = 0; i < runParameters.Length; i++)
            {
                runParameters[i] = Expression.Parameter(parameterTypes[i]);
            }
        }

        // eg: _ => eventAction.Run(context, null)
        var runExpression = Expression.Lambda(actionType,
            Expression.Call(eventActionArg, runMethodInfo, contextArg, Expression.Constant(null)),
            runParameters);

        var castWidget = Expression.Convert(widgetArg, widgetType);
        var memberAccess = Expression.MakeMemberAccess(castWidget, eventPropInfo);
        var assignExpression = Expression.Assign(memberAccess, runExpression);
        // eg: ((Button)widget).OnTap = _ => eventAction.Run(context, null)
        var lambda = Expression.Lambda<Action<IDynamicContext, Widget, IEventAction>>(
                assignExpression, contextArg, widgetArg, eventActionArg)
            .Compile(); //TODO: maybe cache (WidgetType, eventName) => compiled lambda
        lambda(this, widget, eventAction);
    }

    #endregion
}