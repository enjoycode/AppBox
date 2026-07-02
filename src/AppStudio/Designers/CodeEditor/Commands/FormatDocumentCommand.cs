using Microsoft.CodeAnalysis;
using PixUI.CodeEditor;

namespace AppBoxDesign.CodeEditor;

internal static class FormatDocumentCommand
{
    public static async void Execute(DesignContext designContext, TextEditor editor)
    {
        var changes = await FormatDocument.Execute(designContext, (DocumentId)editor.Document.Tag!);

        //TODO:暂逐个处理，另UpdateCaretPosition至有效位置
        editor.Document.StartUndoGroup();
        foreach (var change in changes)
        {
            editor.Document.Replace(change.Span.Start, change.Span.Length, change.NewText ?? string.Empty);
        }

        editor.Document.EndUndoGroup();
    }
}