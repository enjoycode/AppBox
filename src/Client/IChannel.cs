using System.Threading.Tasks;

namespace AppBoxClient
{
    public interface IChannel
    {
        Task<object> Login(string user, string password, object external);

        Task<bool> Logout();

        Task<object> Invoke(string service, object[] args);
    }
}