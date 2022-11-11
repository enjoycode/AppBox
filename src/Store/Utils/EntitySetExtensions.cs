// using System.Data.Common;
// using System.Threading.Tasks;
// using AppBoxCore;
//
// namespace AppBoxStore;
//
// public static class EntitySetExtensions
// {
//     public static Task SaveAsync<T>(this EntitySet<T> entitySet, DbTransaction? txn = null)
//         where T : SqlEntity, new()
//     {
//         SqlStore? db;
//         if (entitySet.Count > 0) db = entitySet[0].GetSqlStore()
//     }
// }