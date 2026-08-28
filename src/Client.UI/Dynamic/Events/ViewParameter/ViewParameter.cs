using AppBoxCore;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 视图参数，主要用于视图间切换时向目标视图传入状态参数
/// </summary>
public sealed class ViewParameter : IBinSerializable
{
    /// <summary>
    /// 目标状态名称 eg: "customer" or "customer.id"
    /// </summary>
    public string StateName { get; set; } = null!;

    public IViewParameterSource Source { get; set; } = null!;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(StateName);
        ws.WriteString(Source.TypeName);
        Source.WriteTo(ref ws);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        StateName = rs.ReadString()!;
        var sourceType = rs.ReadString()!;
        Source = CreateParameterSource(sourceType);
        Source.ReadFrom(ref rs);
    }

    private static IViewParameterSource CreateParameterSource(string sourceTypeName) => sourceTypeName switch
    {
        FetchRowParameter.SourceName => new FetchRowParameter(),
        CreateRowParameter.SourceName => new CreateRowParameter(),
        _ => throw new Exception("Unknown ViewParameter type: " + sourceTypeName)
    };
}