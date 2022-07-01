using System;

namespace PixUI
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct)]
    public sealed class TSNoInitializerAttribute : Attribute { }
}