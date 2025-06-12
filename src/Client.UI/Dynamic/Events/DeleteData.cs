using System.Diagnostics;
using System.Text.Json;
using AppBoxCore;
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
        var state = dynamicContext.FindState(DataSource);
        if (state == null)
        {
            Notification.Error($"Can't find state: {DataSource}");
            return;
        }

        //如果是DataTable先检查有没有选择行则直接退出
        if (state.Value is DynamicDataTable { CurrentRow: null }) return;

        if (string.IsNullOrEmpty(ConfirmMessage))
        {
            RunInternal(dynamicContext, state);
            return;
        }

        Dialog.Show("Confirm",
            _ => new Center()
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
                        new Button(DialogResult.Yes)
                        {
                            Width = 80,
                            OnTap = _ =>
                            {
                                dlg.Close(DialogResult.Yes);
                                RunInternal(dynamicContext, state);
                            }
                        }
                    }
                }
            },
            new(280, 180)
        );
    }

    private static async void RunInternal(IDynamicContext dynamicContext, DynamicState state)
    {
        try
        {
            if (state.Value is DynamicDataTable dt)
            {
                var table = (DataTable)(await dt.GetRuntimeValue(dynamicContext))!;
                //判断当前行是否游离态，是则视为操作成功
                if (dt.CurrentRow!.PersistentState != PersistentState.Detached)
                {
                    //暂创建一个新的DataTable加入当前行后再删除
                    var newTable = new DataTable(table.Columns);
                    newTable.EntityModelId = table.EntityModelId;
                    newTable.Add(dt.CurrentRow);
                    newTable.RemoveAt(0);
                    //调用服务保存
                    DataTable[] args = [newTable];
                    await Channel.Invoke("sys.EntityService.Save", [args]);
                }
                //TODO: ***后续刷新操作,暂简单刷新, maybe call NotifyStateChanged
                dt.Refresh();

                Notification.Success("删除数据成功");
            }
            else
            {
                throw new NotImplementedException("直接删除DataRow暂未实现");
            }
        }
        catch (Exception e)
        {
            Notification.Error($"删除数据错误: {e.Message}");
        }
    }
}