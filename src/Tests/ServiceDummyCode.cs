using System.Data.Common;
using AppBoxCore;
using AppBoxStore.Entities;
using AppBoxStoreDummy;

namespace AppBoxStoreDummy
{
    #region ====虚拟代码转运行时代码的Attributes====

    [AttributeUsage(AttributeTargets.Constructor)]
    internal sealed class GenericCreateAttribute : Attribute
    {
        public GenericCreateAttribute(bool toNoneGeneric) { }
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

    public static class SqlFunc
    {
        public static int Sum(int field) => 0;

        public static long Sum(long field) => 0;

        public static int Avg(int field) => 0;

        public static long Avg(long field) => 0;

        // public static bool In<T>(this T source, IEnumerable<T> list) { return true; }
        //
        // public static bool NotIn<T>(this T source, IEnumerable<T> list) { return true; }
    }

    [NoneGeneric]
    public interface ISqlQueryJoin<T> { }

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
        public SqlQueryJoin() { }
    }

    public sealed class SqlIncluder<TRoot, TChild>
        where TRoot : SqlEntity, new()
        where TChild : SqlEntity, new()
    {
        [QueryMethod()]
        public SqlIncluder<TRoot, TResult> Include<TResult>(Func<TRoot, TResult> selector)
            where TResult : SqlEntity, new() => throw new Exception();

        [QueryMethod()]
        public SqlIncluder<TRoot, TResult> Include<TResult>(Func<TRoot, EntitySet<TResult>> selector)
            where TResult : SqlEntity, new() => throw new Exception();

        [QueryMethod()]
        public SqlIncluder<TRoot, TResult> ThenInclude<TResult>(Func<TChild, TResult> selector)
            where TResult : SqlEntity, new() => throw new Exception();

        [QueryMethod()]
        public SqlIncluder<TRoot, TResult> ThenInclude<TResult>(Func<TChild, EntitySet<TResult>> selector)
            where TResult : SqlEntity, new() => throw new Exception();
    }

    public sealed class SqlQuery<T> : ISqlQueryJoin<T> where T : SqlEntity, new()
    {
        [GenericCreate(false)]
        public SqlQuery() { }

        [QueryMethod()]
        public SqlIncluder<T, TChild> Include<TChild>(Func<T, TChild> selector)
            where TChild : SqlEntity, new() => throw new Exception();

        [QueryMethod()]
        public SqlIncluder<T, TChild> Include<TChild>(Func<T, EntitySet<TChild>> selector)
            where TChild : SqlEntity, new() => throw new Exception();

