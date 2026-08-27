using System.Text.Json;

namespace AppBoxCore;

/// <summary>
/// 来源于服务调用的数据表
/// </summary>
public abstract class DataTableFromServiceBase
{
    /// <summary>
    /// 获取数据集的服务方法 eg: sys.OrderService.GetOrders
    /// </summary>
    public string Service { get; set; } = string.Empty;

    /// <summary>
    /// 服务方法的参数所指向的动态视图的状态的名称
    /// </summary>
    public string?[] Arguments { get; set; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Service);
        ws.WriteVariant(Arguments.Length);
        foreach (var arg in Arguments)
        {
            ws.WriteString(arg);
        }
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Service = rs.ReadString() ?? string.Empty;
        var count = rs.ReadVariant();
        Arguments = new string?[count];
        for (var i = 0; i < count; i++)
        {
            Arguments[i] = rs.ReadString();
        }
    }

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteString(nameof(Service), Service);

        writer.WritePropertyName(nameof(Arguments));
        writer.WriteStartArray();
        for (var i = 0; i < Arguments.Length; i++)
        {
            writer.WriteStringValue(Arguments[i]);
        }

        writer.WriteEndArray();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;

            var propName = reader.GetString();
            switch (propName)
            {
                case nameof(Service):
                    reader.Read();
                    Service = reader.GetString()!;
                    break;
                case nameof(Arguments):
                    var args = new List<string?>();
                    reader.Read(); //[
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        args.Add(reader.GetString());
                    }

                    Arguments = args.ToArray();
                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DataTableFromServiceBase)}.{propName}");
            }
        }
    }

    #endregion
}