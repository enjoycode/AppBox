using System.Net.Http.Json;
using System.Text.Json;

namespace AppBoxDesign.AI;

/// <summary>
/// 一个AI对话，保存对话历史，支持Undo最后一次对话记录
/// </summary>
internal abstract class AIChat : IDisposable
{
    protected AIChat(string model, string url /*TODO: 选项*/)
    {
        _model = model;
        _url = url;
    }

    private readonly string _model;
    private readonly string _url;
    private readonly HttpClient _httpClient = new();
    private readonly List<AIMessage> _history = [];

    private static readonly JsonSerializerOptions JsonRequestSerializerOptions = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    private static readonly JsonSerializerOptions JsonResponseSerializerOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    };


    protected abstract string BuildSystemPrompt();

    protected virtual string BuildUserPrompt(string userPrompt, bool isNew) => userPrompt;

    protected abstract void ParseAIResponse(AIMessage responseMessage);

    /// <summary>
    /// Send user prompt and wait for response, then call ParseAIResponse()
    /// </summary>
    public async Task SendUserPrompt(string userPrompt)
    {
        var request = new AIRequest() { Model = _model };

        if (_history.Count == 0) // 初次对话
        {
            // build system prompt
            var systemMessage = new AIMessage() { Role = "system", Content = BuildSystemPrompt() };
            request.Messages.Add(systemMessage);
            _history.Add(systemMessage);
            // build user prompt
            var userMessage = new AIMessage() { Role = "user", Content = BuildUserPrompt(userPrompt, true) };
            request.Messages.Add(userMessage);
            _history.Add(userMessage);
        }
        else
        {
            // add history messages
            request.Messages.AddRange(_history);
            // add user message
            var userMessage = new AIMessage() { Role = "user", Content = BuildUserPrompt(userPrompt, false) };
            request.Messages.Add(userMessage);
            _history.Add(userMessage);
        }

        // Send POST request
        var content = JsonContent.Create(request, null, JsonRequestSerializerOptions);
        var httpResponse = await _httpClient.PostAsync(_url, content);
        // Ensure success
        httpResponse.EnsureSuccessStatusCode();
        var responseStream = await httpResponse.Content.ReadAsStreamAsync();
        // Deserialize response
        var response = JsonSerializer.Deserialize<AIResponse>(responseStream, JsonResponseSerializerOptions);
        if (response == null)
            throw new Exception("No response from server");

        // Add to history and parse response
        _history.Add(response.Message);
        ParseAIResponse(response.Message);
    }

    public void Dispose()
    {
        _httpClient.Dispose();
    }
}