using System;
using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 发布时变更的模型信息，仅用于前端显示变更项
/// </summary>
internal struct ChangedModel : IBinSerializable
{
    public string ModelType;
    public string ModelId;

#if __APPBOXDESIGN__
    public void WriteTo(IOutputStream ws)
    {
        ws.WriteString(ModelType);
        ws.WriteString(ModelType);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();
#else
    public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

    public void ReadFrom(IInputStream rs)
    {
        ModelType = rs.ReadString()!;
        ModelId = rs.ReadString()!;
    }
#endif
}