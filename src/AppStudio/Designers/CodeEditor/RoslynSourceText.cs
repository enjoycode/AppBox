using CodeEditor;
using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

/// <summary>
/// 包装Roslyn的SourceText为ITextBuffer
/// </summary>
public sealed class RoslynSourceText : ITextBuffer
{
    public RoslynSourceText(ModelNode modelNode)
    {
        _modelNode = modelNode;
    }

    private readonly ModelNode _modelNode;
    private SourceText _sourceText = null!;

    public bool HasOpen => _sourceText != null!;

    internal Microsoft.CodeAnalysis.Document GetRoslynDocument() =>
        DesignHub.Current.TypeSystem.Workspace.CurrentSolution.GetDocument(_modelNode.RoslynDocumentId)!;

    public async Task Open()
    {
        var typeSystem = DesignHub.Current.TypeSystem;
        //先判断是否已经打开，是则先关闭，主要用于签出后重新加载
        var docId = _modelNode.RoslynDocumentId!;
        if (typeSystem.Workspace.IsDocumentOpen(docId))
            typeSystem.Workspace.CloseDocument(docId);

        await typeSystem.Workspace.OpenDocumentAsync(docId);

        //从已加载的设计树对应的RoslynDocument中获取源码
        _sourceText = await GetRoslynDocument().GetTextAsync();
    }

    public int Length => _sourceText.Length;

    public SourceText CurrentVersion => _sourceText;

    public void Insert(int offset, string text)
    {
        _sourceText = _sourceText.Replace(offset, 0, text);
        DesignHub.Current.TypeSystem.Workspace.OnDocumentChanged(_modelNode.RoslynDocumentId!, _sourceText);
    }

    public void Remove(int offset, int length)
    {
        _sourceText = _sourceText.Replace(offset, length, string.Empty);
        DesignHub.Current.TypeSystem.Workspace.OnDocumentChanged(_modelNode.RoslynDocumentId!, _sourceText);
    }

    public void Replace(int offset, int length, string text)
    {
        _sourceText = _sourceText.Replace(offset, length, text);
        DesignHub.Current.TypeSystem.Workspace.OnDocumentChanged(_modelNode.RoslynDocumentId!, _sourceText);
    }

    public string GetText(int offset, int length)
    {
        return _sourceText.ToString(new TextSpan(offset, length));
    }

    public char GetCharAt(int offset) => _sourceText[offset];

    public void SetContent(string text)
    {
        throw new NotImplementedException();
    }

    public void CopyTo(Span<char> dest, int offset, int count)
    {
        throw new NotImplementedException();
    }
}