using System;

namespace AppBoxDesign;

/// <summary>
/// 用于包装设计器向服务端发送的签出请求
/// </summary>
public sealed class CheckoutInfo //TODO: remove it, use Checkout
{
    public DesignNodeType NodeType { get; }
    
    public bool IsSingleModel => NodeType == DesignNodeType.ModelNode;
    public string TargetID { get; }
    public int Version { get; }
    public string DeveloperName { get; }
    public Guid DeveloperOuid { get;}
    public DateTime CheckoutTime { get; set; }

    public CheckoutInfo(DesignNodeType nodeType, string targetId,
        int version, string developerName, Guid developerOuId)
    {
        NodeType = nodeType;
        TargetID = targetId;
        Version = version;
        DeveloperName = developerName;
        DeveloperOuid = developerOuId;
        CheckoutTime = DateTime.Now;
    }

    public string GetKey() => MakeKey(NodeType, TargetID);

    internal static string MakeKey(DesignNodeType nodeType, string targetId)
    {
        return $"{(byte)nodeType}|{targetId}";
    }
}