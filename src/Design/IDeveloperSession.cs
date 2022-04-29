using AppBoxCore;

namespace AppBoxDesign;

public interface IDeveloperSession : IUserSession
{
    /// <summary>
    /// 获取当前用户会话的开发者的DesignHub实例
    /// </summary>
    DesignHub GetDesignHub();
    
}