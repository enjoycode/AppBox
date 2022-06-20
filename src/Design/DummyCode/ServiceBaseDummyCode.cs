using System;
using System.Threading.Tasks;
using System.Data.Common;
using AppBoxCore;

namespace AppBoxStore;

public static class SqlEntityExtensions
{
    public static Task<int> InsertAsync(this SqlEntity entity, DbTransaction? txn = null)
        => throw new Exception();
    
    public static Task<int> UpdateAsync(this SqlEntity entity, DbTransaction? txn = null)
        => throw new Exception();
    
    public static Task<int> DeleteAsync(this SqlEntity entity, DbTransaction? txn = null)
        => throw new Exception();
}