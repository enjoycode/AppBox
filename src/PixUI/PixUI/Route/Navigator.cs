using System;
using System.Collections.Generic;

namespace PixUI
{
    public enum RouteChangeAction
    {
        Push,
        Pop,
    }

    /// <summary>
    /// 路由历史项
    /// </summary>
    internal class RouteEntry
    {
        private readonly RouteSettings _settings;
        private Widget? _widget;

        internal Route Route { get; }

        internal RouteEntry(Route route, RouteSettings settings)
        {
            Route = route;
            _settings = settings;
        }

        internal Widget GetWidget()
        {
            if (_widget != null) return _widget;

            _widget = Route.Builder(_settings);
            return _widget;
        }
    }

    /// <summary>
    /// 路由导航器，与RouteView一对一绑定控制其导航
    /// </summary>
    public sealed class Navigator
    {
        private readonly List<Route> _routes = new List<Route>();
        private readonly List<RouteEntry> _history = new List<RouteEntry>();
        private int _histroyIndex = -1;

        /// <summary>
        /// 路由改变时的通知绑定的RouteView重新Build
        /// </summary>
        internal Action<RouteChangeAction, Route>? OnRouteChanged;

        public Navigator(IList<Route> routes)
        {
            _routes.AddRange(routes);
        }

        /// <summary>
        /// 用于RouteView.Build时获取当前的Widget
        /// </summary>
        internal Widget GetCurrentRoute()
        {
            if (_routes.Count == 0)
                return new Text("Empty routes");

            if (_history.Count != 0) return _history[_histroyIndex].GetWidget();

            //初始化
            var entry = new RouteEntry(_routes[0], RouteSettings.Empty);
            _history.Add(entry);
            _histroyIndex = 0;
            return entry.GetWidget();
        }

        public void PushNamed(string name)
        {
            //TODO:判断当前路由一致（包括动态参数）,是则忽略

            //先清空之后的记录
            if (_histroyIndex != _history.Count - 1)
            {
                //TODO: dispose will removed widgets
                _history.RemoveRange(_histroyIndex + 1, _history.Count - _histroyIndex - 1);
            }

            //查找静态路由表
            var matchRoute = _routes.Find(r => r.Name == name);
            if (matchRoute == null)
                throw new ArgumentException($"Can't find route: {name}");

            //添加至历史记录
            var entry = new RouteEntry(matchRoute, new RouteSettings());
            _history.Add(entry);
            _histroyIndex++;

            //通知变更
            OnRouteChanged?.Invoke(RouteChangeAction.Push, matchRoute);
        }

        public void Pop()
        {
            if (_histroyIndex <= 0) return;

            var oldEntry = _history[_histroyIndex];
            _histroyIndex--;

            OnRouteChanged?.Invoke(RouteChangeAction.Pop, oldEntry.Route);
        }
    }
}