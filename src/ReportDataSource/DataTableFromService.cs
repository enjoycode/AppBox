using AppBox.Reporting;
using AppBoxCore;

namespace AppBox.ReportDataSource;

public sealed class DataTableFromService : ObjectDataSource, IAsyncReportDataSource
{
    private readonly DataTableFromServiceWrap _wrap = new();

    public DataTableFromServiceBase Wrap => _wrap;

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        ws.WriteString(Name);
        _wrap.WriteTo(ref ws);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        Name = rs.ReadString() ?? string.Empty;
        _wrap.ReadFrom(ref rs);
    }

    public Task FetchDataAsync()
    {
        throw new NotImplementedException("DataTableFromService.FetchDataAsync is not implemented.");

        // object?[]? args = null;
        // if (Arguments.Length > 0)
        // {
        //     args = new object? [Arguments.Length];
        //     for (var i = 0; i < args.Length; i++)
        //     {
        //         if (!string.IsNullOrEmpty(Arguments[i]))
        //             args[i] = dynamicContext.GetPrimitiveState(Arguments[i]!).BoxedValue;
        //     }
        // }
        //
        // return Channel.Invoke<DataTable>(Service, args);
    }

    private sealed class DataTableFromServiceWrap : DataTableFromServiceBase { }
}