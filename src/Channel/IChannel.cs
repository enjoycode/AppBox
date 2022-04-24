using System.Threading.Tasks;

namespace AppBoxChannel
{
    public interface IChannel
    {
        Task<object> Login(string user, string password, object external);

        Task<bool> Logout();

        Task<object> Invoke(string service, object[] args);
    }
}