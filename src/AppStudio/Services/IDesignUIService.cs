namespace AppBoxDesign;

/// <summary>
/// 设计时的用户界面服务
/// </summary>
public interface IDesignUIService
{
    /// <summary>
    /// 开始加载DesignTree
    /// </summary>
    Task LoadDesignTreeAsync();
}