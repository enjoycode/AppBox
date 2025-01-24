using System;
using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 发布时变更的模型信息，仅用于前端显示变更项
/// </summary>
public sealed class PendingChange : IBinSerializable
{
    public StagedType Type { get; set; }

    /// <summary>
    /// 模型或其他节点的标识
    /// </summary>
    public string Id { get; set; } = null!;

    /// <summary>
    /// 仅客户端解析至相应的模型
    /// </summary>
    public object? Target { get; set; }

    /// <summary>
    /// 仅客户端显示
    /// </summary>
    public string DisplayType { get; set; } = null!;
    
    /// <summary>
    /// 仅客户端显示
    /// </summary>
    public string DisplayName { get; set; } = null!;

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)Type);
        ws.WriteString(Id);
    }

    public void ReadFrom(IInputStream rs)
    {
        Type = (StagedType)rs.ReadByte();
        Id = rs.ReadString()!;
    }
}