namespace AppBoxCore;

public sealed class SqlStoreOptions : IEntityStoreOptions
{
    private long _storeModelId; //映射的DataStoreModel的标识
    private FieldWithOrder[]? _primaryKeys;
    private IList<SqlIndexModel>? _indexes;

    public DataStoreKind Kind => DataStoreKind.Sql;

    public bool HasIndexes => _indexes != null && _indexes.Count > 0;
    public bool HasPrimaryKeys => _primaryKeys != null && _primaryKeys.Length > 0;

    public FieldWithOrder[] PrimaryKeys => _primaryKeys!;

    public IList<SqlIndexModel> Indexes => _indexes!;

    #region ====Runtime Methods====

    public bool IsPrimaryKey(short memberId)
    {
        return _primaryKeys != null && _primaryKeys.Any(t => t.MemberId == memberId);
    }

    #endregion
}