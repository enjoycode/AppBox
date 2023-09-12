namespace AppBoxCore;

public readonly struct DynamicFieldInfo
{
    public DynamicFieldInfo(string name, DynamicFieldFlag type)
    {
        Name = name;
        Type = type;
    }

    public readonly string Name;
    public readonly DynamicFieldFlag Type;

    public bool IsNumber => (byte)Type >= 4 && (byte)Type <= 10;

    public bool IsDateTime => Type == DynamicFieldFlag.DateTime;
}