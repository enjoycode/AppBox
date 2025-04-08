using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 通用的动态化实体增删改查服务
/// </summary>
internal sealed class EntityService : IService
{
    public static Task<DataTable> Fetch(DynamicQuery query)
    {
        var q = new SqlDynamicQuery(query);
        return q.ToDataTableAsync();
    }

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        return method.Span switch
        {
            nameof(Fetch) => AnyValue.From(await Fetch((DynamicQuery)args.GetObject()!)),
            _ => throw new Exception($"Can't find method: {method}")
        };
    }
}