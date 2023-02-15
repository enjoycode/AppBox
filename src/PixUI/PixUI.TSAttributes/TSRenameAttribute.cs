using System;

namespace PixUI
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property | AttributeTargets.Method |
                    AttributeTargets.Delegate | AttributeTargets.Class | AttributeTargets.Struct)]
    public sealed class TSRenameAttribute : Attribute
    {
        public TSRenameAttribute(string newName) { }
    }
}