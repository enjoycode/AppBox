using System;

namespace PixUI
{
    public sealed class WhenBuilder<T>
    {
        internal readonly Predicate<T> Match;
        internal readonly Func<Widget> Builder;
        private Widget? _cachedWidget;

        public WhenBuilder(Predicate<T> match, Func<Widget> builder)
        {
            Match = match;
            Builder = builder;
        }

        public Widget? GetWidget()
        {
            if (_cachedWidget == null)
                _cachedWidget = Builder();
            return _cachedWidget;
        }
    }

    /// <summary>
    /// 根据状态条件构建不同的子组件
    /// </summary>
    public class Conditional<T> : DynamicView //where T: IEquatable<T>
    {
        public Conditional(State<T> state, WhenBuilder<T>[] whens)
        {
            IsLayoutTight = true;
            _state = Bind(state, BindingOptions.AffectsLayout);
            _whens = whens;

            Child = MakeChildByCondition();
        }
        
        private readonly State<T> _state;
        private readonly WhenBuilder<T>[] _whens;
        
        //TODO: add AutoDispose property to dispose not used widget

        private Widget? MakeChildByCondition()
        {
            foreach (var item in _whens)
            {
                //EqualityComparer<T>.Default.Equals(item.StateValue, _state.Value)
                if (item.Match(_state.Value))
                {
                    return item.GetWidget();
                }
            }

            return null;
        }

        public override void OnStateChanged(StateBase state, BindingOptions options)
        {
            if (ReferenceEquals(state, _state))
            {
                var newChild = MakeChildByCondition();
                ReplaceTo(newChild);
                return;
            }

            base.OnStateChanged(state, options);
        }
    }
}