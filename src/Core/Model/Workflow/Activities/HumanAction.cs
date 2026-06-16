namespace AppBoxCore;

/// <summary>
/// 人工活动的动作
/// </summary>
public sealed class HumanAction : IBinSerializable
{
    public HumanAction() { }

    public HumanAction(string name)
    {
        _name = name;
    }

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

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(_name);
        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        _name = rs.ReadString() ?? string.Empty;
        rs.ReadFieldId();
    }

    #endregion
}