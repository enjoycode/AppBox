using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace AppBoxCore;

public sealed class EntityExpression : Expression, IMemberPathBuilder, IEntityPathExpression
{
    /// <summary>
    /// New Root EntityExpression
    /// </summary>
    internal EntityExpression(EntityModel model, object? user) //TODO: remove this
    {
        Name = null;
        Owner = null;
        ModelId = model.Id;
        _user = user;
    }

    /// <summary>
    /// New Root EntityExpression
    /// </summary>
    public EntityExpression(ModelId modelId, object? user)
    {
        Name = null;
        Owner = null;
        ModelId = modelId;
        _user = user;
    }

    /// <summary>
    /// New EntityRefMember's EntityExpression
    /// </summary>
    private EntityExpression(string name, ModelId modelId, EntityExpression owner)
    {
        Name = name;
        Owner = owner;
        ModelId = modelId;
    }

    #region ====Fields & Properties====

    public override ExpressionType Type => ExpressionType.EntityExpression;

    /// <summary>
    /// 名称
    /// 分以下几种情况：
    /// 1、如果为EntityExpression
    /// 1.1 如果为Root EntityExpression，Name及Owner属性皆为null
    /// 1.2 如果为Ref EntityExpression，Name即属性名称
    /// </summary>
    public string? Name { get; }

    public EntityExpression? Owner { get; }

    /// <summary>
    /// 用于查询时的别名，不用序列化
    /// </summary>
    public string? AliasName { get; set; }

    private object? _user;

    public object? User
    {
        get => Equals(null, Owner) ? _user : Owner.User;
        set
        {
            if (Equals(null, Owner))
                _user = value;
            else
                throw new NotSupportedException();
        }
    }

    public ModelId ModelId { get; private set; }

    #endregion

    internal string GetFieldAlias()
    {
        return IsNull(Owner) ? Name! : $"{Owner!.GetFieldAlias()}{Name}";
    }

    #region ====IMemberPathBuilder====

    public EntityFieldExpression F(string name)
    {
        if (Cache.TryGetValue(name, out var member))
        {
            if (member is EntityFieldExpression entityFieldExpression)
                return entityFieldExpression;
            throw new ArgumentException("Exists is not a EntityFieldExpression.");
        }

        var exp = new EntityFieldExpression(name, this);
        Cache.Add(name, exp);
        return exp;
    }

    public EntityExpression R(string name, long modelId)
    {
        if (Cache.TryGetValue(name, out var member))
        {
            if (member is EntityExpression entityExpression)
                return entityExpression;
            throw new ArgumentException("Exists is not a EntityExpression.");
        }

        var exp = new EntityExpression(name, modelId, this);
        Cache.Add(name, exp);
        return exp;
    }

    public EntitySetExpression S(string name, long modelId)
    {
        if (Cache.TryGetValue(name, out var member))
        {
            if (member is EntitySetExpression entitySetExpression)
                return entitySetExpression;
            throw new ArgumentException("Exists is not a EntitySetExpression.");
        }

        var exp = new EntitySetExpression(name, modelId, this);
        Cache.Add(name, exp);
        return exp;
    }

    public Expression U(string name) => throw new NotSupportedException();
    
    private Dictionary<string, Expression>? _cache;

    private Dictionary<string, Expression> Cache => _cache ??= new Dictionary<string, Expression>();

    internal void AddMemberToCache(string name, Expression member)
    {
        if (member.Type != ExpressionType.EntityFieldExpression &&
            member.Type != ExpressionType.EntitySetExpression &&
            member.Type != ExpressionType.EntityExpression)
            throw new ArgumentException($"Not supported MemberType [{member.Type}].");

        if (!Cache.TryAdd(name, member))
            throw new Exception($"Already exists: {name}");
    }

    internal bool TryGetExistsMember(string name, [MaybeNullWhen(false)] out Expression member) =>
        Cache.TryGetValue(name, out member);

    #endregion

    #region ====Overrides Methods====

    public override int GetHashCode() => base.GetHashCode();

    public override bool Equals(object? obj)
    {
        if (obj == null)
            return false;

        if (ReferenceEquals(this, obj))
            return true;

        var target = obj as EntityExpression;
        if (IsNull(target))
            return false;

        return target!.ModelId == ModelId
               && target.User == User && Equals(target.Owner, Owner);
    }

    public override void ToCode(StringBuilder sb, int preTabs)
    {
        if (Equals(Owner, null))
        {
            if (string.IsNullOrEmpty(AliasName))
                sb.Append('t');
            else
                sb.Append(AliasName);
        }
        else
        {
            Owner.ToCode(sb, preTabs);
            sb.Append($".{Name}");
        }
    }

    #endregion

    #region ====Serialization====

    protected internal override void WriteTo(IOutputStream writer)
    {
        writer.WriteLong(ModelId);
        writer.SerializeExpression(Owner);
        if (!IsNull(Owner))
            writer.WriteString(Name);
    }

    internal static EntityExpression Read(IInputStream reader)
    {
        ModelId modelId = reader.ReadLong();
        var owner = (EntityExpression?)reader.Deserialize();
        if (IsNull(owner))
        {
            var res = new EntityExpression(modelId, null);
            reader.Context.AddToDeserialized(res);
            return res;
        }

        var name = reader.ReadString()!;
        if (owner!.TryGetExistsMember(name, out var exists))
            return (EntityExpression)exists;

        var member = new EntityExpression(name, modelId, owner);
        owner.AddMemberToCache(name, member);
        return member;
    }

    #endregion
}