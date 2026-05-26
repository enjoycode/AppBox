using AppBoxCore;

namespace AppBoxDesign;

public sealed class CheckoutResult : IBinSerializable
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
    public ModelBase? ModelWithNewVersion { get; set; }

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteBool(Success);
        ws.Serialize(ModelWithNewVersion);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Success = rs.ReadBool();
        ModelWithNewVersion = rs.Deserialize() as ModelBase;
    }
}