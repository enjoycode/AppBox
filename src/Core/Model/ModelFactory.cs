namespace AppBoxCore;

public static class ModelFactory
{
    public static ModelBase Make(ModelType type) => type switch
    {
        ModelType.Entity => new EntityModel(),
        ModelType.Service => new ServiceModel(),
        ModelType.View => new ViewModel(),
        ModelType.Permission => new PermissionModel(),
        ModelType.Report => new ReportModel(),
        ModelType.Enum => new EnumModel(),
        _ => throw new NotImplementedException($"{nameof(ModelFactory)}.Make {type}")
    };
}