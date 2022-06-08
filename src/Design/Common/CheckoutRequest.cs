namespace AppBoxDesign;

/// <summary>
/// 用于包装设计器向服务端发送的签出请求
/// </summary>
public sealed class CheckoutRequest
{
    public DesignNodeType NodeType { get; }
    
    public bool IsSingleModel => NodeType == DesignNodeType.ModelNode;
    public string TargetID { get; }
    public int Version { get; }
    public string DeveloperName { get; }
    public Guid DeveloperOuid { get;}
    public DateTime CheckoutTime { get; set; }

    public CheckoutRequest(DesignNodeType nodeType, string targetID,
        int version, string developerName, Guid developerOuID)
    {
        NodeType = nodeType;
        TargetID = targetID;
        Version = version;
        DeveloperName = developerName;
        DeveloperOuid = developerOuID;
        CheckoutTime = DateTime.Now;
    }

    public string GetKey() => MakeKey(NodeType, TargetID);

    internal static string MakeKey(DesignNodeType nodeType, string targetId)
    {
        return $"{(byte)nodeType}|{targetId}";
    }
}