using System;
using AppBoxCore;

namespace AppBoxDesign;

internal struct TextChange : IBinSerializable
{
    public int Offset { get; private set; }
    public int Length { get; private set; }
    public string? Text { get; private set; }
    
    public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

    public void ReadFrom(IInputStream rs)
    {
        Offset = rs.ReadInt();
        Length = rs.ReadInt();
        Text = rs.ReadString();
    }
}