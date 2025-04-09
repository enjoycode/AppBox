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

    public static Task Save(object[] data)
    {
        throw new NotImplementedException();
    }

    public async ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        switch (method.Span)
        {
            case nameof(Fetch): return AnyValue.From(await Fetch((DynamicQuery)args.GetObject()!));
            case nameof(Save):
            {
                await Save((object[])args.GetObject()!);
                return AnyValue.Empty;
            }
            default: throw new Exception($"Can't find method: {method}");
        }
    }
}