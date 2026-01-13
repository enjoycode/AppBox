namespace AppBoxCore;

public abstract class SqlEntity : DbEntity
{
    protected sealed override EntityType EntityType => EntityType.SqlStore;
}