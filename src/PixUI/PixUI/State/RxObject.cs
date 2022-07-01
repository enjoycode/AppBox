using System;

namespace PixUI
{
    [TSNoInitializer]
    public sealed class RxProperty<T> : State<T>
    {
        public RxProperty(Func<T> getter,
            Action<T>? setter = null)
        {
            _getter = getter;
            _setter = setter;
        }

        private readonly Func<T> _getter;
        private readonly Action<T>? _setter;

        public override bool Readonly => _setter == null;

        public override T Value
        {
            get => _getter();
            set
            {
                if (_setter == null)
                    throw new NotSupportedException();
                _setter(value);
                OnValueChanged();
            }
        }

        public void NotifyValueChanged() => OnValueChanged();
    }

    public abstract class RxObject<T> where T : class
    {
        private T _object = null!;

        public T Object
        {
            get => _object;
            set
            {
                _object = value;
                OnObjectChanged();
            }
        }

#if __WEB__
        [TSRawScript(@"
        private OnObjectChanged() {
            const props = Object.getOwnPropertyNames(this);
            for(let prop of props) {
                // @ts-ignore
                if (this[prop] instanceof PixUI.RxProperty) {
                    // @ts-ignore
                    this[prop].NotifyValueChanged();
                }
            }
        }
")]
        private void OnObjectChanged() {}
#else
        protected abstract void OnObjectChanged();
#endif
    }
}