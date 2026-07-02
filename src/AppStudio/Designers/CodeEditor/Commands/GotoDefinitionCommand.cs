using Microsoft.CodeAnalysis;
using PixUI.CodeEditor;

namespace AppBoxDesign.CodeEditor;

internal static class GotoDefinitionCommand
{
    public static async void Execute(DesignContext designContext, TextEditor editor)
    {
        var designStore = (DesignStore)designContext.DesignUIService;
        var line = editor.Caret.Line;
        var column = editor.Caret.Column;
        var position = editor.Document.PositionToOffset(new TextLocation(column, line));

        var res = await GotoDefinition.Execute(designContext, (DocumentId)editor.Document.Tag!, position);
        if (res == null) return;

        if (res.Value.Target is not null)
            designStore.OpenOrActiveDesigner(res.Value.Target, res); //打开或激活节点
        else
            RunOnCodeEditor(editor.Controller, res.Value); //在当前代码编辑器内跳转
    }

    internal static void RunOnCodeEditor(CodeEditorController controller, ILocation location)
    {
        var doc = controller.Document;
        var pos = doc.OffsetToPosition(location.Offset);
        var end = doc.OffsetToPosition(location.Offset + location.Length);
        controller.SetCaret(pos.Line, pos.Column);
        controller.SetSelection(pos, end);
    }
}