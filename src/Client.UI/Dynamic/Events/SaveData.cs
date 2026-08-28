using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 保存数据操作
/// </summary>
public sealed class SaveData : IEventAction, IBinSerializable
{
    public string ActionName => nameof(SaveData);

    public List<string> DataSources { get; } = [];

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteVariant(DataSources.Count);
        foreach (var dataSource in DataSources)
            ws.WriteString(dataSource);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            DataSources.Add(rs.ReadString() ?? string.Empty);
        }
    }

    public async void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        if (DataSources.Count == 0) return;

        var tables = new DataTable[DataSources.Count];
        for (var i = 0; i < DataSources.Count; i++)
        {
            var state = dynamicContext.FindState(DataSources[i]);
            if (state == null)
                throw new Exception($"Can't find state: {DataSources[i]}");

            if (state.Type == DynamicStateType.DataRow)
            {
                var dataRow = (DynamicDataRow)state.Value!;
                tables[i] = dataRow.Source.ToDataTable();
            }
            else if (state.Type == DynamicStateType.DataTable)
            {
                //var dataTable = (DynamicDataTable)state.Value!;
                throw new NotImplementedException();
            }
            else
            {
                throw new Exception($"Unknown state type: {state.Type}");
            }
        }

        try
        {
            await Channel.Invoke("sys.EntityService.Save", AnyValue.From(tables));
            //accept changes after succeed.
            foreach (var table in tables)
            {
                table.AcceptChanges();
            }

            Notification.Success("保存成功");
        }
        catch (Exception e)
        {
            Notification.Error($"保存失败: {e.Message}");
        }
    }
}