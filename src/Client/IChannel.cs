using System.Threading.Tasks;

namespace AppBoxClient
{
    public interface IChannel
    {
        Task Login(string user, string password, object? external);

        Task Logout();

        Task<object?> Invoke(string service, object?[]? args);
    }
}