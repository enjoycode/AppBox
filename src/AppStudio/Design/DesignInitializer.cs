using System.Threading.Tasks;
using PixUI;

namespace AppBoxDesign
{
    /// <summary>
    /// 初始化设计时，eg:注册序列化器等
    /// </summary>
    [TSType("AppBoxDesign.DesignInitializer")]
    public static class DesignInitializer
    {
        public static Task TryInit() => Task.CompletedTask;
    }
}