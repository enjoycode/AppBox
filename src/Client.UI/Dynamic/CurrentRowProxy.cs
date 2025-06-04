using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

internal sealed class CurrentRowProxy : IDynamicPrimitive
{
    public CurrentRowProxy(DynamicDataTable dataTable, string columnName)
    {
        _dataTable = dataTable;
        _columnName = columnName;
    }

    private readonly DynamicDataTable _dataTable;
    private readonly string _columnName;

    public void CopyFrom(IDynamicContext otherCtx, DynamicState otherState) => throw new NotSupportedException();

    public void WriteTo(Utf8JsonWriter writer) => throw new NotSupportedException();

    public void ReadFrom(ref Utf8JsonReader reader, DynamicState state) => throw new NotSupportedException();

    public object? GetDesignValue(IDynamicContext ctx)
    {
        //设计时不可能选择行，所以直接返回null
        return null;
    }

    public State GetRuntimeState(IDynamicContext ctx, DynamicState state)
    {
        throw new NotImplementedException();
    }
}