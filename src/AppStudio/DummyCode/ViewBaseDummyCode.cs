using System.Threading.Tasks;
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
    public sealed class DynamicPropertyAttribute : Attribute
    {
        public DynamicPropertyAttribute(bool allowNull = false, bool initSetter = false, 
            object? initValue = null, string? editor = null)
        {
            AllowNull = allowNull;
            Editor = editor;
            InitValue = initValue;
            InitSetter = initSetter;
        }

        /// <summary>
        /// 仅对属性类型为引用类型有效
        /// </summary>
        public readonly bool AllowNull;

        /// <summary>
        /// 指定属性编辑器名称
        /// </summary>
        public readonly string? Editor;

        /// <summary>
        /// 属性的初始化值
        /// </summary>
        public readonly object? InitValue;
        
        public readonly bool InitSetter;
    }
}

namespace AppBoxClient
{
    [AttributeUsage(AttributeTargets.Class)]
    public sealed class PermissionAttribute : Attribute
    {
        public PermissionAttribute() {}
    }
    
    public interface IHomePage
    {
        void InjectRoute(RouteBase route);
    }

    public static class Channel
    {
        public static Task Login(string user, string password, object? external = null)
            => throw new Exception();

        public static Task Logout() => throw new Exception();
    }

    public sealed class RxEntity<T> : RxObjectBase<T> where T : Entity, new()
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
}

