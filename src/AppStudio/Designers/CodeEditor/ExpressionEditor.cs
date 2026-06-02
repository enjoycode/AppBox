using AppBoxCore;
using Microsoft.CodeAnalysis;
using PixUI;
using PixUI.CodeEditor;

namespace AppBoxDesign;

internal sealed class ExpressionEditor : SingleChildWidget
{
    public ExpressionEditor(DesignHub designContext, ModelBase owner)
    {
        _designContext = designContext;
        _owner = owner;

        _prjId = ProjectId.CreateNewId();
        _docId = DocumentId.CreateNewId(_prjId);
        _textBuffer = new RoslynSourceText(designContext.TypeSystem.Workspace, _docId);
        _controller = new CodeEditorController(
            "Expression.cs",
            _textBuffer,
            new RoslynSyntaxParser(_textBuffer),
            new RoslynCompletionProvider(designContext));

        Child = new CodeEditorWidget(_controller);
    }

    private readonly ModelBase _owner;
    private readonly ProjectId _prjId;
    private readonly DocumentId _docId;
    private readonly DesignHub _designContext;
    private readonly RoslynSourceText _textBuffer;
    private readonly CodeEditorController _controller;

    protected override void OnMounted()
    {
        base.OnMounted();
        CreateAndLoad();
    }

    private async void CreateAndLoad()
    {
        if (_textBuffer.HasOpen) return;

        _designContext.TypeSystem.CreateExpressionProject(_prjId, _docId, _owner, "EXP");

        await _textBuffer.Open();
        _textBuffer.SetContent("static class Expression\n{\n static bool Exp()\n{\n return true;\n}");
        _controller.Document.Open();
    }
}