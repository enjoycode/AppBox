using System;
using System.IO;
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

    Task<AnyValue> Upload<T>(string service, Stream stream, T args) where T : struct, IAnyArgs;

    Task Download<T>(string service, Stream stream, T args) where T : struct, IAnyArgs;
}