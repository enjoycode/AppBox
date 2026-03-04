namespace AppBoxDesign.AI;

/// <summary>
/// 支持AI对话生成的模型
/// </summary>
internal interface IAIGeneratable
{
    AIChat Chat { get; }

    /// <summary>
    /// 获取当前的产物(代码或其他类型)
    /// </summary>
    string GetCurrentContent();

    void SetCurrentContent(string content);

    string GetAppName();

    string GetModelName();
}