namespace AppBoxDesign.AI;

internal readonly struct AIMessage
{
    public string Role { get; init; }
    public string Content { get; init; }
}

internal sealed class AIRequest
{
    public string Model { get; set; } = "qwen3-coder";

    public bool Stream { get; } = false;

    public List<AIMessage> Messages { get; } = [];
}

internal sealed class AIResponse
{
    public string Model { get; set; } = string.Empty;
    public AIMessage Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.MinValue;
    public bool Done { get; set; }
    public string DoneReason { get; set; } = string.Empty;
    public int TotalDuration { get; set; }
    public int LoadDuration { get; set; }
    public int PromptEvalCount { get; set; }
    public int PromptEvalDuration { get; set; }
    public int EvalCount { get; set; }
    public int EvalDuration { get; set; }
}