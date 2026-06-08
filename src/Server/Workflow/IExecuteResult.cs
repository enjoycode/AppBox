namespace AppBox.Workflow;

public interface IExecuteResult { }

internal sealed class ErrorResult : IExecuteResult
{
    public ErrorResult(string error) { }
}