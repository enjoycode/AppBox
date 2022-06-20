using System;
using System.Threading.Tasks;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

#region ====虚拟代码转运行时代码的Attributes====

[AttributeUsage(AttributeTargets.Constructor)]
internal sealed class GenericCreateAttribute: Attribute {}

[AttributeUsage(AttributeTargets.Method)]
internal sealed class QueryMethodAttribute: Attribute {}

#endregion

public static class SqlEntityExtensions
{
    public static Task<int> InsertAsync(this SqlEntity entity, DbTransaction? txn = null)
        => throw new Exception();
    
    public static Task<int> UpdateAsync(this SqlEntity entity, DbTransaction? txn = null)
        => throw new Exception();
    
    public static Task<int> DeleteAsync(this SqlEntity entity, DbTransaction? txn = null)
        => throw new Exception();
}

public sealed class SqlQuery<T> where T : SqlEntity
{
    [GenericCreate] public SqlQuery() {}
    
    
}