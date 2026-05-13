namespace AppBoxCore;

public sealed class WorkflowParameter : IBinSerializable
{
    public WorkflowParameter() { }

    private string? _originalName;
    public string OriginalName => _originalName ?? Name;

    private string _name = null!;

    public string Name
    {
        get => _name;
        set
        {
            if (_name != value)
            {
                if (_originalName == null)
                    _originalName = _name;
                _name = value;
            }
        }
    }

    public WorkflowParameterType Type { get; set; }

    public void AcceptChanges()
    {
        _originalName = null;
    }

    public void WriteTo(IOutputStream bs)
    {
        bs.WriteFieldId(1);
        bs.WriteString(Name);

        bs.WriteFieldId(2);
        bs.WriteByte((byte)Type);

        bs.WriteFieldEnd();
    }

    public void ReadFrom(IInputStream bs)
    {
        int propIndex;
        do
        {
            propIndex = bs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Name = bs.ReadString()!; break;
                case 2: Type = (WorkflowParameterType)bs.ReadByte(); break;
                case 0: break;
                default: throw new Exception($"Deserialize_ObjectUnknownFieldIndex: {nameof(WorkflowParameter)}");
            }
        } while (propIndex != 0);
    }
}

public enum WorkflowParameterType : byte
{
    Object = 0,
    ObjectArray = 1,
    Guid = 2,
    String = 3,
}