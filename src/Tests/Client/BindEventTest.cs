using System;
using System.Linq.Expressions;
using System.Reflection;
using AppBoxClient.Dynamic.Events;
using AppBoxClient.Utils;
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
        var parameterTypes = DelegateTypeUtils.GetDelegateParameterTypes(actionType);
        var runMethodInfo = typeof(IEventAction).GetMethod(nameof(IEventAction.Run))!;
        
        //构建Run表达式, eg:  _ => eventAction.Run(context)
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

        var lambda = Expression.Lambda<Action<IDynamicContext, Widget, IEventAction>>(
            assignExpression, contextArg, widgetArg, eventActionArg);
            //.Compile();
    }
    
    
}