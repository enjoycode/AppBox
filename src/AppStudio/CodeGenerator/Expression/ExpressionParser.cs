using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal sealed partial class ExpressionParser : CSharpSyntaxVisitor<ParseResult>
{
    public ExpressionParser(SemanticModel semanticModel, ExpressionParserOptions options = ExpressionParserOptions.None,
        DesignContext? designContext = null)
    {
        _semanticModel = semanticModel;
        _options = options;
        if (_options.HasFlag(ExpressionParserOptions.DynamicEntityMemberAccess) && designContext == null)
            throw new ArgumentNullException(nameof(designContext));
        if (designContext != null)
            _designContext = designContext;
    }

    private readonly SemanticModel _semanticModel;
    private readonly ExpressionParserOptions _options;
    private readonly DesignContext _designContext = null!;

    public static SyntaxTree Parse(string code)
    {
        var parseOptions = new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp13);
        return CSharpSyntaxTree.ParseText(code, parseOptions);
    }

    /// <summary>
    /// 获取SemanticModel,并检查语义错误
    /// </summary>
    public static SemanticModel GetSemanticModel(SyntaxTree syntaxTree)
    {
        var compilationOptions = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
            .WithNullableContextOptions(NullableContextOptions.Enable);

        var compilation = CSharpCompilation.Create("Expression", options: compilationOptions)
            .AddReferences(MetadataReferences.CoreLib)
            .AddSyntaxTrees(syntaxTree);
        var semanticModel = compilation.GetSemanticModel(syntaxTree);
        var diagnostics = (IEnumerable<Diagnostic>)semanticModel.GetDiagnostics();
        var errors = diagnostics.Count(d => d.Severity == DiagnosticSeverity.Error);
        if (errors > 0)
            throw new Exception("表达式存在语义错误");
        return semanticModel;
    }

    public static Expression ParseCode(string code, bool singleLine = true)
    {
        var syntaxTree = CSharpSyntaxTree.ParseText(code);
        var root = syntaxTree.GetCompilationUnitRoot();
        var semanticModel = GetSemanticModel(syntaxTree);

        var methodDecl = root.DescendantNodes().OfType<MethodDeclarationSyntax>().First();
        if (methodDecl.Body is { Statements.Count: > 1 })
            throw new NotImplementedException("Parse block body");

        if (methodDecl.ExpressionBody != null)
            throw new NotImplementedException("Parse expression body");

        var firstStatement = methodDecl.Body!.Statements.FirstOrDefault();
        if (firstStatement == null)
            throw new Exception("Can't find statement");
        SyntaxNode syntaxNode = firstStatement;
        if (singleLine)
        {
            if (firstStatement is not ReturnStatementSyntax returnNode)
                throw new Exception("表达式方法不是单行返回语句");
            syntaxNode = returnNode.Expression!;
        }

        var parser = new ExpressionParser(semanticModel);
        return parser.Visit(syntaxNode).Expression;
    }
}

[Flags]
internal enum ExpressionParserOptions
{
    None = 0,

    /// <summary>
    /// 目前仅用于工作流表达式访问实体成员
    /// </summary>
    /// <remarks>
    /// 因为工作流的实体类型参数可能在工作流实例创建后发生更改(如修改实体成员名称或添加删除实体成员)
    /// 所以解析MemberExpression时其ExpressionTypeInfo.Type=Model,其成员名称实际为成员标识
    /// </remarks>
    DynamicEntityMemberAccess = 1,
    
    /// <summary>
    /// 用于查询的表达式
    /// </summary>
    /// <remarks>
    /// 比如实体模型的动态查询过滤条件
    /// </remarks>
    UsedForQuery = 2,
}