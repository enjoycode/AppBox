using AppBoxClient;
using CodeEditor;

namespace AppBoxDesign;

internal sealed class FormatDocumentCommand : IEditCommand
{
    internal static readonly FormatDocumentCommand Default = new();

    public async void Execute(TextEditor editor)
    {
        var modelIdString = editor.Document.Tag!;

        var res = await Channel.Invoke<TextChange[]>("sys.DesignService.FormatDocument",
            new object?[] { modelIdString });
        if (res == null || res.Length == 0) return;

        //TODO:暂逐个处理，另UpdateCaretPosition至有效位置
        editor.Document.StartUndoGroup();
        foreach (var change in res)
        {
            editor.Document.Replace(change.Offset, change.Length, change.Text ?? string.Empty);
        }
        editor.Document.EndUndoGroup();
    }
}