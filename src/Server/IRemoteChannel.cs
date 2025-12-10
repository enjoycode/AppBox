using AppBoxCore;

namespace AppBoxServer;

/// <summary>
/// 客户端通信通道
/// </summary>
public interface IRemoteChannel : IChannel
{
    /// <summary>
    /// 发送服务端事件至客户端
    /// </summary>
    Task SendServerEvent<T>(int eventId, T args) where T : struct, IAnyArgs;
}