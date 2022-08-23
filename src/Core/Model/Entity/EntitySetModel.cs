namespace AppBoxCore;

public sealed class EntitySetModel : EntityMemberModel, IModelReference
{
    internal EntitySetModel(EntityModel owner) : base(owner, string.Empty, false) { }

    public EntitySetModel(EntityModel owner, string name, long refModelId, short refMemberId)
        : base(owner, name, true)
    {
        RefModelId = refModelId;
        RefMemberId = refMemberId;
    }

    /// <summary>
    /// 引用的实体模型标识号，如Order->OrderDetail，则指向OrderDetail的模型标识
    /// </summary>
    public long RefModelId { get; private set; }

    /// <summary>
    /// 引用的EntityRef成员标识，如Order->OrderDetail，则指向OrderDetail.Order成员标识
    /// </summary>
    public short RefMemberId { get; private set; }

    public override EntityMemberType Type => EntityMemberType.EntitySet;

    internal override void SetAllowNull(bool value)
    {
        //do noting, always allow null
    }

    internal override void AddModelReferences(List<ModelReferenceInfo> list,
        ModelReferenceType referenceType, ModelId modelID,
        string? memberName, short? entityMemberId)
    {
        if (referenceType == ModelReferenceType.EntityModel)
        {
            if (RefModelId == modelID)
                list.Add(new ModelReferenceInfo(this,
                    ModelReferencePosition.EntitySetModel_RefModelID, Name,
                    $"{Owner.Name}.{Name}"));
        }
        else if (referenceType == ModelReferenceType.EntityMember && RefModelId == modelID)
        {
            if (RefMemberId == entityMemberId!.Value)
                list.Add(new ModelReferenceInfo(this,
                    ModelReferencePosition.EntitySetModel_RefMemberId, Name, $"{Owner.Name}.{Name}"));
        }
    }

    void IModelReference.RenameReference(ModelReferenceType sourceType,
        ModelReferencePosition targetType, ModelId modelId, string oldName, string newName)
    {
        //do nothing
    }

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        ws.WriteLong(RefModelId);
        ws.WriteShort(RefMemberId);
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        RefModelId = rs.ReadLong();
        RefMemberId = rs.ReadShort();
    }

    #endregion
}