using System.Text.Json;
using AppBoxCore;

namespace PixUI.Dynamic;

internal sealed class DataCellProxy : IDynamicPrimitive
{
    public DataCellProxy(DataRow row, string name)
    {
        _row = row;
        _name = name;
    }

    private readonly DataRow _row;
    private readonly string _name;
    private State? _runtimeState;

    public void WriteTo(Utf8JsonWriter writer) => throw new NotSupportedException();

    public void ReadFrom(ref Utf8JsonReader reader, DynamicState state) => throw new NotSupportedException();

    public void CopyFrom(IDynamicContext otherCtx, DynamicState otherState)
    {
        if (otherState.Value is not IDynamicPrimitive otherPrimitive)
            throw new NotSupportedException($"{nameof(DataCellProxy)} cannot copy from other: {otherState.Type}");

        var otherRuntimeState = otherPrimitive.GetRuntimeState(otherCtx, otherState);
        _row[_name] = otherState.Type switch
        {
            DynamicStateType.String => ((State<string>)otherRuntimeState).Value,
            DynamicStateType.Int => otherState.AllowNull
                ? ((State<int?>)otherRuntimeState).Value
                : ((State<int>)otherRuntimeState).Value,
            DynamicStateType.Float => otherState.AllowNull
                ? ((State<float?>)otherRuntimeState).Value
                : ((State<float>)otherRuntimeState).Value,
            DynamicStateType.Double => otherState.AllowNull
                ? ((State<double?>)otherRuntimeState).Value
                : ((State<double>)otherRuntimeState).Value,
            DynamicStateType.DateTime => otherState.AllowNull
                ? ((State<DateTime?>)otherRuntimeState).Value
                : ((State<DateTime>)otherRuntimeState).Value,
            _ => throw new NotImplementedException($"{otherState.Type} is not implemented"),
        };
        //这里暂不通知值更新
    }

    public object? GetDesignValue(IDynamicContext ctx)
    {
        return _row.HasValue(_name) ? _row[_name].BoxedValue : null;
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
            DynamicStateType.String => new RxProxy<string>(
                () => _row.HasValue(_name) ? _row[_name].StringValue! : string.Empty,
                v =>
                {
                    _row[_name] = v;
                    _runtimeState?.NotifyValueChanged();
                }),
            DynamicStateType.Int => (state.AllowNull
                ? new RxProxy<int?>(
                    () => _row.HasValue(_name) ? _row[_name].NullableIntValue : null,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })
                : new RxProxy<int>(
                    () => _row.HasValue(_name) ? _row[_name].IntValue : 0,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })),
            DynamicStateType.Float => (state.AllowNull
                ? new RxProxy<float?>(
                    () => _row.HasValue(_name) ? _row[_name].NullableFloatValue : null,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })
                : new RxProxy<float>(
                    () => _row.HasValue(_name) ? _row[_name].FloatValue : 0,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })),
            DynamicStateType.Double => (state.AllowNull
                ? new RxProxy<double?>(
                    () => _row.HasValue(_name) ? _row[_name].NullableDoubleValue : null,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })
                : new RxProxy<double>(
                    () => _row.HasValue(_name) ? _row[_name].DoubleValue : 0,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })),
            DynamicStateType.DateTime => (state.AllowNull
                ? new RxProxy<DateTime?>(
                    () => _row.HasValue(_name) ? _row[_name].NullableDateTimeValue : null,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })
                : new RxProxy<DateTime>(
                    () => _row.HasValue(_name) ? _row[_name].DateTimeValue : default,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    })),
            //TODO: others
            _ => throw new NotImplementedException()
        };

        return _runtimeState;
    }
}