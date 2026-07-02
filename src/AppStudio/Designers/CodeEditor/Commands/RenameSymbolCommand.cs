using Microsoft.CodeAnalysis;
using PixUI.CodeEditor;

namespace AppBoxDesign.CodeEditor;

internal static class RenameSymbolCommand
{
    public static async void Execute(DesignContext designContext, TextEditor editor)
    {
        var line = editor.Caret.Line;
        var column = editor.Caret.Column;
        var position = editor.Document.PositionToOffset(new TextLocation(column, line));
        await RenameSymbol.Execute(designContext, editor, (DocumentId)editor.Document.Tag!, position);
    }
}