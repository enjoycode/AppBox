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

        internal string Position => $"[{StartLine + 1}, {StartColumn}] - [{EndLine + 1}, {EndColumn}]";


#if __APPBOXDESIGN__
        public void WriteTo(IOutputStream ws)
        {
            ws.WriteInt(StartLine);
            ws.WriteInt(StartColumn);
            ws.WriteInt(EndLine);
            ws.WriteInt(EndColumn);
            ws.WriteBool(IsError);
            ws.WriteString(Message);
        }
        
        public void ReadFrom(IInputStream rs) => throw new NotSupportedException();
#else
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
#endif
    }
}