using AppBoxCore;
using AppBoxStore;

namespace AppBoxServer;

/// <summary>
/// 通用的动态化实体增删改查服务
/// </summary>
internal sealed class EntityService
{
    public DynamicTable FetchTable(DynamicQuery query)
    {
        var q = new SqlDynamicQuery(query);
        throw new NotImplementedException();
    }

    public DynamicRow FetchRow(DynamicQuery query)
    {
        throw new NotImplementedException();
    }
}