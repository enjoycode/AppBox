using System;
using System.Collections.Generic;

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
                if (IsValueEquals(_value, value)) return;
                _value = value;
                OnValueChanged();
            }
        }

        [TSTemplate("System.Equals({1}, {2})")] //TODO:考虑CS2TS直接转换EqualityComparer
        private static bool IsValueEquals(T a, T b)
            => EqualityComparer<T>.Default.Equals(a, b);

        public Rx(T value)
        {
            _value = value;
        }

        //类似Nullable<T>暂不支持隐式转换为相应的值
        //public static implicit operator T(Rx<T> rx) => rx.Value;

        public static implicit operator Rx<T>(T value) => new Rx<T>(value);
    }
}