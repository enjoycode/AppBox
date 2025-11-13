using AppBox.Reporting;

namespace AppBox.ReportDataSource;

public interface IAsyncReportDataSource : IDataSource
{
    Task FetchDataAsync();
}