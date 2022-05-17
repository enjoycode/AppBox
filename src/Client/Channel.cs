using System;
using System.Threading.Tasks;

namespace AppBoxClient
{
    public static class Channel
    {
        public static Task Login(string user, string password, object? external = null)
        {
            throw new NotImplementedException();
        }

        public static Task Logout()
        {
            throw new NotImplementedException();
        }

        public static Task<object> Invoke(string service, object[]? args = null)
        {
            throw new NotImplementedException();
        }
    }
}