using AppBoxClient.Dynamic.Events;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class EventActionManager : IEventActionManager
{
    public EventActionManager()
    {
        Register<FetchData>(DataSourceGroup);
        Register<SaveData>(DataSourceGroup);
        Register<ShowDialog>(NavigationGroup);
    }

    private const string DataSourceGroup = "DataSource";
    private const string NavigationGroup = "Navigation";

    private readonly Dictionary<string, EventActionInfo> _eventActions = new();

    private void Register<T>(string groupName) where T : IEventAction, new()
    {
        var actionName = typeof(T).Name;
        _eventActions.Add(actionName, new(groupName, actionName, () => new T()));
    }

    public IList<EventActionInfo> GetAll() => _eventActions.Values.ToArray();

    public IEventAction Create(string actionName)
    {
        if (_eventActions.TryGetValue(actionName, out var info))
            return info.Creator();
        throw new Exception($"Can't find event action: {actionName}");
    }
}