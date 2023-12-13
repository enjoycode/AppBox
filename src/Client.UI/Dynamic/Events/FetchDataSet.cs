using System;
using System.Diagnostics;
using System.Text.Json;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 调用服务填充数据集
/// </summary>
public sealed class FetchDataSet : IEventAction
{
    public string ActionName => nameof(FetchDataSet);

    /// <summary>
    /// 对应的数据集状态的名称
    /// </summary>
    public string DataSet { get; set; } = null!;

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteString(nameof(DataSet), DataSet);
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;

            Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
            var propName = reader.GetString();
            reader.Read();
            switch (propName)
            {
                case nameof(DataSet):
                    DataSet = reader.GetString() ?? string.Empty;
                    break;
                default: throw new Exception($"Unknown property: FetchDataSet.{propName}");
            }
        }
    }

    public void Run(IDynamicView dynamicView, object? eventArg = null)
    {
        throw new System.NotImplementedException();
    }
}