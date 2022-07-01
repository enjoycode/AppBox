#if __WEB__
using System;

namespace PixUI
{
    [TSType("PixUI.Matrix4")]
    public struct Matrix4 : IEquatable<Matrix4>
    {
        public float M0 { get; private set; }
        public float M1 { get; private set; }
        public float M2 { get; private set; }
        public float M3 { get; private set; }
        public float M4 { get; private set; }
        public float M5 { get; private set; }
        public float M6 { get; private set; }
        public float M7 { get; private set; }
        public float M8 { get; private set; }
        public float M9 { get; private set; }
        public float M10 { get; private set; }
        public float M11 { get; private set; }
        public float M12 { get; private set; }
        public float M13 { get; private set; }
        public float M14 { get; private set; }
        public float M15 { get; private set; }

        public static Matrix4 CreateIdentity() => new Matrix4();

        public static Matrix4 CreateTranslation(float x, float y, float z) => new Matrix4();

        public static Matrix4? TryInvert(Matrix4 other) => null;

        public void Translate(float x, float y = 0.0f, float z = 0.0f) { }

        public void RotateZ(float angle) { }

        public void PreConcat(in Matrix4 m) { }

        public void Multiply(in Matrix4 arg) { }

        public void SetColumn(int column, Vector4 arg) { }

        public void SetRow(int row, Vector4 arg) { }

        public bool Equals(Matrix4 other) => true;
        
        public static bool operator ==(Matrix4 left, Matrix4 right) => left.Equals(right);

        public static bool operator !=(Matrix4 left, Matrix4 right) => !left.Equals(right);
    }
}
#endif