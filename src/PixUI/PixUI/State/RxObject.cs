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
                NotifyValueChanged();
            }
        }
    }

    public abstract class RxObject<T> where T : class
    {
        private T _target = null!;

        /// <summary>
        /// 代理的目标对象实例
        /// </summary>
        public T Target
        {
            get => _target;
            set
            {
                _target = value;
                OnTargetChanged();
            }
        }

#if __WEB__
        [TSRawScript(@"
        private OnTargetChanged() {
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
        private void OnTargetChanged() {}
#else
        protected virtual void OnTargetChanged()
        {
            //默认使用反射处理, TODO:
            //var rxPropertyType = typeof(RxProperty<>);

            var fields = GetType().GetFields(System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.GetField | System.Reflection.BindingFlags.Public);
            foreach (var field in fields)
            {
                var fieldType = field.FieldType;
                if (fieldType.Name == "RxProperty`1")
                {
                    var state = (StateBase)field.GetValue(this);
                    state.NotifyValueChanged();
                }
            }
        }
#endif
    }
}