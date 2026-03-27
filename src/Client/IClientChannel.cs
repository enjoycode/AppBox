using System;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public interface IClientChannel : IChannel
{
    string SessionName { get; }

    Guid LeafOrgUnitId { get; }

    Task Login(string user, string password, string? external);

    Task Logout();

    Task<AnyValue> Invoke<T>(string service, T args, EntityFactory[]? entityFactories = null)
        where T : struct, IAnyArgs;
}