using System;
using System.Diagnostics.Tracing;

delegate void NameChangedHandler(object? sender, string name);

abstract class AbstractEventSource
{
    public abstract event Action? Changed;
}

class EventSource
{
    public event Action<bool>? ValueChanged;
    public event Action<string> NameChanged;

    public EventSource()
    {
        ValueChanged += OnValueChangedSelf;
        NameChanged += s => Console.WriteLine(s);
    }

    public void RaiseValueChanged(bool value)
    {
        ValueChanged?.Invoke(value);
        NameChanged("NewName");
    }
    
    private void OnValueChangedSelf(bool value) {}
}

class EventListner
{
    public void OnValueChanged(bool value) { }

    public static void OnValueChangedStatic(bool value) {}
}

class TestClass
{
    public void Test()
    {
        var es = new EventSource();
        var listner = new EventListner();
        es.ValueChanged += listner.OnValueChanged;
        es.ValueChanged += EventListner.OnValueChangedStatic;
        es.ValueChanged -= listner.OnValueChanged;
        es.ValueChanged -= EventListner.OnValueChangedStatic;
    }
}

