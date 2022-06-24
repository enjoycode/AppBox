using System;
using AppBoxCore;

namespace AppBoxDesign
{
    internal struct CodeProblem : IBinSerializable
    {
        internal int StartLine;
        internal int StartColumn;
        internal int EndLine;
        internal int EndColumn;
        internal bool IsError;
        internal string Message;

        internal string Position =>
            $"[{StartLine + 1}, {StartColumn}] - [{EndLine + 1}, {EndColumn}]";

        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            StartLine = rs.ReadInt();
            StartColumn = rs.ReadInt();
            EndLine = rs.ReadInt();
            EndColumn = rs.ReadInt();
            IsError = rs.ReadBool();
            Message = rs.ReadString()!;
        }
    }
}