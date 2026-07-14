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
                _originalName ??= _name;
                _name = value;
            }
        }
    }

    public ValueType Type { get; set; }

    public ParameterFlags Flags { get; set; }

    public ModelId? EntityModelId { get; set; }

    /// <summary>
    /// 是否工作流局部变量，非局部变量在启动实例时由外部输入且必需
    /// </summary>
    public bool IsLocalVariable
    {
        get => Flags.HasFlag(ParameterFlags.LocalVariable);
        internal set
        {
            if (value)
                Flags |= ParameterFlags.LocalVariable;
            else
                Flags &= ~(ParameterFlags.LocalVariable);
        }
    }

    public bool IsArray
    {
        get => Flags.HasFlag(ParameterFlags.Array);
        internal set
        {
            if (value)
                Flags |= ParameterFlags.Array;
            else
                Flags &= ~(ParameterFlags.Array);
        }
    }

    public string? Remark { get; set; }

    public void AcceptChanges()
    {
        _originalName = null;
    }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter bs) where TWriter : struct, IOutputStream
    {
        bs.WriteByte((byte)Type);
        bs.WriteByte((byte)Flags);
        bs.WriteString(Name);
        if (Type == ValueType.Entity)
            bs.WriteLong(EntityModelId!.Value);

        if (!string.IsNullOrEmpty(Remark))
        {
            bs.WriteFieldId(1);
            bs.WriteString(Remark);
        }

        bs.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader bs) where TReader : struct, IInputStream
    {
        Type = (ValueType)bs.ReadByte();
        Flags = (ParameterFlags)bs.ReadByte();
        Name = bs.ReadString()!;
        if (Type == ValueType.Entity)
            EntityModelId = bs.ReadLong();

        int propIndex;
        do
        {
            propIndex = bs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Remark = bs.ReadString()!; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(StartNode), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion

    public enum ValueType : byte
    {
        Entity = 0,
        String = 1,
        Integer = 2,
        Double = 3,
        Boolean = 4,
        Guid = 5,
    }

    [Flags]
    public enum ParameterFlags : byte
    {
        None = 0,
        LocalVariable = 1,
        Array = 2,
    }
}