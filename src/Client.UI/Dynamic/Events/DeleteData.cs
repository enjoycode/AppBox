using System.Diagnostics;
using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 删除数据行(DataTable的当前行或详情页的数据行)的操作
/// </summary>
public sealed class DeleteData : IEventAction
{
    public string ActionName => nameof(DeleteData);

    /// <summary>
    /// 弹窗确认删除的提示
    /// </summary>
    public string ConfirmMessage { get; set; } = "确认删除吗?";

    /// <summary>
    /// 对应的数据源状态的名称
    /// </summary>
    public string DataSource { get; set; } = string.Empty;

    #region ====Serialization====

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteString(nameof(DataSource), DataSource);
        writer.WriteString(nameof(ConfirmMessage), ConfirmMessage);
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
                case nameof(DataSource):
                    DataSource = reader.GetString() ?? string.Empty;
                    break;
                case nameof(ConfirmMessage):
                    ConfirmMessage = reader.GetString() ?? string.Empty;
                    break;
                default: throw new Exception($"Unknown property: {nameof(ConfirmMessage)}.{propName}");
            }
        }
    }

    #endregion

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        if (string.IsNullOrEmpty(ConfirmMessage))
        {
            RunInternal(dynamicContext);
            return;
        }

        Dialog.Show("Confirm",
            dlg => new Center()
            {
                Child = new Text(ConfirmMessage) { TextColor = Colors.Red }
            },
            dlg => new Container
            {
                Height = Button.DefaultHeight + 20 + 20,
                Padding = EdgeInsets.All(20),
                Child = new Row(VerticalAlignment.Middle, 20)
                {
                    Children =
                    {
                        new Expanded(),
                        new Button(DialogResult.No) { Width = 80, OnTap = _ => dlg.Close(DialogResult.No) },
                        new Button(DialogResult.Yes) { Width = 80, OnTap = _ => dlg.Close(DialogResult.Yes) }
                    }
                }
            },
            new(300, 200)
        );
    }

    private void RunInternal(IDynamicContext dynamicContext)
    {
        var state = dynamicContext.FindState(DataSource);
        if (state == null)
        {
            Notification.Error($"Can't find state: {DataSource}");
            return;
        }

        if (state.Value is not DynamicDataTable ds)
        {
            Notification.Error($"Value is not a DataTable: {DataSource}");
            return;
        }
    }
}