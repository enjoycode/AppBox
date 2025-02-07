using System;
using AppBoxCore;

namespace AppBoxDesign;

internal struct CodeProblem
{
    internal int StartLine;
    internal int StartColumn;
    internal int EndLine;
    internal int EndColumn;
    internal bool IsError;
    internal string Message;

    internal string Position => $"[{StartLine + 1}, {StartColumn}] - [{EndLine + 1}, {EndColumn}]";
}