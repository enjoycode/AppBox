using System;
using System.Collections.Generic;

namespace PixUI
{
    public enum RouteChangeAction
    {
        Init,
        Push,
        Pop,
    }

    /// <summary>
    /// 路由导航器，与RouteView一对一绑定控制其导航
    /// </summary>
    public sealed class Navigator
    {
        public Navigator(IEnumerable<Route> routes)
        {
            _routes.AddRange(routes);
        }

        private readonly List<Route> _routes = new List<Route>();
        public Navigator? Parent { get; internal set; }
        internal RouteHistoryManager? HistoryManager;

        /// <summary>
        /// 路由改变时的通知绑定的RouteView重新Build
        /// </summary>
        internal Action<RouteChangeAction, RouteHistoryEntry>? OnRouteChanged;

        internal void InitRouteWidget()
        {
            if (_routes.Count == 0) return;

            //TODO:获取Url指定的路由

            var entry = new RouteHistoryEntry(_routes[0], RouteSettings.Empty);
            HistoryManager!.Push(entry);
            OnRouteChanged?.Invoke(RouteChangeAction.Init, entry);
        }

        public void PushNamed(string name)
        {
            //TODO:判断当前路由一致（包括动态参数）,是则忽略

            //查找静态路由表
            var matchRoute = _routes.Find(r => r.Name == name);
            if (matchRoute == null) //TODO: 404 not found route
                throw new ArgumentException($"Can't find route: {name}");

            //添加至历史记录
            var entry = new RouteHistoryEntry(matchRoute, RouteSettings.Empty);
            HistoryManager!.Push(entry);

            //通知变更
            OnRouteChanged?.Invoke(RouteChangeAction.Push, entry);
        }

        public void Pop()
        {
            var old = HistoryManager!.Pop();
            if (old != null)
                OnRouteChanged?.Invoke(RouteChangeAction.Pop, old);
        }
    }
}