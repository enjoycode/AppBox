using System;
using System.IO;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxCore.Channel;

namespace AppBoxClient;

public interface IClientChannel : IChannel
{
    string SessionName { get; }

    Guid LeafOrgUnitId { get; }

    Task Login(string user, string password, string? external);

    Task Logout();

    Task<AnyValue> Invoke<TArgs>(string service, TArgs args, EntityFactory[]? entityFactories = null)
        where TArgs : struct, IAnyArgs;

    Task<AnyValue> Upload<TArgs>(string service, BytesPipeWriter writer, TArgs args) where TArgs : struct, IAnyArgs;

    BytesPipeReader Download<TArgs>(string service, TArgs args) where TArgs : struct, IAnyArgs;
}