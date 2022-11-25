using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

/// <summary>
/// 检查代码的语义问题
/// </summary>
internal sealed class GetProblems : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var isExpression = args.GetBool();
        if (isExpression)
            throw new NotImplementedException();

        ModelId modelId = args.GetString()!;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception("Can't find model");
        var document = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId)!;
        var semanticModel = await document.GetSemanticModelAsync();
        var diagnostics = semanticModel!.GetDiagnostics();
        return AnyValue.From(diagnostics.Select(MakeProblem).ToList());
    }

    private static CodeProblem MakeProblem(Diagnostic diagnostic)
    {
        var span = diagnostic.Location.GetMappedLineSpan();
        return new CodeProblem()
        {
            StartLine = span.StartLinePosition.Line,
            StartColumn = span.StartLinePosition.Character,
            EndLine = span.EndLinePosition.Line,
            EndColumn = span.EndLinePosition.Character,
            IsError = diagnostic.Severity == DiagnosticSeverity.Error,
            Message = diagnostic.GetMessage(),
        };
    }
}