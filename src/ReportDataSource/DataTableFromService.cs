using System.Text.Json;
using AppBox.Reporting;
using AppBoxCore;
using DeserializeContext = AppBox.Reporting.Serialization.DeserializeContext;

namespace AppBox.ReportDataSource;

public sealed class DataTableFromService : DataTableFromServiceBase, IDataSource
{
    public string Name { get; set; } = string.Empty;

    public void ReadFrom(ref Utf8JsonReader reader, DeserializeContext context) => ReadFrom(ref reader);
}