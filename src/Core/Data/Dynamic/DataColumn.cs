namespace AppBoxCore;

public readonly struct DataColumn
{
    public DataColumn(string name, DataType type)
    {
        Name = name;
        Type = type;
    }

    public readonly string Name;
    public readonly DataType Type;

    public bool IsNumber => (byte)Type >= 4 && (byte)Type <= 10;

    public bool IsString => Type == DataType.String;

    public bool IsDateTime => Type == DataType.DateTime;
}