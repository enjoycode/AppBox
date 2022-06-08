namespace AppBoxCore;

public static class ModelFactory
{
    public static ModelBase Make(ModelType type)
    {
        return type switch
        {
            ModelType.Entity => new EntityModel(),
            ModelType.Service => new ServiceModel(),
            ModelType.View => new ViewModel(),
            ModelType.Permission => new PermissionModel(),
            _ => throw new NotImplementedException(type.ToString())
        };
    }
}