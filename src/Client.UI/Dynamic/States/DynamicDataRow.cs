using AppBoxCore;

namespace PixUI.Dynamic;

public sealed class DynamicDataRow : IDynamicDataRow, IBinSerializable
{
    internal const string FromService = "Service";
    internal const string FromQuery = "Query";

    internal IDataRowSource Source { get; set; } = null!;

    public IEnumerable<DynamicState> GetChildStates(IDynamicContext context, DynamicState parent) =>
        Source.GetChildStates(parent);

    public void CopyFrom(IDynamicContext otherCtx, DynamicState otherState)
    {
        throw new NotImplementedException();
    }

    public void NotifyStateChanged() { }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Source.SourceType);
        Source.WriteTo(ref ws);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var sourceType = rs.ReadString()!;
        Source = sourceType switch
        {
            FromQuery => new DataRowFromQuery(),
            // FromService => new DynamicTableFromService(),
            _ => throw new Exception($"Unknown source type: {sourceType}")
        };
        Source.ReadFrom(ref rs);
    }

    #endregion
}

/// <summary>
/// 数据行的来源
/// </summary>
internal interface IDataRowSource : IBinSerializable
{
    string SourceType { get; }

    /// <summary>
    /// 获取数据行的数据
    /// </summary>
    Task Fetch(IDynamicContext dynamicContext);

    IEnumerable<DynamicState> GetChildStates(DynamicState parent);

    /// <summary>
    /// 转换为数据表，用于传输至后端保存数据
    /// </summary>
    DataTable ToDataTable();
}