using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 显示对话框操作
/// </summary>
public sealed class ShowDialog : IEventAction, IBinSerializable
{
    public string ActionName => nameof(ShowDialog);

    public string Title { get; internal set; } = string.Empty;

    public int DialogWidth { get; internal set; } = 400;
    public int DialogHeight { get; internal set; } = 300;

    /// <summary>
    /// 显示视图模型的标识
    /// </summary>
    public ModelId TargetViewId { get; internal set; }

    /// <summary>
    /// 目标视图的参数列表
    /// </summary>
    public List<ViewParameter> Parameters { get; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Title);
        ws.WriteInt(DialogWidth);
        ws.WriteInt(DialogHeight);
        ws.WriteLong(TargetViewId);
        ws.WriteCollection(Parameters);
        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Title = rs.ReadString() ?? string.Empty;
        DialogWidth = rs.ReadInt();
        DialogHeight = rs.ReadInt();
        TargetViewId = rs.ReadLong();
        rs.ReadCollection(Parameters);
        rs.ReadFieldId(); //保留
    }

    #endregion

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        var dynamicWidget = new DynamicWidget(TargetViewId);
        //订阅dynamicWidget加载动态视图成功后开始传入视图参数值
        dynamicWidget.OnLoaded += async () =>
        {
            try
            {
                foreach (var viewParameter in Parameters)
                {
                    await viewParameter.Source.Run(dynamicContext, dynamicWidget, viewParameter.StateName);
                }
            }
            catch (Exception e)
            {
                Notification.Error($"ViewParameters Error: {e.Message}");
                //TODO: 考虑直接关闭对话框
            }
        };
        Dialog.Show(Title, _ => dynamicWidget, null, new(DialogWidth, DialogHeight));
        //TODO:*** Dialog关闭后的刷新操作
    }
}