using System;
using System.Linq.Expressions;
using System.Reflection;
using AppBoxClient.Dynamic.Events;
using NUnit.Framework;
using PixUI;
using PixUI.Dynamic;

namespace Tests.ClientUI;

public class BindEventTest
{

    public delegate void TestDelegate(string name);
    
    [Test]
    public void BindEventToWidget()
    {
        Widget widget = new Button("Button");
        var eventName = "OnTap";
        IEventAction eventAction = new FetchDataSet();
        
        var widgetType = widget.GetType();
        var eventPropInfo = widgetType.GetProperty(eventName, BindingFlags.Public | BindingFlags.Instance);
        if (eventPropInfo == null)
        {
            throw new Exception($"Can't find event: {widgetType.Name}.{eventName}");
        }

        var actionType = eventPropInfo.PropertyType;
        var parameterTypes = GetDelegateParameterTypes(actionType);
        var runMethodInfo = typeof(IEventAction).GetMethod(nameof(IEventAction.Run))!;
        
        //构建Run表达式, eg:  _ => eventAction.Run(context)
        var contextArg = Expression.Parameter(typeof(IDynamicContext), "context");
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

        var runExpression = Expression.Lambda(actionType,Expression.Call(eventActionArg, runMethodInfo, contextArg), runParameters);
    }
    
    private static Type[] GetDelegateParameterTypes(Type d)
    {
        if (d.BaseType != typeof(MulticastDelegate))
            throw new ArgumentException("Not a delegate.", nameof(d));

        var invoke = d.GetMethod("Invoke");
        if (invoke == null)
            throw new ArgumentException("Not a delegate.", nameof(d));

        ParameterInfo[] parameters = invoke.GetParameters();
        Type[] typeParameters = new Type[parameters.Length];
        for (int i = 0; i < parameters.Length; i++)
        {
            typeParameters[i] = parameters[i].ParameterType;
        }
        return typeParameters;
    }

    private static Type GetDelegateReturnType(Type d)
    {
        if (d.BaseType != typeof(MulticastDelegate))
            throw new ArgumentException("Not a delegate.", nameof(d));

        var invoke = d.GetMethod("Invoke");
        if (invoke == null)
            throw new ArgumentException("Not a delegate.", nameof(d));

        return invoke.ReturnType;
    }
}