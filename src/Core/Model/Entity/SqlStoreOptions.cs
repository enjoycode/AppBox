namespace AppBoxCore;

public sealed class SqlStoreOptions : IEntityStoreOptions
{
    private long _storeModelId; //映射的DataStoreModel的标识
    private FieldWithOrder[]? _primaryKeys;

    public DataStoreKind Kind => DataStoreKind.Sql;

    public bool HasPrimaryKeys => _primaryKeys != null && _primaryKeys.Length > 0;

    #region ====Runtime Methods====

    public bool IsPrimaryKey(short memberId)
    {
        return _primaryKeys != null && _primaryKeys.Any(t => t.MemberId == memberId);
    }

    #endregion
}