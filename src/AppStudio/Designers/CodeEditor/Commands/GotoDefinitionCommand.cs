using System;
using AppBoxClient;
using AppBoxCore;
using CodeEditor;

namespace AppBoxDesign;

internal static class GotoDefinitionCommand
{
    public static async void Execute(DesignStore designStore, TextEditor editor)
    {
        ModelId modelId = editor.Document.Tag!;
        var line = editor.Caret.Line;
        var column = editor.Caret.Column;
        var position = editor.Document.PositionToOffset(new TextLocation(column, line));

        var res = await GotoDefinition.Execute(modelId, position);
        if (res == null) return;
        designStore.OpenOrActiveDesigner(res.Value.Target, res); //打开或激活节点
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