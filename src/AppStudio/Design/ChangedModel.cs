using System;
using AppBoxCore;

namespace AppBoxDesign
{
    internal sealed class ChangedModel : IBinSerializable
    {
        public string ModelType { get; private set; }
        
        public string ModelId { get; private set; }
        
        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            ModelType = rs.ReadString()!;
            ModelId = rs.ReadString()!;
        }
    }
}