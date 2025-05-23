using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace AppBoxCore;

public sealed class EntityExpression : EntityPathExpression
{
    /// <summary>
    /// New Root EntityExpression
    /// </summary>
    internal EntityExpression(EntityModel model, object? user) : base(null, null)
    {
        _model = model;
        ModelId = model.Id;
        _user = user;
    }

    /// <summary>
    /// New Root EntityExpression
    /// </summary>
    public EntityExpression(ModelId modelId, object? user) : base(null, null)
    {
        ModelId = modelId;
        _user = user;
    }

    /// <summary>
    /// New EntityRefModel's EntityExpression
    /// </summary>
    private EntityExpression(string name, ModelId modelId, EntityExpression owner) : base(name, owner)
    {
        ModelId = modelId;
    }

    #region ====Fields & Properties====

    public override ExpressionType Type => ExpressionType.EntityExpression;

    /// <summary>
    /// 用于查询时的别名，不用序列化
    /// </summary>
    public string? AliasName { get; set; }

    private object? _user;

    public object? User
    {
        get
        {
            if (Equals(null, Owner))
                return _user;
            return Owner.User;
        }
        set
        {
            if (Equals(null, Owner))
                _user = value;
            else
                throw new NotSupportedException();
        }
    }

    public ModelId ModelId { get; private set; }

    private EntityModel? _model;

    #endregion

    #region ====Default Property====

    private EntityModel EnsureModel()
    {
        return _model ??= RuntimeContext.GetModel<EntityModel>(ModelId);
    }

    public override EntityPathExpression this[string name]
    {
        get
        {
            if (Cache.TryGetValue(name, out var exp))
                return exp;

            var model = EnsureModel();
            var m = model.GetMember(name, false);
            if (m != null)
            {
                switch (m.Type)
                {
                    case EntityMemberType.EntityField:
                        //case EntityMemberType.Formula:
                        //case EntityMemberType.Aggregate:
                        //case EntityMemberType.AutoNumber:
                        exp = new EntityFieldExpression(name, this);
                        break;
                    case EntityMemberType.EntityRef:
                        var rm = (EntityRefModel)m;
                        if (!rm.IsAggregationRef)
                            exp = new EntityExpression(name, rm.RefModelIds[0], this);
                        else
                            throw new NotImplementedException("尚未实现聚合引用对象的表达式");
                        break;
                    case EntityMemberType.EntitySet:
                        var sm = (EntitySetModel)m;
                        //EntityRefModel erm = esm.RefModel[esm.RefMemberName] as EntityRefModel;
                        exp = new EntitySetExpression(name, this, sm.RefModelId);
                        break;
                    //case EntityMemberType.AggregationRefField:
                    //    exp = new AggregationRefFieldExpression(name, this);
                    //    break;
                    default:
                        throw new NotSupportedException(
                            $"EntityExpression.DefaultIndex[]: Not Supported MemberType [{m.Type.ToString()}].");
                }

                Cache.Add(name, exp);
                return exp;
            }

            //如果不包含判断是否继承，或EntityRef's DisplayText
            //if (name.EndsWith("DisplayText", StringComparison.Ordinal)) //TODO: 暂简单判断
            //{
            //    exp = new FieldExpression(name, this);
            //    Cache.Add(name, exp);
            //    return exp;
            //}
            throw new Exception($"Can not find member [{name}] in [{model.Name}].");
        }
    }


    private Dictionary<string, EntityPathExpression>? _cache;

    private Dictionary<string, EntityPathExpression> Cache =>
        _cache ??= new Dictionary<string, EntityPathExpression>();

    internal void AddMemberToCache(string name, EntityPathExpression member)
    {
#if DEBUG
        if (Cache.ContainsKey(name))
            throw new Exception($"Already exists: {name}");
#endif
        Cache[name] = member;
    }

    internal bool TryGetExistsMember(string name, [MaybeNullWhen(false)] out EntityPathExpression member) =>
        Cache.TryGetValue(name, out member);

    #endregion

    #region ====Overrides Methods====

    public override int GetHashCode()
    {
        return base.GetHashCode();
    }

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