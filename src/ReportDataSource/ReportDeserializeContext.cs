using AppBox.Reporting;
using AppBox.Reporting.Serialization;

namespace AppBox.ReportDataSource;

public sealed class ReportDeserializeContext : DeserializeContext
{
    public override IDataSource CreateDataSource(string type)
    {
        return base.CreateDataSource(type);
    }
}