using AppBoxCore;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public interface IDynamicTypeSerializer
{
    void Serialize<TWriter>(ref TWriter writer, object value) where TWriter : struct, IOutputStream;
    object Deserialize<TReader>(ref TReader reader) where TReader : struct, IInputStream;
}

public static class DynamicTypeSerializer
{
    private static readonly Dictionary<Type, IDynamicTypeSerializer> Serializers = [];

    internal static void InitSerializer()
    {
        RegisterSerializer<Color, ColorSerializer>();
        RegisterSerializer<EdgeInsets, EdgeInsetsSerializer>();
        RegisterSerializer<IconData, IconSerializer>();
        RegisterSerializer<InputBorder, InputBorderSerializer>();

        RegisterSerializer<TableStyles, DynamicBinSerializer<TableStyles>>();
        RegisterSerializer<TableColumnSettings[], TableColumnArraySerializer>();
        RegisterSerializer<TableFooterCell[], TableFooterCellArraySerializer>();

        RegisterSerializer<ChartAxisSettings[], ChartAxisArraySerializer>();
        RegisterSerializer<IDynamicCartesianSeries[], CartesianSeriesArraySerializer>();
        RegisterSerializer<PieSeriesSettings, DynamicBinSerializer<PieSeriesSettings>>(); //remove it
    }

    public static void RegisterSerializer<TObject, TSerializer>() where TSerializer : IDynamicTypeSerializer, new()
    {
        if (!Serializers.TryAdd(typeof(TObject), new TSerializer()))
            throw new Exception($"Serializer already registered: {typeof(TObject)}");
    }

    public static bool TryGetSerializer(Type type, [MaybeNullWhen(false)] out IDynamicTypeSerializer serializer)
        => Serializers.TryGetValue(type, out serializer);

    #region ====扩展方法====

    internal const string TYPE_PROPERTY = "$TYPE";
    internal const string EVENT_PROPERTY = "$EVENT";

    public static DynamicBackground? ReadBackground<TReader>(this ref TReader reader)
        where TReader : struct, IInputStream
    {
        var len = reader.ReadVariant();
        Debug.Assert(len > 0);

        var imgData = new byte[len];
        reader.ReadBytes(imgData);
        return new DynamicBackground() { ImageData = imgData };
    }

    public static List<DynamicState> ReadStates<TReader>(this ref TReader reader,
        Func<DynamicStateType, IDynamicStateValue> stateFactory) where TReader : struct, IInputStream
    {
        var count = reader.ReadVariant();
        var states = new List<DynamicState>(count);
        for (var i = 0; i < count; i++)
        {
            states.Add(reader.ReadState(stateFactory));
        }

        return states;
    }

    public static DynamicState ReadState<TReader>(this ref TReader reader,
        Func<DynamicStateType, IDynamicStateValue> stateFactory)
        where TReader : struct, IInputStream
    {
        var state = new DynamicState() { Name = reader.ReadString()! };
        state.Type = (DynamicStateType)reader.ReadByte();
        state.AllowNull = reader.ReadBool();
        var hasValue = reader.ReadBool();
        if (hasValue)
        {
            var stateValue = stateFactory(state.Type);
            if (stateValue is IBinSerializable serializable)
                serializable.ReadFrom(ref reader);
            else
                throw new SerializationException(SerializationError.NotSupportedClassType,
                    $"{stateValue.GetType().Name} must implement {nameof(IBinSerializable)}");
            state.Value = stateValue;
        }

        reader.ReadFieldId(); //保留
        return state;
    }

    public static DynamicValue ReadDynamicValue<TReader>(this ref TReader reader, DynamicPropertyMeta propertyMeta)
        where TReader : struct, IInputStream
    {
        var v = new DynamicValue();
        v.From = (ValueSource)reader.ReadByte();

        var isNull = reader.ReadBool();
        if (isNull) return v;

        if (propertyMeta.ValueType.IsEnum)
        {
            v.Value = Enum.ToObject(propertyMeta.ValueType, reader.Deserialize()!);
            return v;
        }

        if (TryGetSerializer(propertyMeta.ValueType, out var serializer))
        {
            v.Value = serializer.Deserialize(ref reader);
            return v;
        }
        
        v.Value = reader.Deserialize();
        return v;
    }

    public static EventValue ReadEventValue<TReader>(this ref TReader reader)
        where TReader : struct, IInputStream
    {
        var name = reader.ReadString()!;
        var actionName = reader.ReadString();
        if (string.IsNullOrEmpty(actionName)) return new EventValue() { Name = name, Action = null! };

        var action = DynamicWidgetManager.EventActionManager.Create(actionName);
        if (action is IBinSerializable serializable)
            serializable.ReadFrom(ref reader);
        else
            throw new SerializationException(SerializationError.NotSupportedClassType,
                $"{action.GetType().Name} must implement {nameof(IBinSerializable)}");
        return new EventValue() { Name = name, Action = action };
    }

    #endregion
}