using System.Text;

namespace AppBoxCore;

public sealed class EntityExpression : EntityPathExpression
{
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

    public long ModelID { get; private set; }

    //TODO:考虑实现AddToCache，用于下属成员反序列化时自动加入Cache内
    private Dictionary<string, EntityPathExpression>? _cache;

    private Dictionary<string, EntityPathExpression> Cache =>
        _cache ??= new Dictionary<string, EntityPathExpression>();

    #endregion

    #region ====Default Property====

    public override EntityPathExpression this[string name]
    {
        get
        {
            EntityPathExpression? exp = null;
            if (Cache.TryGetValue(name, out exp))
                return exp;

            var model = RuntimeContext.GetModelAsync<EntityModel>(ModelID).Result;
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

    #endregion

    #region ====Ctor====

    /// <summary>
    /// New Root EntityExpression
    /// </summary>
    public EntityExpression(long modelID, object? user) : base(null, null)
    {
        ModelID = modelID;
        _user = user;
    }

    /// <summary>
    /// New EntityRefModel's EntityExpression
    /// </summary>
    internal EntityExpression(string name, long modelID, EntityExpression owner)
        : base(name, owner)
    {
        ModelID = modelID;
    }

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

        return target!.ModelID == ModelID
               && target.User == User && Equals(target.Owner, Owner);
    }

    public override void ToCode(StringBuilder sb, string? preTabs)
    {
        if (Equals(Owner, null))
        {
            if (string.IsNullOrEmpty(AliasName))
                sb.Append("t");
            else
                sb.Append(AliasName);
        }
        else
        {
            Owner.ToCode(sb, preTabs);
            sb.AppendFormat(".{0}", Name);
        }
    }

    #endregion
}