using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

internal static class GetProblems
{
    internal static async Task<IList<CodeProblem>> Execute(ModelNode modelNode)
    {
        var hub = DesignHub.Current;
        var document = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId)!;
        var semanticModel = await document.GetSemanticModelAsync();
        return semanticModel!.GetDiagnostics()
            .Select(MakeProblem)
            .ToList();
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