using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 发布时变更的模型信息，仅用于前端显示变更项
/// </summary>
internal readonly struct ChangedModel : IBinSerializable
{
    private readonly string _modelType;
    private readonly string _modelId;

    public ChangedModel(string modelType, string modelId)
    {
        _modelType = modelType;
        _modelId = modelId;
    }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteString(_modelType);
        ws.WriteString(_modelId);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();
}