        [QueryMethod()]
        public SqlQuery<T> Where(Func<T, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> Where<TJoin>(ISqlQueryJoin<TJoin> join, Func<T, TJoin, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> Where<TJoin1, TJoin2>(ISqlQueryJoin<TJoin1> j1, ISqlQueryJoin<TJoin2> j2,
            Func<T, TJoin1, TJoin2, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> AndWhere(Func<T, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> AndWhere<TJoin>(ISqlQueryJoin<TJoin> join, Func<T, TJoin, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> AndWhere<TJoin1, TJoin2>(ISqlQueryJoin<TJoin1> j1, ISqlQueryJoin<TJoin2> j2,
            Func<T, TJoin1, TJoin2, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> OrWhere(Func<T, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> OrWhere<TJoin>(ISqlQueryJoin<TJoin> join, Func<T, TJoin, bool> condition) => this;

        [QueryMethod()]
        public SqlQuery<T> OrWhere<TJoin1, TJoin2>(ISqlQueryJoin<TJoin1> j1, ISqlQueryJoin<TJoin2> j2,
            Func<T, TJoin1, TJoin2, bool> condition) => this;

        public SqlQuery<T> Skip(int rows) => this;

        public SqlQuery<T> Take(int rows) => this;

        [QueryMethod()]
        public SqlQuery<T> OrderBy<TResult>(Func<T, TResult> selector) => this;

        [QueryMethod()]
        public SqlQuery<T> OrderByDesc<TResult>(Func<T, TResult> selector) => this;

        public Task<int> CountAsync() => throw new Exception();

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
        public Task<IList<TResult>> ToListAsync<TJoin, TResult>(ISqlQueryJoin<TJoin> join,
            Func<T, TJoin, TResult> selector) =>
            throw new Exception();

        /// <summary>
        /// 执行查询并转换为动态数据表
        /// </summary>
        /// <param name="selector">必须为返回匿名类的Lambda表达式 eg: t => new {t.Name, t.Score}</param>
        [QueryMethod()]
        public Task<DataTable> ToDataTableAsync<TResult>(Func<T, TResult> selector) => throw new Exception();

        /// <summary>
        /// 执行查询并转换为树状结构
        /// </summary>
        [QueryMethod()]
        public Task<IList<T>> ToTreeAsync(Func<T, EntitySet<T>> children) => throw new Exception();

        /// <summary>
        /// 执行查询并转换为树节点路径
        /// </summary>
        [QueryMethod()]
        public Task<TreePath> ToTreePathAsync(Func<T, T> parent, Func<T, string> textMember) => throw new Exception();

        [QueryMethod()]
        public SqlQuery<T> GroupBy<TResult>(Func<T, TResult> keySelector) => this;

        [QueryMethod()]
        public SqlQuery<T> Having(Func<T, bool> condition) => this;
    }

    [NoneGeneric]
    public sealed class SqlUpdateCommand<T> : ISqlQueryJoin<T> where T : SqlEntity
    {
        [GenericCreate(true)]
        public SqlUpdateCommand() { }

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
        public SqlDeleteCommand() { }

        [QueryMethod()]
        public SqlDeleteCommand<T> Where(Func<T, bool> condition) => this;

        public async Task<int> ExecAsync(DbTransaction? txn = null) => throw new Exception();
    }
}

namespace TestNameSpace
{
    #region ====Mock Entities====

    public sealed class Order : SqlEntity
    {
        public Customer? Customer { get; set; } = null!;

        private string? _customerName;
        public string? CustomerName
        {
            get => Customer?.Name ??  _customerName;
            set
            {
                if (Customer != null)
                    Customer.Name = value!;
                _customerName = value;
                //Raise OnPropertyChange only
            }
        }

        public EntitySet<OrderItem> Items { get; }

        public override ModelId ModelId { get; }
        protected override short[] AllMembers { get; }

        protected internal override void WriteMember<T>(short id, ref T ws, int flags)
        {
            throw new NotImplementedException();
        }

        protected internal override void ReadMember<T>(short id, ref T rs, int flags)
        {
            throw new NotImplementedException();
        }
    }

    public sealed class Customer : SqlEntity
    {
        public string Name { get; set; } = null!;
        public City City { get; set; } = null!;

        public override ModelId ModelId { get; }
        protected override short[] AllMembers { get; }

        protected internal override void WriteMember<T>(short id, ref T ws, int flags)
        {
            throw new NotImplementedException();
        }

        protected internal override void ReadMember<T>(short id, ref T rs, int flags)
        {
            throw new NotImplementedException();
        }
    }

    public sealed class City : SqlEntity
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;

        public override ModelId ModelId { get; }
        protected override short[] AllMembers { get; }

        protected internal override void WriteMember<T>(short id, ref T ws, int flags)
        {
            throw new NotImplementedException();
        }

        protected internal override void ReadMember<T>(short id, ref T rs, int flags)
        {
            throw new NotImplementedException();
        }
    }

    public sealed class OrderItem : SqlEntity
    {
        public int LineNumber { get; set; }

        public Product Product { get; set; } = null!;

        public override ModelId ModelId { get; }
        protected override short[] AllMembers { get; }

        protected internal override void WriteMember<T>(short id, ref T ws, int flags)
        {
            throw new NotImplementedException();
        }

        protected internal override void ReadMember<T>(short id, ref T rs, int flags)
        {
            throw new NotImplementedException();
        }
    }

    public sealed class Product : SqlEntity
    {
        public string Name { get; set; }

        public override ModelId ModelId { get; }
        protected override short[] AllMembers { get; }

        protected internal override void WriteMember<T>(short id, ref T ws, int flags)
        {
            throw new NotImplementedException();
        }

        protected internal override void ReadMember<T>(short id, ref T rs, int flags)
        {
            throw new NotImplementedException();
        }
    }

    #endregion

    public static class Main
    {
        public static void Test()
        {
            var q = new SqlQuery<Order>();
            q.Include(order => order.Customer)
                .ThenInclude(customer => customer.City)
                .Include(order => order.Items)
                .ThenInclude(item => item.Product);

            //另一种写法
            q.Include(order => order.Customer)
                .ThenInclude(customer => customer.City);
            q.Include(order => order.Items)
                .ThenInclude(item => item.Product);
        }
    }
}