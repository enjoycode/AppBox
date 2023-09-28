using System;
using AppBoxClient;
using CodeEditor;

namespace AppBoxDesign;

internal sealed class GotoDefinitionCommand : IEditCommand
{
    public GotoDefinitionCommand(DesignStore designStore)
    {
        _designStore = designStore;
    }

    private readonly DesignStore _designStore;

    public async void Execute(TextEditor editor)
    {
        var modelIdString = editor.Document.Tag!;
        var line = editor.Caret.Line;
        var column = editor.Caret.Column;

        var res = await Channel.Invoke<ReferenceVO?>("sys.DesignService.GotoDefinition",
            new object?[] { modelIdString, line, column });
        if (res == null) return;

        //找到对应的节点, TODO: 考虑优化当前节点即目标节点
        var node = _designStore.FindDesignNodeById(res.ModelId);
        if (node != null)
            _designStore.OpenOrActiveDesigner(node, res); //打开或激活节点
    }

    internal static void RunOnCodeEditor(CodeEditorController controller, ReferenceVO reference)
    {
        var doc = controller.Document;
        var pos = doc.OffsetToPosition(reference.Offset);
        var end = doc.OffsetToPosition(reference.Offset + reference.Length);
        controller.SetCaret(pos.Line, pos.Column);
        controller.SetSelection(pos, end);
    }
}