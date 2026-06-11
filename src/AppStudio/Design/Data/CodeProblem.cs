namespace AppBoxDesign;

internal interface IModelProblem
{
    bool IsError { get; }
    string Message { get; }
    string Position { get; }
}

internal sealed class CodeProblem : IModelProblem
{
    public int StartLine { get; init; }
    public int StartColumn { get; init; }
    public int EndLine { get; init; }
    public int EndColumn { get; init; }
    public bool IsError { get; init; }
    public string Message { get; init; } = string.Empty;

    public string Position => $"[{StartLine + 1}, {StartColumn}] - [{EndLine + 1}, {EndColumn}]";
}