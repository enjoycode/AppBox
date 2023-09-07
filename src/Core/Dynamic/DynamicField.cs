using System.Runtime.InteropServices;

namespace AppBoxCore;

[Flags]
public enum DynamicFieldFlag : byte
{
    //注意类型名称与EntityFieldType一致,值暂不需要一致
    Empty = 0,
    String = 1,
    Binary = 2,
    Bool = 3,
    Byte = 4,
    Short = 5,
    Int = 6,
    Long = 7,
    Float = 8,
    Double = 9,
    DateTime = 10,
    Decimal = 11,
    Guid = 12,
    TypeMask = 0xF,
    Changed = 0x80,
}

[StructLayout(LayoutKind.Explicit, Pack = 4)]
public struct DynamicField
{
    public static readonly DynamicField Empty = new() { _flag = DynamicFieldFlag.Empty };

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

    [FieldOffset(24)] private DynamicFieldFlag _flag;

    #endregion

    public bool HasValue
    {
        get
        {
            var type = _flag & DynamicFieldFlag.TypeMask;
            if (type is DynamicFieldFlag.String or DynamicFieldFlag.Binary)
                return _ObjectValue != null;
            return type != DynamicFieldFlag.Empty;
        }
    }

    #region ====隐式转换=====

    public static implicit operator DynamicField(int? v) =>
        v.HasValue ? new() { IntValue = v.Value, _flag = DynamicFieldFlag.Int } : Empty;

    public static implicit operator int?(DynamicField p) => p.HasValue ? p.IntValue : null;

    public static implicit operator DynamicField(string? v) =>
        new() { _ObjectValue = v, _flag = DynamicFieldFlag.String };

    public static implicit operator string?(DynamicField p) => p.HasValue ? (string)p._ObjectValue! : null;

    #endregion
}