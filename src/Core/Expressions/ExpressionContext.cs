using System.Diagnostics;

namespace AppBoxCore;

/// <summary>
/// 表达式上下文，用于解析运行时类型或表达式参数
/// </summary>
public interface IExpressionContext
{
    AnyValue ResolveParameter(string parameterName);

    Type ResolveType(in ExpressionTypeInfo typeInfo);

    //TODO: AddParameter(string parameterName, AnyValue value);
}

public class ExpressionContext : IExpressionContext
{
    public static readonly ExpressionContext Default = new();

    public virtual AnyValue ResolveParameter(string parameterName) => throw new NotSupportedException();

    private static Type GetKnownType(in ExpressionTypeInfo typeInfo) => typeInfo.Type switch
    {
        ExpressionTypeInfo.KnownType.Boolean => typeInfo.IsNullable ? typeof(bool?) : typeof(bool),
        ExpressionTypeInfo.KnownType.Byte => typeInfo.IsNullable ? typeof(byte?) : typeof(byte),
        ExpressionTypeInfo.KnownType.SByte => typeInfo.IsNullable ? typeof(sbyte?) : typeof(sbyte),
        ExpressionTypeInfo.KnownType.Char => typeInfo.IsNullable ? typeof(char?) : typeof(char),
        ExpressionTypeInfo.KnownType.Int16 => typeInfo.IsNullable ? typeof(short?) : typeof(short),
        ExpressionTypeInfo.KnownType.UInt16 => typeInfo.IsNullable ? typeof(ushort?) : typeof(ushort),
        ExpressionTypeInfo.KnownType.Int32 => typeInfo.IsNullable ? typeof(int?) : typeof(int),
        ExpressionTypeInfo.KnownType.UInt32 => typeInfo.IsNullable ? typeof(uint?) : typeof(uint),
        ExpressionTypeInfo.KnownType.Int64 => typeInfo.IsNullable ? typeof(long?) : typeof(long),
        ExpressionTypeInfo.KnownType.UInt64 => typeInfo.IsNullable ? typeof(ulong?) : typeof(ulong),
        ExpressionTypeInfo.KnownType.Float => typeInfo.IsNullable ? typeof(float?) : typeof(float),
        ExpressionTypeInfo.KnownType.Double => typeInfo.IsNullable ? typeof(double?) : typeof(double),
        ExpressionTypeInfo.KnownType.Decimal => typeInfo.IsNullable ? typeof(decimal?) : typeof(decimal),
        ExpressionTypeInfo.KnownType.DateTime => typeInfo.IsNullable ? typeof(DateTime?) : typeof(DateTime),
        ExpressionTypeInfo.KnownType.Guid => typeInfo.IsNullable ? typeof(Guid?) : typeof(Guid),
        ExpressionTypeInfo.KnownType.String => typeof(string),
        ExpressionTypeInfo.KnownType.Object => typeof(object),
        ExpressionTypeInfo.KnownType.Void => typeof(void),
        _ => throw new UnreachableException()
    };

    public Type ResolveType(in ExpressionTypeInfo typeInfo)
    {
        var knownType = typeInfo.Type;
        switch (knownType)
        {
            case ExpressionTypeInfo.KnownType.Empty: throw new NotSupportedException();
            case ExpressionTypeInfo.KnownType.Array:
            {
                //TODO: fix multi dim
                if (!typeInfo.HasTypes) return typeof(object[]);
                var elementType = ResolveType(typeInfo.Types![0]);
                return elementType.MakeArrayType();
            }
            case ExpressionTypeInfo.KnownType.List:
            {
                var genericType = ResolveType(typeInfo.Types![0]);
                return typeof(List<>).MakeGenericType(genericType);
            }
            case ExpressionTypeInfo.KnownType.Dictionary:
            {
                var genericType1 = ResolveType(typeInfo.Types![0]);
                var genericType2 = ResolveType(typeInfo.Types![1]);
                return typeof(Dictionary<,>).MakeGenericType(genericType1, genericType2);
            }
            case ExpressionTypeInfo.KnownType.Unknown:
            {
                var type = Type.GetType(typeInfo.TypeName);
                if (type == null)
                    throw new Exception($"Can't find type: {typeInfo.TypeName} ");

                if (typeInfo.Types is { Length: > 0 })
                {
                    var genericTypes = new Type[typeInfo.Types.Length];
                    for (var i = 0; i < genericTypes.Length; i++)
                    {
                        genericTypes[i] = ResolveType(typeInfo.Types[i]);
                    }

                    type = type.MakeGenericType(genericTypes);
                }

                return type;
            }
            default: return GetKnownType(typeInfo);
        }
    }
}