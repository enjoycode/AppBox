using AppBoxCore;

namespace AppBoxDesign;

internal sealed class CheckoutResult : IBinSerializable
{
    internal CheckoutResult() { }

    public CheckoutResult(bool success)
    {
        Success = success;
        ModelWithNewVersion = null;
    }

    public bool Success { get; private set; }

    /// <summary>
    /// 签出单个模型时，已被其他人修改(版本变更), 则返回当前最新的版本的模型
    /// </summary>
    public ModelBase? ModelWithNewVersion { get; internal set; }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteBool(Success);
        ws.Serialize(ModelWithNewVersion);
    }

    public void ReadFrom(IInputStream rs)
    {
        Success = rs.ReadBool();
        ModelWithNewVersion = rs.Deserialize() as ModelBase;
    }
}