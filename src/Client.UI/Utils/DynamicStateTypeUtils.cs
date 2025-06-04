using AppBoxCore;
using PixUI.Dynamic;

namespace AppBoxClient.Utils;

internal static class DynamicStateTypeUtils
{
    public static DynamicStateType ToDynamicStateType(this DataType flag) => (flag & DataType.TypeMask) switch
    {
        DataType.String => DynamicStateType.String,
        DataType.Int => DynamicStateType.Int,
        DataType.DateTime => DynamicStateType.DateTime,
        DataType.Float => DynamicStateType.Float,
        DataType.Double => DynamicStateType.Double,
        _ => throw new NotImplementedException(),
    };
}