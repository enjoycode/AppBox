using System.Text.Json;
using System.Text.Json.Serialization;

namespace AppBoxCore.Metrics;

public sealed class MatrixResult : IBinSerializable
{
    [JsonPropertyName("metric")] public Dictionary<string, string> Metric { get; set; } = [];

    [JsonPropertyName("values")]
    [JsonConverter(typeof(DataPointListConverter))]
    public List<DataPoint> Values { get; set; } = [];

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        Metric.Remove("__name__");
        Metric.Remove("job");
        ws.WriteVariant(Metric.Count);
        foreach (var kv in Metric)
        {
            ws.WriteString(kv.Key);
            ws.WriteString(kv.Value);
        }

        ws.WriteVariant(Values.Count);
        foreach (var dataPoint in Values)
        {
            ws.WriteLong(dataPoint.Timestamp.Ticks);
            ws.WriteDouble(dataPoint.Value);
        }
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Metric.Add(rs.ReadString()!, rs.ReadString()!);
        }

        count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Values.Add(new DataPoint(new DateTime(rs.ReadLong()), rs.ReadDouble()));
        }
    }
}

public sealed class VectorResult : IBinSerializable
{
    [JsonPropertyName("metric")] public Dictionary<string, string> Metric { get; set; } = [];

    [JsonPropertyName("value")]
    [JsonConverter(typeof(DataPointConverter))]
    public DataPoint Value { get; set; }

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        Metric.Remove("__name__");
        Metric.Remove("job");
        ws.WriteVariant(Metric.Count);
        foreach (var kv in Metric)
        {
            ws.WriteString(kv.Key);
            ws.WriteString(kv.Value);
        }

        ws.WriteLong(Value.Timestamp.Ticks);
        ws.WriteDouble(Value.Value);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Metric.Add(rs.ReadString()!, rs.ReadString()!);
        }

        var timestamp = new DateTime(rs.ReadLong());
        var value = rs.ReadDouble();
        Value = new DataPoint(timestamp, value);
    }
}

public readonly struct DataPoint
{
    public DateTime Timestamp { get; }
    public double Value { get; }

    public DataPoint(DateTime timestamp, double value)
    {
        Timestamp = timestamp;
        Value = value;
    }

    public override string ToString() => $"[{Timestamp}]={Value}";
}

public struct PrometheusResponse
{
    [JsonPropertyName("status")] public string Status { get; set; }

    [JsonPropertyName("data")] public PrometheusData Data { get; set; }

    [JsonPropertyName("error")] public string? Error { get; set; }

    [JsonPropertyName("errorType")] public string? ErrorType { get; set; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "resultType")]
[JsonDerivedType(typeof(MatrixData), typeDiscriminator: "matrix")]
[JsonDerivedType(typeof(VectorData), typeDiscriminator: "vector")]
public abstract class PrometheusData { }

public sealed class MatrixData : PrometheusData
{
    [JsonPropertyName("result")] public List<MatrixResult> Result { get; set; }
}

public sealed class VectorData : PrometheusData
{
    [JsonPropertyName("result")] public List<VectorResult> Result { get; set; }
}

public sealed class DataPointListConverter : JsonConverter<List<DataPoint>>
{
    public override List<DataPoint> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException();

        var list = new List<DataPoint>();

        while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
        {
            // [ts, "val"]
            if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException("Expected array for data point");

            // read timestamp
            reader.Read();
            var ts = reader.GetDouble();

            // read value
            reader.Read();
            var val = double.Parse(reader.GetString() ?? "0");

            list.Add(new DataPoint(DateTimeOffset.FromUnixTimeSeconds((long)ts).LocalDateTime, val));

            //skip ]
            reader.Read();
            if (reader.TokenType != JsonTokenType.EndArray) throw new JsonException();
        }

        return list;
    }

    public override void Write(Utf8JsonWriter writer, List<DataPoint> value, JsonSerializerOptions options) =>
        throw new NotSupportedException();
}

public sealed class DataPointConverter : JsonConverter<DataPoint>
{
    public override DataPoint Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartArray) throw new JsonException();

        // read timestamp
        reader.Read();
        var ts = reader.GetDouble();

        // read value
        reader.Read();
        var val = double.Parse(reader.GetString() ?? "0");
        var result = new DataPoint(DateTimeOffset.FromUnixTimeSeconds((long)ts).LocalDateTime, val);

        //skip ]
        reader.Read();
        if (reader.TokenType != JsonTokenType.EndArray) throw new JsonException();
        return result;
    }

    public override void Write(Utf8JsonWriter writer, DataPoint value, JsonSerializerOptions options) =>
        throw new NotSupportedException();
}