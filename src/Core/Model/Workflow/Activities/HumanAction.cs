namespace AppBoxCore;

/// <summary>
/// 人工活动的动作
/// </summary>
public sealed class HumanAction : IBinSerializable
{
    private string? _originalName;

    private string _name = string.Empty;

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

    // public IImageSource Icon { get; set; }

    //考虑加入Expression ActionBeforeSubmit {get;set;}

    #region ====Serialization====

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteFieldId(1);
        ws.WriteString(_name);

        ws.WriteFieldEnd();
    }

    public void ReadFrom(IInputStream rs)
    {
        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: _name = rs.ReadString() ?? string.Empty; break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(HumanAction), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}