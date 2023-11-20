using PixUI;

namespace AppBoxClient;

public interface IHomePage
{
    /// <summary>
    /// 注入路由节点
    /// </summary>
    void InjectRoute(RouteBase route);
}