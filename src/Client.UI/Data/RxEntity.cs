using System;
using System.Collections.Generic;
using AppBoxCore;
using PixUI;

namespace AppBoxClient;

public sealed class RxEntity<T> : RxObjectBase<T> where T : Entity, new()
{
    public RxEntity()
    {
        _target = new T();
        _target.PropertyChanged += OnTargetPropertyChanged;
    }
    
    private readonly Dictionary<short, State> _ds = new();

    public State<TMember> Observe<TMember>(short memberId, Func<T, TMember> getter, Action<T, TMember> setter)
    {
        if (_ds.TryGetValue(memberId, out var state))
            return (State<TMember>)state;

        var proxy = new RxProxy<TMember>(
            () => getter(Target),
            v => setter(Target, v),
            false
        );
        _ds[memberId] = proxy;
        return proxy;
    }

    private void OnTargetPropertyChanged(short memberId)
    {
        if (_ds.TryGetValue(memberId, out var state))
            state.NotifyValueChanged();
    }

    protected override void OnTargetChanged(T old)
    {
        old.PropertyChanged -= OnTargetPropertyChanged;
        _target.PropertyChanged += OnTargetPropertyChanged;

        //TODO:考虑比较新旧值是否产生变更，暂全部通知
        foreach (var state in _ds.Values)
        {
            state.NotifyValueChanged();
        }
    }
}

public static class EntityExtensions
{
    public static State<TMember> Observe<TEntity, TMember>(this TEntity entity, short memberId,
        Func<TEntity, TMember> getter, Action<TEntity, TMember> setter)
        where TEntity : Entity
    {
        var rxMember = new RxProxy<TMember>(() => getter(entity), v => setter(entity, v), false);
        entity.PropertyChanged += mid =>
        {
            if (mid == memberId) rxMember.NotifyValueChanged();
        };
        return rxMember;
    }
}