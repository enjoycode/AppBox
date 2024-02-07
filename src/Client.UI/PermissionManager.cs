using System.Threading.Tasks;
using PixUI;

namespace AppBoxClient;

public static class PermissionManager
{
    public static State<bool> GetPermissionState(long modelId)
    {
        //TODO:缓存，目前返回新建的
        return new PermissionState(modelId);
    }

    public static ValueTask<bool> GetPermissionTask(long modelId)
    {
        //TODO:检查缓存, 另需要在监听变更或切换用户后清除
        return new(Channel.HasPermission(modelId));
    }
}