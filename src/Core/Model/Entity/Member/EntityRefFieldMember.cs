namespace AppBoxCore;

/// <summary>
/// 作为实体附加的实体引用的字段，eg: Order.Customer.Name
/// </summary>
/// <remarks>
/// 用于前端查询时包含引用的实体的字段，可以省掉创建一个对应的ViewObject
/// eg:前端需要查询订单列表，同时包含引用的客户的名称
/// </remarks>
public sealed class EntityRefFieldMember : EntityMember
{
    internal EntityRefFieldMember(EntityModel owner) : base(owner, string.Empty, false) { }

    public EntityRefFieldMember(EntityModel owner, string name, short[] refFieldPath) : base(owner, name, true)
    {
        RefFieldPath = refFieldPath;
    }

    public override EntityMemberType Type => EntityMemberType.EntityRefField;

    /// <summary>
    /// 引用字段的路径
    /// </summary>
    /// <remarks>
    /// eg: Order.Customer.City.Name 则为 [memberId(Customer), memberId(City), memberId(Name)]
    /// </remarks>
    public short[] RefFieldPath { get; private set; } = null!;

    internal override void SetAllowNull(bool value) => throw new NotSupportedException();

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteVariant(RefFieldPath.Length);
        for (var i = 0; i < RefFieldPath.Length; i++)
        {
            ws.WriteShort(RefFieldPath[i]);
        }
        
        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        var length = rs.ReadVariant();
        RefFieldPath = new short[length];
        for (var i = 0; i < RefFieldPath.Length; i++)
        {
            RefFieldPath[i] = rs.ReadShort();
        }

        rs.ReadFieldId(); //保留
    }

    #endregion
}