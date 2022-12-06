using System;
using System.Threading.Tasks;
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


#if __WEB__
        [TSRawScript(@"
        public GetWidgetAsync() : Promise<PixUI.Widget> {
            return this.Route.Builder(this._settings);
        }")]
        internal Task<Widget> GetWidgetAsync() => throw new Exception();
#else
        internal Widget GetWidget()
        {
            if (_widget != null) return _widget;

            _widget = Route.Builder(_settings);
            return _widget;
        }
#endif
    }

    /// <summary>
    /// 路由历史管理，一个UIWindow对应一个实例
    /// </summary>
    public sealed class RouteHistoryManager
    {
        private readonly List<RouteHistoryEntry> _history = new List<RouteHistoryEntry>();
        private int _historyIndex = -1;

        internal bool IsEmpty => _history.Count == 0;

        internal void Push(RouteHistoryEntry entry)
        {
            //先清空之后的记录
            if (_historyIndex != _history.Count - 1)
            {
                //TODO: dispose will removed widgets
                _history.RemoveRange(_historyIndex + 1, _history.Count - _historyIndex - 1);
            }

            _history.Add(entry);
            _historyIndex++;
        }

        internal RouteHistoryEntry? Pop()
        {
            if (_historyIndex <= 0) return null;

            var oldEntry = _history[_historyIndex];
            _historyIndex--;
            return oldEntry;
        }
    }
}