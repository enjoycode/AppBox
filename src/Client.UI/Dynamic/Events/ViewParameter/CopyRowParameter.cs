using AppBoxCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

public sealed class CopyRowParameter : IViewParameterSource
{
    internal const string SourceName = "CopyRow";

    public string TypeName => SourceName;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        throw new NotImplementedException();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        throw new NotImplementedException();
    }

    public ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        throw new NotImplementedException();
    }
}