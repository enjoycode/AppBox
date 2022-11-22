using System;
using System.Collections.Generic;
using AppBoxCore;
using PixUI;

namespace AppBoxClient;

public sealed class RxEntity<T> : RxObject<T> where T : Entity, new()
{
    public RxEntity()
    {
        _target = new T();
        _target.PropertyChanged += OnTargetPropertyChanged;
    }

    public State<TMember> Observe<TMember>(short memberId, Func<T, TMember> getter, Action<T, TMember> setter)
    {
        if (_ds.TryGetValue(memberId, out var state))
            return (State<TMember>)state;
        
        var proxy = new EntityMemberProxy<T, TMember>(this, getter, setter);
        _ds[memberId] = proxy;
        return proxy;
    }

    private readonly Dictionary<short, StateBase> _ds = new();

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

internal sealed class EntityMemberProxy<TEntity, TMember> : State<TMember> where TEntity: Entity, new()
{
    internal EntityMemberProxy(RxEntity<TEntity> rxEntity, Func<TEntity, TMember> getter, Action<TEntity, TMember> setter)
    {
        _rxEntity = rxEntity;
        _getter = getter;
        _setter = setter;
    }

    private readonly RxEntity<TEntity> _rxEntity;
    private readonly Func<TEntity, TMember> _getter;
    private readonly Action<TEntity, TMember> _setter;

    public override bool Readonly => false;

    public override TMember Value
    {
        get => _getter(_rxEntity.Target);
        set => _setter(_rxEntity.Target, value);
    }
}


public static class EntityExtensions
{
    public static State<TMember> Observe<TEntity, TMember>(this TEntity entity, short memberId,
        Func<TEntity, TMember> getter, Action<TEntity, TMember> setter)
        where TEntity : Entity
    {
        //TODO: 暂使用RxProperty，可能会重复激发PropertyChanged
        var rxMember = new RxProperty<TMember>(() => getter(entity), v => setter(entity, v));
        entity.PropertyChanged += mid =>
        {
            if (mid == memberId) rxMember.NotifyValueChanged();
        };
        return rxMember;
    }
}

public static class ObjectNotifierExtensions
{
    public static void BindToRxEntity<T>(this ObjectNotifier<T> notifier, RxEntity<T> rxEntity)
        where T: Entity, new()
    {
        notifier.OnChange = t => rxEntity.Target = t;
    }
}