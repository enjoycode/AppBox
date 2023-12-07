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

    public Type ConvertToRuntimeType()
    {
        throw new NotImplementedException();
    }
}