using PixUI;
using AppBoxCore;

namespace AppBoxClient;

public sealed class RxEntity<T> : RxObject<T> where T : Entity, new()
{
    public State<TMember> Observe<TMember>(Func<T, TMember> getter)
        => throw new Exception();
}

public static class EntityExtensions
{
    public static State<TMember> Observe<TEntity, TMember>(this TEntity entity, Func<TEntity, TMember> getter)
        where TEntity : Entity
        => throw new Exception();

}