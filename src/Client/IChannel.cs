using System.Threading.Tasks;
using AppBoxCore;

namespace AppBoxClient;

public interface IChannel
{
    Task Login(string user, string password, string? external);

    Task Logout();

    Task<object?> Invoke(string service, object?[]? args, EntityFactory[]? entityFactories);
}