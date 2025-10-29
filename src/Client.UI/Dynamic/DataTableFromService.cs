using AppBoxClient;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于服务调用的数据表
/// </summary>
internal sealed class DataTableFromService : DataTableFromServiceBase, IDataTableSource
{
    public string SourceType => DynamicDataTable.FromService;

    public IEnumerable<DataColumn> GetColumns(IDynamicContext context, DynamicDataTable dataTable)
    {
        //暂用以下方式实现，考虑设计时调用一次服务获取DataTable然后保存所有列信息
        var fetchTask = dataTable.GetRuntimeValue(context);
        return fetchTask is { IsCompletedSuccessfully: true, Result: DataTable table } ? table.Columns : [];
    }

    public Task<DataTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        object?[]? args = null;
        if (Arguments.Length > 0)
        {
            args = new object? [Arguments.Length];
            for (var i = 0; i < args.Length; i++)
            {
                if (!string.IsNullOrEmpty(Arguments[i]))
                    args[i] = dynamicContext.GetPrimitiveState(Arguments[i]!).BoxedValue;
            }
        }

        return Channel.Invoke<DataTable>(Service, args);
    }
}