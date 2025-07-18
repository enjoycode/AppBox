using System;

namespace AppBoxDesign;

public sealed class ServiceMethodInfo
{
    public string Name { get; set; } = null!;

    public ServiceMethodParameterInfo[] Args { get; set; } = null!;
}

public sealed class ServiceMethodParameterInfo
{
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;

    /// <summary>
    /// 转换为非空运行时类型
    /// </summary>
    public Type ConvertToRuntimeType(out bool allowNull)
    {
        allowNull = Type.EndsWith('?');
        return Type switch
        {
            "string" or "string?" => typeof(string),
            "bool" or "bool?" => typeof(bool),
            "int" or "int?" => typeof(int),
            "long" or "long?" => typeof(long),
            "System.DateTime" or "System.DateTime?" => typeof(DateTime),
            //TODO: others supported
            _ => throw new NotImplementedException($"Type: {Type} to runtime type")
        };
    }
}