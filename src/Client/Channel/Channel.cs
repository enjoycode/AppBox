using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxCore.Channel;

namespace AppBoxClient;

public static class Channel
{
    #region ====ServerEvent Handlers====

    private readonly struct EventSubscriber
    {
        public EventSubscriber(object subscriber, Action<IServerEventArgs> handler)
        {
            Subscriber = subscriber;
            Handler = handler;
        }

        public readonly object Subscriber;
        public readonly Action<IServerEventArgs> Handler;
    }

    private static readonly Dictionary<int, List<EventSubscriber>> EventSubscribers = new();

    //TODO:以下方法加入参数是否需要通知服务端订阅

    public static void AddEventSubscriber(int eventId, object subscriber, Action<IServerEventArgs> handler)
    {
        lock (EventSubscribers)
        {
            if (EventSubscribers.TryGetValue(eventId, out var subscribers))
            {
                //暂不允许重复加入相同的订阅者
                if (!subscribers.Exists(s => s.Subscriber == subscriber))
                    subscribers.Add(new EventSubscriber(subscriber, handler));
            }
            else
            {
                var newList = new List<EventSubscriber> { new(subscriber, handler) };
                EventSubscribers.Add(eventId, newList);
            }
        }
    }

    public static void RemoveEventSubscriber(int eventId, object subscriber)
    {
        lock (EventSubscribers)
        {
            if (EventSubscribers.TryGetValue(eventId, out var subscribers))
            {
                subscribers.RemoveAll(s => s.Subscriber == subscriber);
                if (subscribers.Count == 0)
                    EventSubscribers.Remove(eventId);
            }
        }
    }

    internal static void RaiseServerEvent<T>(int eventId, ref T inputStream) where T : struct, IInputStream
    {
        lock (EventSubscribers)
        {
            if (EventSubscribers.TryGetValue(eventId, out var subscribers))
            {
                var eventArgs = ServerEventArgs.From(ref inputStream);
                foreach (var subscriber in subscribers)
                    subscriber.Handler(eventArgs);
            }
        }
    }

    #endregion

    public static string SessionName => Provider.SessionName;

    public static Guid LeafOrgUnitId => Provider?.LeafOrgUnitId ?? Guid.Empty;

    public static IClientChannel Provider { get; private set; } = null!;

    public static void Init(IClientChannel provider)
    {
        Provider = provider;
    }

    public static Task Login(string user, string password, string? external = null)
        => Provider.Login(user, password, external);

    public static Task Logout() => Provider.Logout();

    public static Task Invoke(string service) => Provider.Invoke(service, AnyArgs.Empty);

    public static Task Invoke(string service, AnyValue arg) => Provider.Invoke(service, AnyArgs.Make(arg));

    public static Task Invoke(string service, AnyValue arg1, AnyValue arg2) =>
        Provider.Invoke(service, AnyArgs.Make(arg1, arg2));

    public static Task Invoke(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3) =>
        Provider.Invoke(service, AnyArgs.Make(arg1, arg2, arg3));

    public static Task Invoke(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4) =>
        Provider.Invoke(service, AnyArgs.Make(arg1, arg2, arg3, arg4));

    public static Task Invoke(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4, AnyValue arg5)
        => Provider.Invoke(service, AnyArgs.Make(arg1, arg2, arg3, arg4, arg5));

    public static async Task<T?> Invoke<T>(string service, EntityFactory[]? entityFactories = null)
        where T : notnull =>
        (await Provider.Invoke(service, AnyArgs.Empty, entityFactories)).CastTo<T>();

    public static async Task<T?> Invoke<T>(string service, AnyValue arg, EntityFactory[]? entityFactories = null)
        where T : notnull =>
        (await Provider.Invoke(service, AnyArgs.Make(arg), entityFactories)).CastTo<T>();

    public static async Task<T?> Invoke<T>(string service, AnyValue arg1, AnyValue arg2,
        EntityFactory[]? entityFactories = null) where T : notnull =>
        (await Provider.Invoke(service, AnyArgs.Make(arg1, arg2), entityFactories)).CastTo<T>();

    public static async Task<T?> Invoke<T>(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3,
        EntityFactory[]? entityFactories = null) where T : notnull =>
        (await Provider.Invoke(service, AnyArgs.Make(arg1, arg2, arg3), entityFactories)).CastTo<T>();

    public static async Task<T?> Invoke<T>(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4,
        EntityFactory[]? entityFactories = null) where T : notnull =>
        (await Provider.Invoke(service, AnyArgs.Make(arg1, arg2, arg3, arg4), entityFactories)).CastTo<T>();

    public static async Task<T?> Invoke<T>(string service, AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4,
        AnyValue arg5, EntityFactory[]? entityFactories = null) where T : notnull =>
        (await Provider.Invoke(service, AnyArgs.Make(arg1, arg2, arg3, arg4, arg5), entityFactories)).CastTo<T>();

    public static Task Upload(string service, BytesPipeWriter writer) =>
        Provider.Upload(service, writer, AnyArgs.Empty);

    public static Task Upload(string service, BytesPipeWriter writer, AnyValue arg) =>
        Provider.Upload(service, writer, AnyArgs.Make(arg));

    public static Task Upload(string service, BytesPipeWriter writer, AnyValue arg1, AnyValue arg2) =>
        Provider.Upload(service, writer, AnyArgs.Make(arg1, arg2));

    public static async Task<T?> Upload<T>(string service, BytesPipeWriter writer, AnyValue arg1, AnyValue arg2)
        where T : notnull =>
        (await Provider.Upload(service, writer, AnyArgs.Make(arg1, arg2))).CastTo<T>();

    public static Task Download(string service, Stream stream) =>
        Provider.Download(service, stream, AnyArgs.Empty);

    public static Task Download(string service, Stream stream, AnyValue arg) =>
        Provider.Download(service, stream, AnyArgs.Make(arg));

    public static Task Download(string service, Stream stream, AnyValue arg1, AnyValue arg2, AnyValue arg3) =>
        Provider.Download(service, stream, AnyArgs.Make(arg1, arg2, arg3));

    //暂时放在这里，待移至RuntimeContext内
    public static Task<bool> HasPermission(ModelId permissionModelId)
    {
        if (permissionModelId.Type != ModelType.Permission)
        {
            // Log.Error("Not a Permission model");
            return Task.FromResult(false);
        }

        try
        {
            return Invoke<bool>("sys.SystemService.HasPermission", permissionModelId.Value);
        }
        catch (Exception)
        {
            // Log.Error($"Check has permission error: {e.Message}");
            return Task.FromResult(false);
        }
    }
}