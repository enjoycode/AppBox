using System;

namespace PixUI
{
    public interface IRxProperty
    {
        void NotifyValueChanged();
    }

    [TSNoInitializer]
    public sealed class RxProperty<T> : State<T>, IRxProperty
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
        protected virtual void OnObjectChanged()
        {
            //默认使用反射处理, TODO:
            //var rxPropertytype = typeof(RxProperty<>);

            var fields = GetType().GetFields(System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.GetField | System.Reflection.BindingFlags.Public);
            foreach (var field in fields)
            {
                var fieldType = field.FieldType;
                if (fieldType.Name == "RxProperty`1")
                {
                    var state = (IRxProperty)field.GetValue(this);
                    state.NotifyValueChanged();
                }
            }
        }
#endif
    }
}