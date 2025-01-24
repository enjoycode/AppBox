using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 设计节点的签出信息
/// </summary>
public sealed class CheckoutInfo : IBinSerializable
{
    internal CheckoutInfo() { }

    public CheckoutInfo(DesignNodeType nodeType, string targetId,
        int version, string developerName, Guid developerOuId)
    {
        NodeType = nodeType;
        TargetId = targetId;
        Version = version;
        DeveloperName = developerName;
        DeveloperOuid = developerOuId;
        CheckoutTime = DateTime.Now;
    }

    public DesignNodeType NodeType { get; private set; }

    public bool IsSingleModel => NodeType == DesignNodeType.ModelNode;
    public string TargetId { get; private set; } = null!;
    public int Version { get; private set; }
    public string DeveloperName { get; private set; } = null!;
    public Guid DeveloperOuid { get; private set; }
    public DateTime CheckoutTime { get; private set; }

    public string GetKey() => MakeKey(NodeType, TargetId);

    public static string MakeKey(DesignNodeType nodeType, string targetId)
    {
        return $"{(byte)nodeType}|{targetId}";
    }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)NodeType);
        ws.WriteString(TargetId);
        ws.WriteInt(Version);
        ws.WriteString(DeveloperName);
        ws.WriteGuid(DeveloperOuid);
        ws.WriteDateTime(CheckoutTime);
    }

    public void ReadFrom(IInputStream rs)
    {
        NodeType = (DesignNodeType)rs.ReadByte();
        TargetId = rs.ReadString()!;
        Version = rs.ReadInt();
        DeveloperName = rs.ReadString()!;
        DeveloperOuid = rs.ReadGuid();
        CheckoutTime = rs.ReadDateTime();
    }
}