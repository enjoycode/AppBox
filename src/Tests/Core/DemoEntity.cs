using AppBoxCore;

namespace Tests.Core;

public sealed class DemoEntity : Entity, IEquatable<DemoEntity>
{
    public const long MODELID = 12345;

    private static readonly short[] Members = [1, 2];

    private string _name = string.Empty;

    public string Name
    {
        get => _name;
        set
        {
            if (_name == value) return;
            _name = value;
            OnPropertyChanged(1);
        }
    }

    private int? _score;

    public int? Score
    {
        get => _score;
        set
        {
            if (_score == value) return;
            _score = value;
            OnPropertyChanged(2);
        }
    }

    public override ModelId ModelId => MODELID;
    protected override short[] AllMembers => Members;

    protected internal override void WriteMember<T>(short id, ref T ws, int flags)
    {
        switch (id)
        {
            case 1:
                ws.WriteStringMember(id, Name, flags);
                break;
            case 2:
                ws.WriteIntMember(id, Score, flags);
                break;
            default: throw new Exception();
        }
    }

    protected internal override void ReadMember<T>(short id, ref T rs, int flags)
    {
        switch (id)
        {
            case 1:
                Name = rs.ReadStringMember(flags);
                break;
            case 2:
                Score = rs.ReadIntMember(flags);
                break;
            default: throw new Exception();
        }
    }

    public bool Equals(DemoEntity? other)
    {
        if (other == null) return false;
        return Name == other.Name && Score == other.Score;
    }

    //以下测试与EntityData的类型转换
    public static implicit operator EntityData(DemoEntity entity) => entity.ToEntityData();
    public static explicit operator DemoEntity(EntityData data) => data.ToEntity<DemoEntity>();
}