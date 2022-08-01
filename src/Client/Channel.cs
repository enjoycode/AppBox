using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxCore;

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

        public static async Task Invoke(string service, object?[]? args = null)
        {
            await _provider.Invoke(service, args, null);
        }

        public static async Task<T?> Invoke<T>(string service, object?[]? args = null,
            EntityFactory[]? entityFactories = null)
        {
            var res = await _provider.Invoke(service, args, entityFactories);
            if (res == null) return default;

            return (T)res;
        }

        public static async Task<T[]?> InvokeEntityArray<T>(string service, object?[]? args = null,
            EntityFactory[]? entityFactories = null)
        {
            var res = await _provider.Invoke(service, args, entityFactories);
            if (res == null) return default;

            var entityArray = (Entity[])res;
            return entityArray.Cast<T>().ToArray();
        }

        public static async Task<List<T>?> InvokeEntityList<T>(string service,
            object?[]? args = null, EntityFactory[]? entityFactories = null)
        {
            var res = await _provider.Invoke(service, args, entityFactories);
            if (res == null) return default;

            var entityList = (IList<Entity>)res;
            return entityList.Cast<T>().ToList();
        }
    }
}