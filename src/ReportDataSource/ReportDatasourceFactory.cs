using AppBox.Reporting;
using AppBox.Reporting.Serialization;

namespace AppBox.ReportDataSource;

public sealed class ReportDatasourceFactory : DataSourceFactory
{
    public override IDataSource CreateDataSource(string type)
    {
        return type switch
        {
            nameof(DataTableFromQuery) => new DataTableFromQuery(),
            nameof(DataTableFromService) => new DataTableFromService(),
            _ => base.CreateDataSource(type)
        };
    }
}