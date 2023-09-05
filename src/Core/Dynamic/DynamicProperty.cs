using System.Runtime.InteropServices;

namespace AppBoxCore;

[Flags]
public enum DynamicPropertyFlag : byte
{
    Empty = 0,
    Object = 1,
    Boolean = 2,
    Byte = 3,
    Int16 = 4,
    Int32 = 5,
    Int64 = 6,
    Float = 7,
    Double = 8,
    DateTime = 9,
    Decimal = 10,
    Guid = 11,
    TypeMask = 0xF,
}

[StructLayout(LayoutKind.Explicit, Pack = 4)]
public struct DynamicProperty
{
    public static readonly DynamicProperty Empty = new() { _flag = DynamicPropertyFlag.Empty };

    #region ====内存结构===

    [field: FieldOffset(0)] public bool BoolValue { get; private set; }
    [field: FieldOffset(0)] public byte ByteValue { get; private set; }
    [field: FieldOffset(0)] public short ShortValue { get; private set; }
    [field: FieldOffset(0)] public int IntValue { get; private set; }
    [field: FieldOffset(0)] public long LongValue { get; private set; }
    [field: FieldOffset(0)] public float FloatValue { get; private set; }
    [field: FieldOffset(0)] public double DoubleValue { get; private set; }
    [field: FieldOffset(0)] public DateTime DateTimeValue { get; private set; }
    [field: FieldOffset(0)] public decimal DecimalValue { get; private set; }
    [field: FieldOffset(0)] public Guid GuidValue { get; private set; }

    [FieldOffset(16)] private object? _ObjectValue;

    [FieldOffset(24)] private DynamicPropertyFlag _flag;

    #endregion

    public bool HasValue => (_flag & DynamicPropertyFlag.TypeMask) == DynamicPropertyFlag.Object
        ? _ObjectValue != null
        : (_flag & DynamicPropertyFlag.TypeMask) != 0;

    #region ====隐式转换=====

    public static implicit operator DynamicProperty(int? v) =>
        v.HasValue ? new() { IntValue = v.Value, _flag = DynamicPropertyFlag.Int32 } : Empty;

    public static implicit operator int?(DynamicProperty p) => p.HasValue ? p.IntValue : null;

    public static implicit operator DynamicProperty(string? v) =>
        new() { _ObjectValue = v, _flag = DynamicPropertyFlag.Object };

    public static implicit operator string?(DynamicProperty p) => p.HasValue ? (string)p._ObjectValue! : null;

    #endregion
}