using System.Text;
using AppBoxCore;
using AppBoxDesign.CodeGenerator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using PixUI;
using PixUI.CodeEditor;

namespace AppBoxDesign;

/// <summary>
/// 表达式编辑器
/// </summary>
internal sealed class ExpressionEditor : SingleChildWidget
{
    public ExpressionEditor(DesignContext designContext, ExpressionEditorInfo expressionEditorInfo)
    {
        _designContext = designContext;
        _expressionEditorInfo = expressionEditorInfo;

        _prjId = ProjectId.CreateNewId();
        _docId = DocumentId.CreateNewId(_prjId);
        _textBuffer = new RoslynSourceText(designContext.Workspace, _docId);
        _controller = new CodeEditorController(
            "Expression.cs",
            _textBuffer,
            new RoslynSyntaxParser(_textBuffer),
            new RoslynCompletionProvider(designContext),
            _docId);

        Child = new CodeEditorWidget(_controller);
    }

    private readonly DesignContext _designContext;
    private readonly ExpressionEditorInfo _expressionEditorInfo;
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

        var projectName = $"{_expressionEditorInfo.Owner.Name}_EXP";
        _designContext.CreateExpressionProject(_prjId, _docId, projectName, _expressionEditorInfo.PartialCode);

        await _textBuffer.Open();
        _textBuffer.SetContent(BuildCode());
        _controller.Document.Open();
    }

    private void OnUnload()
    {
        if (!_textBuffer.HasOpen) return;

        _designContext.RemoveDocument(_docId);
        _designContext.RemoveProject(_prjId);
    }

    private string BuildCode()
    {
        var sb = new StringBuilder();
        if (_expressionEditorInfo.IsStatic)
            sb.Append("static ");
        if (_expressionEditorInfo.IsPartial)
            sb.Append("partial ");
        sb.Append("class ");
        sb.Append(_expressionEditorInfo.ClassName);
        sb.Append('\n');
        sb.Append("{\n");
        sb.Append("    ");
        if (_expressionEditorInfo.IsStatic)
            sb.Append("static ");
        sb.Append(_expressionEditorInfo.ReturnType);
        sb.Append(' ');
        sb.Append(_expressionEditorInfo.MethodName);
        sb.Append('(');
        sb.Append(_expressionEditorInfo.Parameters);
        sb.Append(")\n");
        sb.Append("    {\n");
        sb.Append(_expressionEditorInfo.ExpressionCode);
        sb.Append("    }\n");
        sb.Append('}');
        return sb.ToString();
    }

    public async Task<Expression?> ParseToExpression(ExpressionParserOptions options)
    {
        var doc = _designContext.Workspace.CurrentSolution.GetDocument(_docId);
        if (doc == null) throw new Exception("Could not find expression's document");

        var syntaxTree = await doc.GetSyntaxTreeAsync();
        if (syntaxTree == null) throw new Exception("Could not find expression's syntax tree");

        //先判断有无表达式，即Body是否为空
        var root = syntaxTree.GetCompilationUnitRoot();
        var methodDecl = root.DescendantNodes().OfType<MethodDeclarationSyntax>().FirstOrDefault();
        if (methodDecl == null) return null;
        if (methodDecl.ExpressionBody != null) throw new NotImplementedException("Parse expression body");
        if (methodDecl.Body == null || methodDecl.Body.Statements.Count == 0) return null;
        //检查语义
        var semanticModel = await doc.GetSemanticModelAsync();
        if (semanticModel == null) throw new Exception("Could not find expression's semantic model");
        var diagnostics = (IEnumerable<Diagnostic>)semanticModel.GetDiagnostics();
        var errors = diagnostics.Count(d => d.Severity == DiagnosticSeverity.Error);
        if (errors > 0)
            throw new Exception("表达式存在语义错误");

        SyntaxNode targetNode = methodDecl.Body;
        if (methodDecl.Body.Statements is [ReturnStatementSyntax returnStatement])
        {
            // Single line return statement
            targetNode = returnStatement.Expression!;
        }

        //开始转换为表达式
        var parser = new ExpressionParser(semanticModel, options, _designContext);
        return parser.Visit(targetNode).Expression;
    }
}

/// <summary>
/// 表达式编辑器所需要的相关信息
/// </summary>
internal sealed class ExpressionEditorInfo
{
    public ModelBase Owner { get; init; } = null!;

    public bool IsStatic { get; init; }

    // public bool IsIgnoreThis { get; init; } = true;
    public bool IsPartial => !string.IsNullOrEmpty(PartialCode);
    public required string ClassName { get; init; }
    public required string MethodName { get; init; }
    public string ReturnType { get; init; } = "void";
    public string Parameters { get; init; } = string.Empty;
    public string PartialCode { get; init; } = string.Empty;
    public string ExpressionCode { get; init; } = string.Empty;

    //TODO: ParserOptions and project Dependencies
}