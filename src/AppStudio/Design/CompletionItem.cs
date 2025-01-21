using System;
using AppBoxCore;
using CodeEditor;

namespace AppBoxDesign;

public struct CompletionItem : ICompletionItem
{
    public CompletionItemKind Kind { get; private set; }
    public string Label { get; private set; }
    public string? InsertText { get; private set; }
    public string? Detail { get; private set; }

    // public void WriteTo(IOutputStream ws) => throw new NotSupportedException();
    //
    // public void ReadFrom(IInputStream rs)
    // {
    //     Kind = (CompletionItemKind)rs.ReadByte();
    //     Label = rs.ReadString()!;
    //     InsertText = rs.ReadString();
    //     Detail = rs.ReadString();
    // }
}