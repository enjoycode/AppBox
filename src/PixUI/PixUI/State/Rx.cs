using System;

namespace PixUI
{
    [TSNoInitializer]
    public sealed class Rx<T> : State<T>
    {
        private T _value;

        public override bool Readonly => false;

        public override T Value
        {
            get => _value;
            set
            {
                //TODO:相等判断
                _value = value;
                OnValueChanged();
            }
        }

        public Rx(T value)
        {
            _value = value;
        }

        //类似Nullable<T>暂不支持隐式转换为相应的值
        //public static implicit operator T(Rx<T> rx) => rx.Value;

        public static implicit operator Rx<T>(T value) => new Rx<T>(value);
    }
}