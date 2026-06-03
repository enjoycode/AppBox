using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using PixUI;
using PixUI.CodeEditor;

namespace AppBoxDesign;

/// <summary>
/// 表达式编辑器
/// </summary>
internal sealed class ExpressionEditor : SingleChildWidget
{
    public ExpressionEditor(DesignHub designContext, ExpressionInfo expressionInfo)
    {
        _designContext = designContext;
        _expressionInfo = expressionInfo;

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

    private readonly DesignHub _designContext;
    private readonly ExpressionInfo _expressionInfo;
    private readonly ProjectId _prjId;
    private readonly DocumentId _docId;
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

        var projectName = $"{_expressionInfo.Owner.Name}_EXP";
        _designContext.TypeSystem.CreateExpressionProject(_prjId, _docId, projectName, _expressionInfo.PartialCode);

        await _textBuffer.Open();
        _textBuffer.SetContent(BuildCode());
        _controller.Document.Open();
    }

    private void OnUnload()
    {
        if (!_textBuffer.HasOpen) return;

        _designContext.TypeSystem.RemoveDocument(_docId);
        _designContext.TypeSystem.RemoveProject(_prjId);
    }

    private string BuildCode()
    {
        var sb = new StringBuilder();
        if (_expressionInfo.IsStatic)
            sb.Append("static ");
        if (_expressionInfo.IsPartial)
            sb.Append("partial ");
        sb.Append("class ");
        sb.Append(_expressionInfo.ClassName);
        sb.Append('\n');
        sb.Append("{\n");
        sb.Append("    ");
        if (_expressionInfo.IsStatic)
            sb.Append("static ");
        sb.Append(_expressionInfo.ReturnType);
        sb.Append(' ');
        sb.Append(_expressionInfo.MethodName);
        sb.Append('(');
        sb.Append(_expressionInfo.Parameters);
        sb.Append(")\n");
        sb.Append("    {\n");
        sb.Append(_expressionInfo.ExpressionCode);
        sb.Append("    }\n");
        sb.Append('}');
        return sb.ToString();
    }
}

internal sealed class ExpressionInfo
{
    public ModelBase Owner { get; init; } = null!;
    public bool IsStatic { get; init; }
    public bool IsPartial => !string.IsNullOrEmpty(PartialCode);
    public required string ClassName { get; init; }
    public required string MethodName { get; init; }
    public string ReturnType { get; init; } = "void";
    public string Parameters { get; init; } = string.Empty;
    public string PartialCode { get; init; } = string.Empty;
    public string ExpressionCode { get; init; } = string.Empty;
}