using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

internal sealed class CurrentRowProxy : IDynamicPrimitive
{
    public CurrentRowProxy(DynamicDataTable dataTable, string columnName)
    {
        _table = dataTable;
        _name = columnName;
    }

    private readonly DynamicDataTable _table;
    private readonly string _name;
    private State? _runtimeState;

    public void CopyFrom(IDynamicContext otherCtx, DynamicState otherState) => throw new NotSupportedException();

    public void WriteTo(Utf8JsonWriter writer) => throw new NotSupportedException();

    public void ReadFrom(ref Utf8JsonReader reader, DynamicState state) => throw new NotSupportedException();

    public object? GetDesignValue(IDynamicContext ctx)
    {
        //设计时不可能选择行，所以直接返回null
        return null;
    }

    public void NotifyStateChanged()
    {
        _runtimeState?.NotifyValueChanged();
    }

    public State GetRuntimeState(IDynamicContext ctx, DynamicState state)
    {
        if (_runtimeState != null) return _runtimeState;

        _runtimeState = state.Type switch
        {
            DynamicStateType.String => new RxProxy<string>(() =>
                _table.CurrentRow == null ? string.Empty :
                _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].StringValue! : string.Empty),
            DynamicStateType.Int => (state.AllowNull
                ? new RxProxy<int?>(() =>
                    _table.CurrentRow == null ? null :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].NullableIntValue : null)
                : new RxProxy<int>(() =>
                    _table.CurrentRow == null ? 0 :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].IntValue : 0)),
            DynamicStateType.Float => (state.AllowNull
                ? new RxProxy<float?>(() =>
                    _table.CurrentRow == null ? null :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].NullableFloatValue : null)
                : new RxProxy<float>(() =>
                    _table.CurrentRow == null ? 0 :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].FloatValue : 0)),
            DynamicStateType.Double => (state.AllowNull
                ? new RxProxy<double?>(() =>
                    _table.CurrentRow == null ? null :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].NullableDoubleValue : null)
                : new RxProxy<double>(() =>
                    _table.CurrentRow == null ? 0 :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].DoubleValue : 0)),
            DynamicStateType.DateTime => (state.AllowNull
                ? new RxProxy<DateTime?>(() =>
                    _table.CurrentRow == null ? null :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].NullableDateTimeValue : null)
                : new RxProxy<DateTime>(() =>
                    _table.CurrentRow == null ? default :
                    _table.CurrentRow.HasValue(_name) ? _table.CurrentRow[_name].DateTimeValue : default)),
            //TODO: others
            _ => throw new NotImplementedException()
        };

        return _runtimeState;
    }
}