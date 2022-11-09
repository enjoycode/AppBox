using System;
using AppBoxCore;

namespace AppBoxStore.Entities;

[EntityModelId(MODELID)]
internal sealed class OrgUnit : SqlEntity
{
    private string _name = null!;
    private Guid _id;
    private long _baseType;
    private Guid? _parentId;

    private SqlEntity? _base;
    private OrgUnit? _parent;
    private EntitySet<OrgUnit>? _children;

    public Guid Id => _id;

    public long BaseType => _baseType;

    public Guid? ParentId
    {
        get => _parentId;
        set
        {
            if (_parentId == value) return;
            _parentId = value;
            OnPropertyChanged(PARENTID_ID);
        }
    }

    public OrgUnit? Parent
    {
        get => _parent;
        set
        {
            _parent = value;
            _parentId = _parent?.Id;
        }
    }

    public string Name
    {
        get => _name;
        set => _name = value;
    }

    public SqlEntity? Base
    {
        get => _base;
        set
        {
            _base = value ?? throw new ArgumentNullException();
            switch (value)
            {
                case Enterprise enterprise:
                    _baseType = Enterprise.MODELID;
                    _id = enterprise.Id;
                    _name = enterprise.Name;
                    break;
                case Workgroup workgroup:
                    _baseType = Workgroup.MODELID;
                    _id = workgroup.Id;
                    _name = workgroup.Name;
                    break;
                case Employee employee:
                    _baseType = Employee.MODELID;
                    _id = employee.Id;
                    _name = employee.Name;
                    break;
                default: throw new ArgumentException();
            }

            OnPropertyChanged(BASETYPE_ID);
            OnPropertyChanged(ID_ID);
        }
    }

    public EntitySet<OrgUnit> Children
    {
        get
        {
            _children ??= new EntitySet<OrgUnit>((child, toNull) => child.Parent = toNull ? null : this);
            return _children;
        }
    }

    #region ====Overrides====

    internal const long MODELID = 8012673906332663824; //4

    internal const short ID_ID = 1 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short NAME_ID = 2 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short BASETYPE_ID = 3 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short BASE_ID = 4 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short PARENTID_ID = 5 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short PARENT_ID = 6 << IdUtil.MEMBERID_SEQ_OFFSET;
    internal const short CHILDREN_ID = 7 << IdUtil.MEMBERID_SEQ_OFFSET;

    private static readonly short[] MemberIds =
        { ID_ID, NAME_ID, BASETYPE_ID, BASE_ID, PARENTID_ID, PARENT_ID, CHILDREN_ID };

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => MemberIds;

    protected internal override void WriteMember(short id, IEntityMemberWriter ws, int flags)
    {
        switch (id)
        {
            case NAME_ID:
                ws.WriteStringMember(id, _name, flags);
                break;
            case ID_ID:
                ws.WriteGuidMember(id, _id, flags);
                break;
            case BASETYPE_ID:
                ws.WriteLongMember(id, _baseType, flags);
                break;
            case PARENTID_ID:
                ws.WriteGuidMember(id, _parentId, flags);
                break;
            case BASE_ID:
                ws.WriteEntityRefMember(id, _base, flags);
                break;
            case PARENT_ID:
                ws.WriteEntityRefMember(id, _parent, flags);
                break;
            case CHILDREN_ID:
                ws.WriteEntitySetMember(id, _children, flags);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    protected internal override void ReadMember(short id, IEntityMemberReader rs, int flags)
    {
        switch (id)
        {
            case NAME_ID:
                _name = rs.ReadStringMember(flags);
                break;
            case ID_ID:
                _id = rs.ReadGuidMember(flags);
                break;
            case BASETYPE_ID:
                _baseType = rs.ReadLongMember(flags);
                break;
            case PARENTID_ID:
                _parentId = rs.ReadGuidMember(flags);
                break;
            case BASE_ID:
                _base = rs.ReadEntityRefMember<SqlEntity>(flags, () => _baseType switch
                {
                    Employee.MODELID => new Employee(),
                    Workgroup.MODELID => new Workgroup(),
                    Enterprise.MODELID => new Enterprise(Guid.Empty),
                    _ => throw new Exception()
                });
                break;
            case PARENT_ID:
                _parent = rs.ReadEntityRefMember(flags, () => new OrgUnit());
                break;
            case CHILDREN_ID:
                rs.ReadEntitySetMember(flags, Children);
                break;
            default:
                throw new SerializationException(SerializationError.UnknownEntityMember,
                    nameof(Employee));
        }
    }

    #endregion
}