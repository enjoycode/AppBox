using AppBoxCore;
using Microsoft.CodeAnalysis;
using PixUI;
using PixUI.CodeEditor;

namespace AppBoxDesign;

internal sealed class ExpressionEditor : SingleChildWidget
{
    public ExpressionEditor(DesignHub designContext, ModelBase owner,
        string className, string methodName, string returnType, string parameters)
    {
        _designContext = designContext;
        _owner = owner;
        _className = className;
        _methodName = methodName;
        _returnType = returnType;
        _parameters = parameters;

        _prjId = ProjectId.CreateNewId();
        _docId = DocumentId.CreateNewId(_prjId);
        _textBuffer = new RoslynSourceText(designContext.TypeSystem.Workspace, _docId);
        _controller = new CodeEditorController(
            "Expression.cs",
            _textBuffer,
            new RoslynSyntaxParser(_textBuffer),
            new RoslynCompletionProvider(designContext),
            _docId);

        Child = new CodeEditorWidget(_controller);
    }

    private readonly ModelBase _owner;
    private readonly ProjectId _prjId;
    private readonly DocumentId _docId;
    private readonly string _className;
    private readonly string _methodName;
    private readonly string _returnType;
    private readonly string _parameters;
    private readonly DesignHub _designContext;
    private readonly RoslynSourceText _textBuffer;
    private readonly CodeEditorController _controller;

    protected override void OnMounted()
    {
        base.OnMounted();
        OnLoad();
    }

    protected override void OnUnmounted()
    {
        base.OnUnmounted();
        OnUnload();
    }

    private async void OnLoad()
    {
        if (_textBuffer.HasOpen) return;

        _designContext.TypeSystem.CreateExpressionProject(_prjId, _docId, _owner, "EXP");

        await _textBuffer.Open();
        _textBuffer.SetContent(
            $"static class {_className}\n{{\n    static {_returnType} {_methodName}({_parameters})\n    {{\n        \n    }}\n}}");
        _controller.Document.Open();
    }

    private void OnUnload()
    {
        if (!_textBuffer.HasOpen) return;

        _designContext.TypeSystem.RemoveDocument(_docId);
        _designContext.TypeSystem.RemoveProject(_prjId);
    }
}