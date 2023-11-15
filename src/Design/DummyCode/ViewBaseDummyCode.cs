using PixUI;
using AppBoxCore;

namespace PixUI
{
    public sealed class DynamicWidget : Widget
    {
        public DynamicWidget(long modelId, IDictionary<string, object?>? initProps = null) {}
    }
    
    [AttributeUsage(AttributeTargets.Class)]
    public sealed class DynamicWidgetAttribute : Attribute
    {
        public DynamicWidgetAttribute(string catalog = "", string name = "", string icon = "")
        {
            Catalog = catalog;
            Name = name;
            Icon = icon;
        }

        public readonly string Catalog;
        public readonly string Name;
        public readonly string Icon;
    }

    [AttributeUsage(AttributeTargets.Property)]
    public sealed class DynamicPropertyAttribute : Attribute { }
}

namespace AppBoxClient
{
    public interface IHomePage
    {
        void InjectRoute(RouteBase route);
        
        Navigator? Navigator { get; }
    }

    public static class Channel
    {
        public static Task Login(string user, string password, object? external = null)
            => throw new Exception();

        public static Task Logout() => throw new Exception();
    }

    public sealed class RxEntity<T> : RxObject<T> where T : Entity, new()
    {
        public State<TMember> Observe<TMember>(Func<T, TMember> getter)
            => throw new Exception();
    }

    public static class EntityExtensions
    {
        public static State<TMember> Observe<TEntity, TMember>(this TEntity entity, Func<TEntity, TMember> getter)
            where TEntity : Entity
            => throw new Exception();
    }

    public static class ObjectNotifierExtensions
    {
        public static void BindToRxEntity<T>(this ObjectNotifier<T> notifier, RxEntity<T> rxEntity)
            where T : Entity, new()
            => throw new Exception();
    }
}

