using System;

namespace PixUI
{
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property | AttributeTargets.Method)]
    public sealed class TSRenameAttribute : Attribute
    {
        public TSRenameAttribute(string newName) { }
    }
}