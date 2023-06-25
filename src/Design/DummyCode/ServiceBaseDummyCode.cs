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
    internal sealed class GenericCreateAttribute : Attribute
    {
        public GenericCreateAttribute(bool toNoneGeneric){}
    }

    [AttributeUsage(AttributeTargets.Method)]
    internal sealed class QueryMethodAttribute : Attribute { }
    
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface)]
    internal sealed class NoneGenericAttribute : Attribute { }
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
    
    [NoneGeneric]
    public interface ISqlQueryJoin<T> {}

    public static class SqlQueryJoinExtensions
    {
        [QueryMethod()]
        public static ISqlQueryJoin<TJoin> InnerJoin<TSource, TJoin>(this ISqlQueryJoin<TSource> s,
            ISqlQueryJoin<TJoin> join, Func<TSource, TJoin, bool> condition) => join;
        
        [QueryMethod()]
        public static ISqlQueryJoin<TJoin> LeftJoin<TSource, TJoin>(this ISqlQueryJoin<TSource> s,
            ISqlQueryJoin<TJoin> join, Func<TSource, TJoin, bool> condition) => join;
        
        [QueryMethod()]
        public static ISqlQueryJoin<TJoin> RightJoin<TSource, TJoin>(this ISqlQueryJoin<TSource> s,
            ISqlQueryJoin<TJoin> join, Func<TSource, TJoin, bool> condition) => join;
        
        [QueryMethod()]
        public static ISqlQueryJoin<TJoin> FullJoin<TSource, TJoin>(this ISqlQueryJoin<TSource> s,
            ISqlQueryJoin<TJoin> join, Func<TSource, TJoin, bool> condition) => join;
    }

    [NoneGeneric]
    public sealed class SqlQueryJoin<T> : ISqlQueryJoin<T> where T : SqlEntity
    {
        [GenericCreate(true)]
        public SqlQueryJoin(){}
    }

    public sealed class SqlQuery<T> : ISqlQueryJoin<T> where T : SqlEntity, new()
    {
        [GenericCreate(false)]
        public SqlQuery() { }

        [QueryMethod()]
        public SqlQuery<T> Where(Func<T, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> Where<TJoin>(ISqlQueryJoin<TJoin> join, Func<T, TJoin, bool> condition) => this;

        public Task<T?> ToSingleAsync() => throw new Exception();

        /// <summary>
        /// 执行查询并转换为列表
        /// </summary>
        public Task<IList<T>> ToListAsync() => throw new Exception();

        /// <summary>
        /// 执行查询并转换为匿名类列表
        /// </summary>
        [QueryMethod()]
        public Task<IList<TResult>> ToListAsync<TResult>(Func<T, TResult> selector) => throw new Exception();

        [QueryMethod()]
        public Task<IList<TResult>> ToListAsync<TJoin, TResult>(ISqlQueryJoin<TJoin> join, Func<T, TJoin, TResult> selector) =>
            throw new Exception();

        /// <summary>
        /// 执行查询并转换为树状结构
        /// </summary>
        [QueryMethod()]
        public Task<IList<T>> ToTreeAsync(Func<T, EntitySet<T>> children) => throw new Exception();
    }

    [NoneGeneric]
    public sealed class SqlUpdateCommand<T> : ISqlQueryJoin<T> where T : SqlEntity
    {
        [GenericCreate(true)]
        public SqlUpdateCommand(){}

        [QueryMethod()]
        public SqlUpdateCommand<T> Where(Func<T, bool> condition) => this;

        [QueryMethod()]
        public SqlUpdateCommand<T> Update(Action<T> setter) => this;

        [QueryMethod()]
        public UpdateOutputs<TResult> Output<TResult>(Func<T, TResult> selector) => throw new Exception();

        public async Task<int> ExecAsync(DbTransaction? txn = null) => throw new Exception();
        
        public sealed class UpdateOutputs<T>
        {
            private UpdateOutputs() { }

            public T this[int index] => default(T);

            public int Count => 0;
        }
    }

    [NoneGeneric]
    public sealed class SqlDeleteCommand<T> : ISqlQueryJoin<T> where T : SqlEntity
    {
        [GenericCreate(true)]
        public SqlDeleteCommand(){}
        
        [QueryMethod()]
        public SqlDeleteCommand<T> Where(Func<T, bool> condition) => this;
        
        public async Task<int> ExecAsync(DbTransaction? txn = null) => throw new Exception();
    }
}