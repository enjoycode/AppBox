using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxCore
{
    [AttributeUsage(AttributeTargets.Field)]
    internal sealed class MemberAccessInterceptorAttribute : Attribute
    {
        public MemberAccessInterceptorAttribute(string name) {}
    }
    
    /// <summary>
    /// 服务方法的调用权限
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public sealed class InvokePermissionAttribute : Attribute
    {
        public InvokePermissionAttribute(bool permission) { }
    }
}

namespace AppBoxStore
{

    #region ====虚拟代码转运行时代码的Attributes====

    [AttributeUsage(AttributeTargets.Constructor)]
    internal sealed class GenericCreateAttribute : Attribute { }

    [AttributeUsage(AttributeTargets.Method)]
    internal sealed class QueryMethodAttribute : Attribute { }

    #endregion

    public static class SqlEntityExtensions
    {
        public static Task<int> InsertAsync(this SqlEntity entity, DbTransaction? txn = null)
            => throw new Exception();

        public static Task<int> UpdateAsync(this SqlEntity entity, DbTransaction? txn = null)
            => throw new Exception();

        public static Task<int> DeleteAsync(this SqlEntity entity, DbTransaction? txn = null)
            => throw new Exception();

        public static SqlStore GetSqlStore(this SqlEntity entity) => throw new Exception();
    }

    public abstract class SqlStore
    {
        public Task<DbTransaction> BeginTransactionAsync() => throw new Exception();
    }

    public sealed class SqlQuery<T> where T : SqlEntity, new()
    {
        [GenericCreate]
        public SqlQuery() { }

        [QueryMethod()]
        public SqlQuery<T> Where(Func<T, bool> condition) => this;

        /// <summary>
        /// 执行查询并转换为列表
        /// </summary>
        public Task<IList<T>> ToListAsync() => throw new Exception();

        /// <summary>
        /// 执行查询并转换为树状结构
        /// </summary>
        [QueryMethod()]
        public Task<IList<T>> ToTreeAsync(Func<T, EntitySet<T>> children) => throw new Exception();
    }
}