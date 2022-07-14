using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxDesign;

public sealed class SqlStoreOptionsVO
{
    public long StoreModelId { get; private set; }

    public IList<FieldWithOrder> PrimaryKeys { get; } = new List<FieldWithOrder>();
}