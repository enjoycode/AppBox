using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 填充数据操作
/// </summary>
public sealed class FetchData : IEventAction, IBinSerializable
{
    public string ActionName => nameof(FetchData);

    /// <summary>
    /// 对应的数据源状态的名称
    /// </summary>
    public string DataSource { get; set; } = null!;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(DataSource);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        DataSource = rs.ReadString() ?? string.Empty;
    }

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        var state = dynamicContext.FindState(DataSource);
        if (state == null)
        {
            Notification.Error($"Can't find state: {DataSource}");
            return;
        }

        if (state.Value is not DynamicDataTable ds)
        {
            Notification.Error($"Value is not a DataTable: {DataSource}");
            return;
        }

        ds.Refresh();
    }
}