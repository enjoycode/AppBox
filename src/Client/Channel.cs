using System;
using System.Threading.Tasks;

namespace AppBoxClient
{
    public static class Channel
    {
        private static IChannel _provider = null!;
        public static void Init(IChannel provider)
        {
            _provider = provider;
        }
        public static Task Login(string user, string password, object? external = null)
            => _provider.Login(user, password, external);
        
        public static Task Logout() => _provider.Logout();
        

        public static Task<object?> Invoke(string service, object?[]? args = null)
            => _provider.Invoke(service, args);
    }
}