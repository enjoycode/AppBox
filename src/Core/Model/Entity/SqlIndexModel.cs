namespace AppBoxCore;

public sealed class SqlIndexModel : IndexModelBase
{
    internal SqlIndexModel() { }

    internal SqlIndexModel(EntityModel owner, string name, bool unique,
        FieldWithOrder[] fields, short[]? storingFields = null)
        : base(owner, name, unique, fields, storingFields) { }
}