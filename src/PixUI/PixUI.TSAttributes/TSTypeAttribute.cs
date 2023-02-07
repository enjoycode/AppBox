using System;

namespace PixUI
{
    /// <summary>
    /// 将C#类转换为对应的TS类型 eg: Color 转为 Float32Array
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct | AttributeTargets.Enum |
                    AttributeTargets.Delegate)]
    public sealed class TSTypeAttribute : Attribute
    {
        public TSTypeAttribute(string runtimeType) { }
    }
}