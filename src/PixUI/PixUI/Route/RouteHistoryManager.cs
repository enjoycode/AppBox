using System.Collections.Generic;

namespace PixUI
{
    /// <summary>
    /// 路由历史项
    /// </summary>
    internal sealed class RouteHistoryEntry
    {
        internal RouteHistoryEntry(Route route, RouteSettings settings)
        {
            Route = route;
            _settings = settings;
        }
        
        private readonly RouteSettings _settings;
        private Widget? _widget;

        internal readonly Route Route;

        internal Widget GetWidget()
        {
            if (_widget != null) return _widget;

            _widget = Route.Builder(_settings);
            return _widget;
        }
    }
    
    /// <summary>
    /// 路由历史管理，一个UIWindow对应一个实例
    /// </summary>
    public sealed class RouteHistoryManager
    {
        
        private readonly List<RouteHistoryEntry> _history = new List<RouteHistoryEntry>();
        private int _histroyIndex = -1;
        
        internal bool IsEmpty => _history.Count == 0;

        internal void Push(RouteHistoryEntry entry)
        {
            //先清空之后的记录
            if (_histroyIndex != _history.Count - 1)
            {
                //TODO: dispose will removed widgets
                _history.RemoveRange(_histroyIndex + 1, _history.Count - _histroyIndex - 1);
            }

            _history.Add(entry);
            _histroyIndex++;
        }

        internal Route? Pop()
        {
            if (_histroyIndex <= 0) return null;

            var oldEntry = _history[_histroyIndex];
            _histroyIndex--;
            return oldEntry.Route;
        }

        /// <summary>
        /// 用于RouteView.Build时获取当前的Widget
        /// </summary>
        internal Widget GetCurrentWidget()
        {
            return _history[_histroyIndex].GetWidget();
        }
    }
}