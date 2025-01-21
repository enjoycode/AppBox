using System;
using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public interface IChannel
{
    string SessionName { get; }
    
    Guid LeafOrgUnitId { get; }
    
    Task Login(string user, string password, string? external);

    Task Logout();

    Task<object?> Invoke(string service, object?[]? args, EntityFactory[]? entityFactories);
}